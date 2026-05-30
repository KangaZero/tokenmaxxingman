import { applyCase } from '../utils/text.js';

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

const NOMINALIZATION_PATTERNS: ReadonlyMap<RegExp, string> = new Map(
  [...NOMINALIZATIONS].map(([verb, nounPhrase]) => [new RegExp(`\\b(${verb})\\b`, 'gi'), nounPhrase]),
);

export function nominalizations(input: string): string {
  let result = input;
  for (const [pattern, nounPhrase] of NOMINALIZATION_PATTERNS) {
    result = result.replace(pattern, (match) => applyCase(match, nounPhrase));
  }
  return result;
}
