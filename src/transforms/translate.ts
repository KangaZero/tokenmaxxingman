import type { LangCode } from '../corpus-types.js';

export type { LangCode } from '../corpus-types.js';

interface LangEntry {
  label: string;
  phrasebook: ReadonlyMap<string, string>;
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
  ['The quick brown fox jumps over the lazy dog.', 'မြန်ဆန်သော အညိုရောင် မြေခွေးသည် ပျင်းရိသော ခွေးကို ကျော်ခုန်သည်။'],
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
  ['The quick brown fox jumps over the lazy dog.', 'མགྱོགས་པའི་སྐྱ་ཁྱི་རྒྱལ་པོས་ལེལ་ཕབ་ཀྱི་ཁྱི་ལ་བརྒལ་ལྡིང་།'],
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

const LANGUAGE_REGISTRY: ReadonlyMap<LangCode, LangEntry> = new Map([
  ['my', { label: 'Burmese', phrasebook: BURMESE_PHRASEBOOK }],
  ['bo', { label: 'Tibetan', phrasebook: TIBETAN_PHRASEBOOK }],
  ['iu-cans', { label: 'Inuktitut Syllabics', phrasebook: INUKTITUT_PHRASEBOOK }],
]);

export const targets: readonly LangCode[] = [...LANGUAGE_REGISTRY.keys()];

export function translate(input: string, target: LangCode): string {
  const entry = LANGUAGE_REGISTRY.get(target);
  if (entry === undefined) {
    return `[no translation available: ${target}] ${input}`;
  }
  const translated = entry.phrasebook.get(input);
  if (translated === undefined) {
    return `[no translation available: ${target}] ${input}`;
  }
  return translated;
}
