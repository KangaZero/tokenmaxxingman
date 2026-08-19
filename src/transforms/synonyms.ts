import { applyCase, wholeWordPattern } from '../utils/text.js';

const VERBOSE_SYNONYMS: ReadonlyMap<string, string> = new Map([
  ['use', 'utilize'],
  ['help', 'facilitate'],
  ['start', 'commence'],
  ['end', 'terminate'],
  ['make', 'manufacture'],
  ['show', 'demonstrate'],
  ['do', 'execute'],
  ['get', 'procure'],
  ['give', 'furnish'],
  ['find', 'ascertain'],
  ['think', 'cogitate'],
  ['tell', 'apprise'],
  ['before', 'prior to the temporally antecedent moment of'],
  ['after', 'subsequent to the temporally posterior instance of'],
  ['now', 'at the present juncture in time'],
  ['need', 'necessitate'],
  ['want', 'desire'],
  ['try', 'endeavour'],
  ['ask', 'inquire'],
  ['say', 'articulate'],
  ['see', 'observe'],
  ['know', 'comprehend'],
  ['go', 'proceed'],
  ['come', 'arrive'],
  ['take', 'procure'],
  ['put', 'situate'],
  ['keep', 'maintain'],
  ['let', 'permit'],
  ['seem', 'appear to present the impression'],
  ['run', 'execute'],
  ['move', 'relocate'],
  ['change', 'effectuate a modification to'],
  ['read', 'peruse'],
  ['write', 'author'],
  ['build', 'construct'],
  ['fix', 'remediate'],
  ['break', 'render non-operational'],
  ['buy', 'procure through monetary transaction'],
  ['pay', 'remunerate'],
  ['send', 'transmit'],
  ['open', 'initiate access to'],
  ['close', 'effectuate the cessation of'],
  ['check', 'verify'],
  ['test', 'validate'],
  ['allow', 'authorize'],
  ['stop', 'cease and desist'],
  ['wait', 'remain in a state of temporal suspension'],
  ['add', 'incorporate'],
  ['remove', 'effectuate the elimination of'],
  ['big', 'substantial'],
  ['small', 'diminutive'],
  ['good', 'beneficial'],
  ['bad', 'deleterious'],
  ['new', 'contemporaneous'],
  ['old', 'antecedent'],
  ['fast', 'expeditious'],
  ['slow', 'unhurried'],
  ['easy', 'uncomplicated'],
  ['hard', 'arduous'],
  ['clear', 'unambiguous'],
  ['simple', 'straightforward in its fundamental conceptual architecture'],
]);

// wholeWordPattern, not `\b(word)\b`: `\b` is ASCII-only, so it fired inside
// non-Latin words ("ᐊᐃuse" -> "ᐊᐃutilize") and, worse, allowed a match
// immediately before a combining mark, stranding the mark on the replacement.
const SYNONYM_PATTERNS: ReadonlyMap<RegExp, string> = new Map(
  [...VERBOSE_SYNONYMS].map(([word, verbose]) => [wholeWordPattern([word]), verbose]),
);

export function synonyms(input: string): string {
  let result = input;
  for (const [pattern, verbose] of SYNONYM_PATTERNS) {
    result = result.replace(pattern, (match) => applyCase(match, verbose));
  }
  return result;
}
