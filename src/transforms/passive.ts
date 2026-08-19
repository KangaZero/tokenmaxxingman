import { splitOnSentenceBoundaries } from '../utils/text.js';

// Heuristic passive-voice conversion using regex.
// LIMITATIONS (intentional, documented):
//   - Only handles simple SVO patterns: "Subject Verbs Object" in a single clause.
//   - Subject is matched as one or two capitalised words at sentence start.
//   - Verb is matched as a present-tense third-person singular (-s/-es suffix).
//   - Past-participle table covers ~30 common verbs; unknown verbs are left unchanged.
//   - Compound sentences, relative clauses, and inverted syntax are NOT converted.
//   - If the pattern does not match with confidence, the sentence is returned as-is.

const IRREGULAR_PAST_PARTICIPLES: ReadonlyMap<string, string> = new Map([
  ['builds', 'built'],
  ['makes', 'made'],
  ['takes', 'taken'],
  ['gives', 'given'],
  ['gets', 'gotten'],
  ['finds', 'found'],
  ['writes', 'written'],
  ['reads', 'read'],
  ['runs', 'run'],
  ['sends', 'sent'],
  ['keeps', 'kept'],
  ['puts', 'put'],
  ['goes', 'gone'],
  ['comes', 'come'],
  ['brings', 'brought'],
  ['buys', 'bought'],
  ['pays', 'paid'],
  ['knows', 'known'],
  ['sees', 'seen'],
  ['says', 'said'],
  ['tells', 'told'],
  ['shows', 'shown'],
  ['holds', 'held'],
  ['sets', 'set'],
  ['lets', 'let'],
  ['leads', 'led'],
  ['breaks', 'broken'],
  ['leaves', 'left'],
  ['meets', 'met'],
  ['feels', 'felt'],
]);

function toPastParticiple(verbThirdPerson: string): string | undefined {
  const irregular = IRREGULAR_PAST_PARTICIPLES.get(verbThirdPerson.toLowerCase());
  if (irregular !== undefined) return irregular;

  // Regular verb heuristic: strip -s or -es to form the base, then add -ed.
  // This will produce "useed" for "uses" — handled by the -es → -e + d path.
  const lower = verbThirdPerson.toLowerCase();
  if (lower.endsWith('es')) {
    // e.g. "manages" → "manage" + "d"; "fixes" → "fix" + "ed"
    const withoutEs = lower.slice(0, -2);
    if (/[aeiou]$/.test(withoutEs)) {
      return withoutEs + 'd';
    }
    return withoutEs + 'ed';
  }
  if (lower.endsWith('s')) {
    const base = lower.slice(0, -1);
    // Avoid double-e: "sees" → already caught above; guard against short bases
    if (base.length < 2) return undefined;
    return base + 'ed';
  }
  return undefined;
}

// Matches: [Subject (capitalised head + trailing lowercase words)] [Verb (3sg-s)] [Object (rest of clause)]
// Subject group: one leading capitalised word followed by up to 12 lowercase words
// Object group: everything up to the end of the clause (terminated by period, comma, or end of string)
//
// REDOS HISTORY — do not reintroduce the alternation. This group was once
// `(?:\s+(?:the|a|an|this|that|my|our|their|its|his|her|[a-z]+))*`. Every literal
// alternative is also matched by `[a-z]+`, and `[a-z]+` additionally matches each
// literal's prefixes, so a single input word had several distinct parse paths
// inside an unbounded group. The number of paths the engine must exhaust before
// declaring failure therefore multiplied with each added word: a 129-character
// input took 86 seconds, a 145-character one roughly 85 minutes, and because the
// CLI, the library API, and the MCP server all reach this function on one thread,
// that is a full denial of service rather than a slow request.
//
// `[a-z]+` alone leaves exactly one parse path per word, and the bounded
// repetition caps how far the engine can backtrack when the verb group fails to
// match. 12 words is far beyond any subject this heuristic can usefully rewrite
// while staying well inside linear time.
const SVO_PATTERN = /^([A-Z][a-zA-Z]*(?:\s+[a-z]+){0,12})\s+([a-zA-Z]+s)\s+([^,.!?]+?)([,.!?]?)$/;

function convertSentenceToPassive(sentence: string): string {
  const match = SVO_PATTERN.exec(sentence.trim());
  if (match === null) return sentence;

  const [, subject, verb, object, punct] = match;
  if (subject === undefined || verb === undefined || object === undefined || punct === undefined) {
    return sentence;
  }

  const pastParticiple = toPastParticiple(verb);
  if (pastParticiple === undefined) return sentence;

  const capitalised = object.charAt(0).toUpperCase() + object.slice(1);
  return `${capitalised} is ${pastParticiple} by ${subject}${punct}`;
}

export function passive(input: string): string {
  // Process sentence by sentence so multi-sentence inputs are handled gracefully.
  // splitOnSentenceBoundaries filters empty fragments, avoiding the double-space
  // artefacts an inline split would leave on trailing punctuation/whitespace.
  return splitOnSentenceBoundaries(input)
    .map((sentence) => convertSentenceToPassive(sentence))
    .join(' ');
}
