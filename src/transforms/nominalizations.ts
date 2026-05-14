const NOMINALIZATIONS: ReadonlyMap<string, string> = new Map([
  ['decide', 'make a decision regarding the matter of'],
  ['implement', 'carry out the implementation of'],
  ['consider', 'give due consideration to'],
  ['analyse', 'conduct an analysis of'],
  ['analyze', 'conduct an analysis of'],
  ['evaluate', 'undertake an evaluation of'],
  ['determine', 'arrive at a determination with respect to'],
  ['require', 'have a requirement for'],
  ['provide', 'make provision for'],
  ['establish', 'bring about the establishment of'],
  ['develop', 'undertake the development of'],
  ['improve', 'effect an improvement upon'],
  ['increase', 'bring about an increase in'],
  ['reduce', 'effectuate a reduction in'],
  ['manage', 'exercise management over'],
  ['resolve', 'arrive at a resolution concerning'],
  ['address', 'direct attention to the matter of'],
  ['support', 'furnish support with respect to'],
  ['maintain', 'ensure the maintenance of'],
  ['create', 'bring into existence'],
  ['identify', 'undertake the identification of'],
  ['ensure', 'take all necessary steps to ensure'],
  ['confirm', 'obtain confirmation regarding'],
  ['complete', 'bring to successful completion'],
  ['approve', 'grant approval for'],
  ['review', 'conduct a review of'],
  ['update', 'effectuate an update to'],
  ['define', 'provide a definition for'],
  ['plan', 'formulate a plan with respect to'],
  ['coordinate', 'engage in coordination concerning'],
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

export function nominalizations(input: string): string {
  let result = input;
  for (const [verb, nounPhrase] of NOMINALIZATIONS) {
    const pattern = new RegExp(`\\b(${verb})\\b`, 'gi');
    result = result.replace(pattern, (match) => applyCase(match, nounPhrase));
  }
  return result;
}
