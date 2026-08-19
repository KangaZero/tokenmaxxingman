import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { skillsRoot } from '../paths.js';

/** The two documents each bundled skill ships. */
export const SKILL_SECTIONS = ['skill', 'examples'] as const;
export type SkillSection = (typeof SKILL_SECTIONS)[number];

const SECTION_FILES: Readonly<Record<SkillSection, string>> = {
  skill: 'SKILL.md',
  examples: 'EXAMPLES.md',
};

/**
 * Skill directory names must be lowercase kebab-case.
 *
 * This is the single source of truth. It is applied both when *discovering*
 * skills and when *reading* them — previously discovery accepted anything and
 * only reads validated, so a directory named `BadName` was advertised in
 * `resources/list`, in `prompts/list`, and in completions, then failed on every
 * attempt to read it.
 */
const VALID_SKILL_NAME = /^[a-z0-9][a-z0-9-]*$/;

export interface SkillDescriptor {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly sections: readonly SkillSection[];
}

/** Strip an unquoted trailing `# comment` from a YAML scalar. */
function stripComment(value: string): string {
  let quote: string | null = null;
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    if (quote !== null) {
      if (char === '\\') {
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    // A `#` only opens a comment when preceded by whitespace or at the start.
    if (char === '#' && (i === 0 || /\s/.test(value[i - 1] ?? ''))) {
      return value.slice(0, i);
    }
  }
  return value;
}

/** Remove balanced surrounding quotes and unescape the quote character. */
function unquote(value: string): string {
  const first = value[0];
  const last = value[value.length - 1];
  if (value.length >= 2 && (first === '"' || first === "'") && last === first) {
    return value.slice(1, -1).replace(new RegExp(`\\\\${first}`, 'g'), first);
  }
  return value;
}

export interface FrontMatter {
  readonly fields: Readonly<Record<string, string>>;
  /** False when the block is absent or has no closing `---`. */
  readonly wellFormed: boolean;
}

/**
 * Minimal front-matter reader for the handful of scalar fields we need.
 *
 * WHY not a YAML dependency: the skill front matter is a fixed, hand-authored
 * shape (`name`, `version`, `description` as a folded `>` or literal `|` block,
 * plus a `trigger` sequence we ignore). A focused reader beats adding a parser
 * to the runtime dependency set for a format we also author.
 *
 * It is deliberately conservative about the cases that previously produced
 * silently wrong metadata:
 *   - CRLF line endings (`\r` defeated the old `$`-anchored pattern, so every
 *     field was dropped and every skill reported version "0.0.0")
 *   - `#` comments after a scalar
 *   - literal `|` blocks, which preserve newlines, vs folded `>`, which do not
 *   - implicit multi-line plain scalars with no block indicator
 *   - continuation lines beginning with `- `, which are part of a block scalar
 *     and must NOT be mistaken for a sequence item
 *   - a missing closing `---`, which previously let the document body be parsed
 *     as front matter
 */
export function parseFrontMatter(raw: string): FrontMatter {
  const lines = raw.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    return { fields: {}, wellFormed: false };
  }

  const fields: Record<string, string> = {};
  let closed = false;
  let key: string | null = null;
  let style: 'folded' | 'literal' | 'plain' | null = null;
  let block: string[] = [];

  const flush = (): void => {
    if (key !== null && block.length > 0) {
      fields[key] =
        style === 'literal'
          ? block.join('\n')
          : block.join(' ').replace(/[^\S\n]+/g, ' ').trim();
    }
    key = null;
    style = null;
    block = [];
  };

  for (const line of lines.slice(1)) {
    if (line.trim() === '---') {
      closed = true;
      break;
    }

    const isIndented = /^\s+\S/.test(line);
    // Only an unindented `key:` starts a new field. An indented one belongs to
    // the block scalar currently being accumulated.
    const scalar = isIndented ? null : /^([a-zA-Z_][\w-]*):[ \t]*(.*)$/.exec(line);

    if (scalar !== null) {
      flush();
      const name = scalar[1];
      if (name === undefined) {
        continue;
      }
      const rest = stripComment(scalar[2] ?? '').trim();
      if (/^[|>][+-]?$/.test(rest)) {
        key = name;
        style = rest.startsWith('|') ? 'literal' : 'folded';
      } else if (rest !== '') {
        fields[name] = unquote(rest);
      } else {
        // Bare `key:` — an implicit multi-line plain scalar may follow.
        key = name;
        style = 'plain';
      }
      continue;
    }

    if (key !== null && isIndented) {
      // Inside a block scalar every indented line is content, including one
      // that starts with `- `. Only a `trigger:`-style sequence reaches here
      // with style 'plain', which we discard below.
      if (style === 'plain' && /^\s*-\s/.test(line)) {
        flush();
        continue;
      }
      block.push(style === 'literal' ? line.replace(/^\s+/, '') : line.trim());
    }
  }
  flush();

  // A block with no terminator is a parse error, not partial data. Returning the
  // fields anyway meant the document BODY was scanned for `key: value` lines, so
  // prose like "Trigger: user says hello" became a metadata field.
  return closed ? { fields, wellFormed: true } : { fields: {}, wellFormed: false };
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0]?.toUpperCase() + part.slice(1)))
    .join(' ');
}

function readSkill(name: string): SkillDescriptor | null {
  if (!VALID_SKILL_NAME.test(name)) {
    // Advertising a name we would refuse to read is worse than ignoring it.
    process.stderr.write(`tokenmaxxingman: skipping skill "${name}" — not lowercase kebab-case\n`);
    return null;
  }
  const dir = resolve(skillsRoot, name);
  let raw: string;
  try {
    raw = readFileSync(resolve(dir, SECTION_FILES.skill), 'utf-8');
  } catch {
    return null;
  }
  const { fields, wellFormed } = parseFrontMatter(raw);
  if (!wellFormed) {
    process.stderr.write(
      `tokenmaxxingman: skill "${name}" has no closing '---' in its front matter\n`,
    );
  }
  const sections = SKILL_SECTIONS.filter((section) => {
    try {
      return statSync(resolve(dir, SECTION_FILES[section])).isFile();
    } catch {
      return false;
    }
  });
  return {
    name,
    title: titleCase(fields['name'] ?? name),
    description: fields['description'] ?? `The ${name} skill.`,
    version: fields['version'] ?? '0.0.0',
    sections,
  };
}

/**
 * Discover the bundled skills once, at server construction.
 *
 * The skills ship inside the package and never change at runtime, so a single
 * eager read is cheaper than stat-ing the directory on every `resources/list`.
 * Symlinked entries are included deliberately (`withFileTypes` reports a
 * symlink as neither file nor directory, so they are resolved explicitly) but
 * `readSkillSection` still confines every read to the skills root.
 */
export function discoverSkills(): readonly SkillDescriptor[] {
  let entries: readonly string[];
  try {
    entries = readdirSync(skillsRoot)
      .filter((name) => {
        try {
          return statSync(resolve(skillsRoot, name)).isDirectory();
        } catch {
          return false;
        }
      })
      .sort();
  } catch {
    return [];
  }
  return entries
    .map(readSkill)
    .filter((skill): skill is SkillDescriptor => skill !== null && skill.sections.length > 0);
}

export function skillSectionPath(name: string, section: SkillSection): string {
  return resolve(skillsRoot, name, SECTION_FILES[section]);
}

/**
 * Read one bundled skill document.
 *
 * Two independent guards, because `name` arrives from an MCP client and is
 * interpolated into a filesystem path:
 *   1. the kebab-case pattern, which rejects `..`, separators, and `%`
 *   2. a realpath containment check, which rejects a symlink inside the skills
 *      tree pointing anywhere outside it
 */
export function readSkillSection(name: string, section: SkillSection): string {
  if (!VALID_SKILL_NAME.test(name)) {
    throw new Error(`invalid skill name "${name}" — expected lowercase kebab-case`);
  }
  const target = skillSectionPath(name, section);
  let real: string;
  let rootReal: string;
  try {
    real = realpathSync(target);
    rootReal = realpathSync(skillsRoot);
  } catch {
    throw new Error(`no ${SECTION_FILES[section]} for skill "${name}"`);
  }
  if (real !== rootReal && !real.startsWith(rootReal + sep)) {
    throw new Error(`skill "${name}" resolves outside the bundled skills directory`);
  }
  try {
    return readFileSync(real, 'utf-8');
  } catch {
    throw new Error(`no ${SECTION_FILES[section]} for skill "${name}"`);
  }
}

export function skillSectionFileName(section: SkillSection): string {
  return SECTION_FILES[section];
}
