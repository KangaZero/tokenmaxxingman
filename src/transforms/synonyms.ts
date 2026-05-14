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

function applyCase(original: string, replacement: string): string {
  if (original.length === 0) return replacement;
  const firstChar = original[0];
  if (firstChar === undefined) return replacement;
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function synonyms(input: string): string {
  let result = input;
  for (const [word, verbose] of VERBOSE_SYNONYMS) {
    // Word-boundary regex: \b does not work for multi-word replacements on the target,
    // but works fine as an anchor on the source word being replaced.
    const pattern = new RegExp(`\\b(${word})\\b`, 'gi');
    result = result.replace(pattern, (match) => applyCase(match, verbose));
  }
  return result;
}
