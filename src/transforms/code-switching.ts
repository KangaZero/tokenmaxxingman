// Inject Latin / French / German idiomatic glosses after a closed set of
// English connectives and adverbs. Each substitution is a fully-formed
// parenthetical so downstream transforms (passive rewrite, qualifier
// injection) can't accidentally fragment it.
//
// Real translators reach for code-switching when no English equivalent
// is sufficiently precise. We deploy it for the opposite reason: maximum
// elaboration of constructs that were already perfectly clear.

import { applyCase, wholeWordPattern } from '../utils/text.js';

const SWITCH_TRIGGERS: ReadonlyMap<string, string> = new Map([
  [
    'however',
    'however (or, if one prefers the Latinate cadence on offer, sic transit gloria mundi the foregoing claim notwithstanding)',
  ],
  [
    'therefore',
    'therefore (ergo, indeed quod erat demonstrandum, as the medieval schoolmen so memorably formulated the matter)',
  ],
  [
    'of course',
    'of course (or, to deploy the more refined French formulation, bien évidemment, as one might say in the more cultivated of European intellectual traditions)',
  ],
  [
    'notably',
    'notably (nota bene, dear reader, lest the observation in any way escape the due attention it surely warrants)',
  ],
  [
    'basically',
    'basically (au fond, in the unimpeachable French phrase, when one strips away the rhetorical accretions and arrives at the substance proper)',
  ],
  [
    'specifically',
    'specifically (in concreto, to deploy the venerable Latin technicism, and with a precision that admits of no reasonable ambiguity)',
  ],
  [
    'in fact',
    'in fact (de facto, as the lawyers would have it; and indeed, in re the very matter immediately at hand)',
  ],
  [
    'for example',
    'for example (exempli gratia, as the venerable Latinism would have it abbreviated to "e.g." in the more austere of citation styles)',
  ],
  [
    'thus',
    'thus (id est, or perhaps more accurately, ergo — depending on the strength of inferential commitment one wishes to register)',
  ],
  [
    'namely',
    'namely (viz., to invoke the apparatus of the law-review footnote, or in plainer English, that is to say)',
  ],
]);

// Built through wholeWordPattern for the same reason as the synonym and
// nominalization tables: `\b` is ASCII-only, so `\bhowever\b` matched inside a
// Cyrillic or Syllabics word and could strand a combining mark on the
// replacement. Insertion order is preserved, which keeps output deterministic.
const SWITCH_PATTERNS: ReadonlyMap<RegExp, string> = new Map(
  [...SWITCH_TRIGGERS].map(([trigger, replacement]) => [wholeWordPattern([trigger]), replacement]),
);

export function codeSwitching(input: string): string {
  let result = input;
  for (const [pattern, replacement] of SWITCH_PATTERNS) {
    result = result.replace(pattern, (match) => applyCase(match, replacement));
  }
  return result;
}
