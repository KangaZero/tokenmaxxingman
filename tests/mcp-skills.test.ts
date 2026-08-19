import { describe, expect, it } from 'vitest';
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { discoverSkills, parseFrontMatter, readSkillSection } from '../src/mcp/skills.js';
import { skillsRoot } from '../src/paths.js';

/**
 * The front-matter reader is hand-rolled to avoid a runtime YAML dependency, so
 * it needs direct tests: reaching it only through `discoverSkills` means the
 * suite is coupled to whatever the eight bundled skills happen to contain, and
 * an entire class of parse failure is invisible.
 */
describe('parseFrontMatter', () => {
  it('reads a simple scalar block', () => {
    const { fields, wellFormed } = parseFrontMatter('---\nname: foo\nversion: "1.2.3"\n---\nbody');
    expect(wellFormed).toBe(true);
    expect(fields['name']).toBe('foo');
    expect(fields['version']).toBe('1.2.3');
  });

  it('handles CRLF line endings', () => {
    // Regression: `.` excludes \r and `$` would not match before it, so every
    // field was silently dropped and every skill reported version "0.0.0".
    // Git's default core.autocrlf=true on Windows reproduces this on checkout.
    const { fields } = parseFrontMatter('---\r\nname: foo\r\nversion: "9.9.9"\r\n---\r\nbody');
    expect(fields['name']).toBe('foo');
    expect(fields['version']).toBe('9.9.9');
  });

  it('strips an unquoted trailing comment', () => {
    const { fields } = parseFrontMatter('---\nname: foo # this is a comment\n---\n');
    expect(fields['name']).toBe('foo');
  });

  it('keeps a # that is inside quotes', () => {
    const { fields } = parseFrontMatter('---\nname: "foo # bar"\n---\n');
    expect(fields['name']).toBe('foo # bar');
  });

  it('folds a > block onto one line and preserves newlines in a | block', () => {
    const folded = parseFrontMatter('---\ndescription: >\n  line one\n  line two\n---\n');
    expect(folded.fields['description']).toBe('line one line two');

    const literal = parseFrontMatter('---\ndescription: |\n  line one\n  line two\n---\n');
    expect(literal.fields['description']).toBe('line one\nline two');
  });

  it('keeps a dashed line that belongs to a block scalar', () => {
    // The `- ` skip exists to ignore the `trigger:` sequence. It must not eat a
    // legitimate dashed clause out of a description — okay-boomer's description
    // is one em-dash away from this shape.
    const { fields } = parseFrontMatter(
      '---\ndescription: >\n  rewrites code using\n  - var, XHR, jQuery\n  and other relics\n---\n',
    );
    expect(fields['description']).toContain('var, XHR, jQuery');
  });

  it('still discards a trigger sequence', () => {
    const { fields } = parseFrontMatter('---\nname: foo\ntrigger:\n  - "/foo"\n  - "do foo"\n---\n');
    expect(fields['name']).toBe('foo');
    expect(fields['trigger']).toBeUndefined();
  });

  it('reports a missing closing --- rather than parsing the document body', () => {
    // Previously the body was parsed as front matter, so prose like
    // "Trigger: user says hello" became a metadata field.
    const { fields, wellFormed } = parseFrontMatter('---\nname: foo\n\nTrigger: user says hello\n');
    expect(wellFormed).toBe(false);
    expect(fields['Trigger']).toBeUndefined();
  });

  it('does not strip an unbalanced quote', () => {
    const { fields } = parseFrontMatter('---\nname: 5"\n---\n');
    expect(fields['name']).toBe('5"');
  });

  it('reports absent front matter', () => {
    expect(parseFrontMatter('no front matter here').wellFormed).toBe(false);
  });
});

const skillDirs = readdirSync(skillsRoot).filter((name) =>
  statSync(resolve(skillsRoot, name)).isDirectory(),
);

describe('discoverSkills', () => {
  const skills = discoverSkills();

  it('finds every skill directory on disk', () => {
    // Derived rather than hardcoded: a hardcoded count breaks on any skill
    // added or removed while asserting nothing about descriptor quality.
    expect(skills.map((skill) => skill.name).sort()).toEqual([...skillDirs].sort());
  });

  it.each(skillDirs)('%s has real metadata, not the fallback', (name) => {
    const skill = skills.find((candidate) => candidate.name === name);
    expect(skill).toBeDefined();
    // These two are what previously degraded silently under CRLF.
    expect(skill?.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(skill?.version).not.toBe('0.0.0');
    expect(skill?.description).not.toMatch(/^The .* skill\.$/);
    expect((skill?.description ?? '').length).toBeGreaterThan(40);
  });

  it.each(skillDirs)('%s metadata matches a real YAML parse', (name) => {
    // The hand-rolled reader must agree with an actual YAML parser on the
    // bundled files. `yaml` is a devDependency, so this costs nothing at runtime.
    const raw = readSkillSection(name, 'skill');
    const block = /^---\n([\s\S]*?)\n---/.exec(raw);
    expect(block).not.toBeNull();
    const parsed = parseYaml(block?.[1] ?? '') as { name?: string; version?: string };
    const skill = skills.find((candidate) => candidate.name === name);
    expect(skill?.version).toBe(parsed.version);
    expect(parsed.name).toBe(name);
  });
});

describe('readSkillSection containment', () => {
  it('rejects path traversal', () => {
    expect(() => readSkillSection('../../package', 'skill')).toThrow(/invalid skill name/);
  });

  it('rejects a name that is not lowercase kebab-case', () => {
    expect(() => readSkillSection('BadName', 'skill')).toThrow(/invalid skill name/);
    expect(() => readSkillSection('under_score', 'skill')).toThrow(/invalid skill name/);
  });

  it('rejects percent-encoded traversal', () => {
    expect(() => readSkillSection('%2e%2e%2f%2e%2e', 'skill')).toThrow(/invalid skill name/);
  });

  it('reports a clean error for an unknown skill', () => {
    expect(() => readSkillSection('nonexistent', 'skill')).toThrow(/no SKILL\.md/);
  });
});
