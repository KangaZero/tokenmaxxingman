import type { LangCode } from '../corpus-types.js';
import { splitOnSentenceBoundaries } from '../utils/text.js';

export type { LangCode } from '../corpus-types.js';

interface LangEntry {
  label: string;
  phrasebook: ReadonlyMap<string, string>;
  /** `phrasebook` re-keyed by {@link normaliseKey} so lookups tolerate case and whitespace noise. */
  index: ReadonlyMap<string, string>;
}

const BURMESE_PHRASEBOOK: ReadonlyMap<string, string> = new Map([
  ['Hello.', 'မင်္ဂလာပါ။'],
  ['Thank you.', 'ကျေးဇူးတင်ပါသည်။'],
  ['Yes.', 'ဟုတ်ကဲ့။'],
  ['No.', 'မဟုတ်ပါ။'],
  ['Please.', 'ကျေးဇူးပြု၍'],
  ['Goodbye.', 'နှုတ်ဆက်ပါသည်။'],
  ['I understand.', 'နားလည်ပါသည်။'],
  ['I do not understand.', 'နားမလည်ပါ။'],
  [
    'The quick brown fox jumps over the lazy dog.',
    'မြန်ဆန်သော အညိုရောင် မြေခွေးသည် ပျင်းရိသော ခွေးကို ကျော်ခုန်သည်။',
  ],
  ['The sun rises in the east.', 'နေသည် အရှေ့မှ ထွက်သည်။'],
]);

const TIBETAN_PHRASEBOOK: ReadonlyMap<string, string> = new Map([
  ['Hello.', 'བཀྲ་ཤིས་བདེ་ལེགས།'],
  ['Thank you.', 'ཐུགས་རྗེ་ཆེ།'],
  ['Yes.', 'ཡིན།'],
  ['No.', 'མིན།'],
  ['Please.', 'ཞུ་གནང་།'],
  ['Goodbye.', 'གཞན་ལ་རྒྱུགས་གནང་།'],
  ['I understand.', 'ང་ཧ་གོ་བྱུང་།'],
  ['I do not understand.', 'ང་ཧ་མི་གོ།'],
  [
    'The quick brown fox jumps over the lazy dog.',
    'མགྱོགས་པའི་སྐྱ་ཁྱི་རྒྱལ་པོས་ལེལ་ཕབ་ཀྱི་ཁྱི་ལ་བརྒལ་ལྡིང་།',
  ],
  ['The sun rises in the east.', 'ཉི་མ་ཤར་ཕྱོགས་ནས་འཆར།'],
]);

const INUKTITUT_PHRASEBOOK: ReadonlyMap<string, string> = new Map([
  ['Hello.', 'ᐊᐃ।'],
  ['Thank you.', 'ᖁᔭᓐᓇᒦᒃ।'],
  ['Yes.', 'ᐋᒃᑲ।'],
  ['No.', 'ᐊᒃᑲ।'],
  ['Please.', 'ᐊᑭᓐᓇᖅ।'],
  ['Goodbye.', 'ᐊᑭᓐᓇᖅᑎᑦ।'],
  ['I understand.', 'ᑐᑭᓯᓯᒪᕗᖓ।'],
  ['I do not understand.', 'ᑐᑭᓯᓯᒪᙱᓐᓇᖓ।'],
  ['The quick brown fox jumps over the lazy dog.', 'ᓴᓪᓕᖅᑯᑦ ᑲᖏᖅᓯᔪᖅ ᑯᑭᓐᓇᖅᑐᖅ ᐊᒃᑎᕈᑎᖃᖅᑐᖅ ᐅᖃᙱᑐᒥ ᕿᒻᒥᒥᒃ।'],
  ['The sun rises in the east.', 'ᓯᕿᓂᖅ ᓴᓂᐊᓂᑦ ᐅᔭᖅᑲᓂᑦ ᑰᖑᒪᓛᖑᔪᒥ।'],
]);

/**
 * Lookup key for a source sentence: trimmed, whitespace-collapsed, lowercased.
 * The phrasebooks are tiny and hand-written, so matching them byte-exactly is
 * needlessly brittle — `'the sun  rises in the east.'` should hit the same
 * entry as `'The sun rises in the east.'`.
 */
function normaliseKey(sentence: string): string {
  return sentence.trim().replace(/\s+/g, ' ').toLowerCase();
}

function toEntry(label: string, phrasebook: ReadonlyMap<string, string>): LangEntry {
  return {
    label,
    phrasebook,
    index: new Map([...phrasebook].map(([english, translated]) => [normaliseKey(english), translated])),
  };
}

const LANGUAGE_REGISTRY: ReadonlyMap<LangCode, LangEntry> = new Map([
  ['my', toEntry('Burmese', BURMESE_PHRASEBOOK)],
  ['bo', toEntry('Tibetan', TIBETAN_PHRASEBOOK)],
  ['iu-cans', toEntry('Inuktitut Syllabics', INUKTITUT_PHRASEBOOK)],
]);

export const targets: readonly LangCode[] = [...LANGUAGE_REGISTRY.keys()];

/**
 * Whole-string phrasebook lookup. This is the low-level primitive: `input` must
 * be a single phrasebook sentence, and an unknown phrase (or an unknown target)
 * yields a diagnostic marker rather than silent passthrough.
 *
 * Pipelines must NOT call this directly — an amplified sentence is never a
 * phrasebook key, so the marker would leak into user-facing output. Use
 * {@link translateSentences}, which translates sentence-by-sentence and falls
 * back gracefully.
 */
export function translate(input: string, target: LangCode): string {
  const entry = LANGUAGE_REGISTRY.get(target);
  if (entry === undefined) {
    return `[no translation available: ${target}] ${input}`;
  }
  const translated = entry.index.get(normaliseKey(input));
  if (translated === undefined) {
    return `[no translation available: ${target}] ${input}`;
  }
  return translated;
}

/**
 * Translate `input` one sentence at a time, replacing every sentence that the
 * target phrasebook knows and leaving the rest exactly as it found them.
 *
 * Graceful by design: an unmatched sentence keeps its source text, and an
 * unknown target language returns `input` untouched. No diagnostic marker is
 * ever emitted, because this is the function whose output reaches users.
 */
export function translateSentences(input: string, target: LangCode): string {
  const entry = LANGUAGE_REGISTRY.get(target);
  if (entry === undefined) return input;

  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return input;

  return sentences
    .map((sentence) => entry.index.get(normaliseKey(sentence)) ?? sentence)
    .join(' ');
}
