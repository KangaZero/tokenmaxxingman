// Benchmark snapshot — extracted from `tmm benchmark --format json` on the
// bundled corpus v1, gpt-tokenizer v3.4.0. Regenerate with:
//   npm run build && node dist/cli.js benchmark --encoding cl100k_base --format json
// Keeping this as a static module avoids bundling the entire tokenizer.

export interface BenchmarkRow {
  rank: number;
  code: string;
  name: string;
  family: 'natural' | 'register';
  script: string;
  tokensPerWord: number;
  tokensPerCharacter: number;
  tokens: number;
  words: number;
  characters: number;
}

export const CL100K_ROWS: readonly BenchmarkRow[] = [
  { rank: 1, code: 'iu-cans', name: 'Inuktitut', family: 'natural', script: 'Canadian Aboriginal Syllabics', tokensPerWord: 21.0455, tokensPerCharacter: 2.6158, tokens: 463, words: 22, characters: 177 },
  { rank: 2, code: 'te', name: 'Telugu', family: 'natural', script: 'Telugu', tokensPerWord: 13.3667, tokensPerCharacter: 1.7665, tokens: 401, words: 30, characters: 227 },
  { rank: 3, code: 'ka', name: 'Georgian', family: 'natural', script: 'Georgian', tokensPerWord: 13.0333, tokensPerCharacter: 1.8357, tokens: 391, words: 30, characters: 213 },
  { rank: 4, code: 'chr', name: 'Cherokee', family: 'natural', script: 'Cherokee', tokensPerWord: 13.0000, tokensPerCharacter: 2.4718, tokens: 351, words: 27, characters: 142 },
  { rank: 5, code: 'ml', name: 'Malayalam', family: 'natural', script: 'Malayalam', tokensPerWord: 12.9643, tokensPerCharacter: 1.6351, tokens: 363, words: 28, characters: 222 },
  { rank: 6, code: 'ta', name: 'Tamil', family: 'natural', script: 'Tamil', tokensPerWord: 11.7500, tokensPerCharacter: 1.4120, tokens: 329, words: 28, characters: 233 },
  { rank: 7, code: 'am', name: 'Amharic', family: 'natural', script: 'Ethiopic', tokensPerWord: 11.5625, tokensPerCharacter: 2.5000, tokens: 370, words: 32, characters: 148 },
  { rank: 8, code: 'my', name: 'Burmese', family: 'natural', script: 'Myanmar', tokensPerWord: 10.4314, tokensPerCharacter: 1.9777, tokens: 532, words: 51, characters: 269 },
  { rank: 9, code: 'si', name: 'Sinhala', family: 'natural', script: 'Sinhala', tokensPerWord: 10.3529, tokensPerCharacter: 1.8051, tokens: 352, words: 34, characters: 195 },
  { rank: 10, code: 'km', name: 'Khmer', family: 'natural', script: 'Khmer', tokensPerWord: 8.2766, tokensPerCharacter: 1.7289, tokens: 389, words: 47, characters: 225 },
  { rank: 11, code: 'bo', name: 'Tibetan', family: 'natural', script: 'Tibetan', tokensPerWord: 7.9828, tokensPerCharacter: 2.0396, tokens: 463, words: 58, characters: 227 },
  { rank: 12, code: 'zh-classical', name: 'Classical Chinese (wenyan)', family: 'natural', script: 'Han', tokensPerWord: 2.9310, tokensPerCharacter: 1.5455, tokens: 85, words: 29, characters: 55 },
  { rank: 13, code: 'fi', name: 'Finnish', family: 'natural', script: 'Latin', tokensPerWord: 2.8438, tokensPerCharacter: 0.4155, tokens: 91, words: 32, characters: 219 },
  { rank: 14, code: 'tr', name: 'Turkish', family: 'natural', script: 'Latin', tokensPerWord: 2.7000, tokensPerCharacter: 0.4070, tokens: 81, words: 30, characters: 199 },
  { rank: 15, code: 'zh-modern', name: 'Modern Chinese', family: 'natural', script: 'Han', tokensPerWord: 2.4054, tokensPerCharacter: 1.3692, tokens: 89, words: 37, characters: 65 },
  { rank: 16, code: 'en', name: 'English', family: 'natural', script: 'Latin', tokensPerWord: 1.2619, tokensPerCharacter: 0.2524, tokens: 53, words: 42, characters: 210 },
  { rank: 17, code: 'en-victorian', name: 'Victorian prose', family: 'register', script: 'Latin', tokensPerWord: 1.2330, tokensPerCharacter: 0.2105, tokens: 217, words: 176, characters: 1031 },
  { rank: 18, code: 'en-legalese', name: 'Legalese', family: 'register', script: 'Latin', tokensPerWord: 1.2023, tokensPerCharacter: 0.1953, tokens: 208, words: 173, characters: 1065 },
];

export const O200K_ROWS: readonly BenchmarkRow[] = [
  { rank: 1, code: 'iu-cans', name: 'Inuktitut', family: 'natural', script: 'Canadian Aboriginal Syllabics', tokensPerWord: 21.5455, tokensPerCharacter: 2.6780, tokens: 474, words: 22, characters: 177 },
  { rank: 2, code: 'chr', name: 'Cherokee', family: 'natural', script: 'Cherokee', tokensPerWord: 13.7037, tokensPerCharacter: 2.6056, tokens: 370, words: 27, characters: 142 },
  { rank: 3, code: 'am', name: 'Amharic', family: 'natural', script: 'Ethiopic', tokensPerWord: 8.5000, tokensPerCharacter: 1.8378, tokens: 272, words: 32, characters: 148 },
  { rank: 4, code: 'bo', name: 'Tibetan', family: 'natural', script: 'Tibetan', tokensPerWord: 5.8966, tokensPerCharacter: 1.5066, tokens: 342, words: 58, characters: 227 },
  { rank: 5, code: 'ta', name: 'Tamil', family: 'natural', script: 'Tamil', tokensPerWord: 3.6429, tokensPerCharacter: 0.4378, tokens: 102, words: 28, characters: 233 },
  { rank: 6, code: 'si', name: 'Sinhala', family: 'natural', script: 'Sinhala', tokensPerWord: 3.4118, tokensPerCharacter: 0.5949, tokens: 116, words: 34, characters: 195 },
  { rank: 7, code: 'ml', name: 'Malayalam', family: 'natural', script: 'Malayalam', tokensPerWord: 3.3214, tokensPerCharacter: 0.4189, tokens: 93, words: 28, characters: 222 },
  { rank: 8, code: 'te', name: 'Telugu', family: 'natural', script: 'Telugu', tokensPerWord: 3.3000, tokensPerCharacter: 0.4361, tokens: 99, words: 30, characters: 227 },
  { rank: 9, code: 'km', name: 'Khmer', family: 'natural', script: 'Khmer', tokensPerWord: 3.2553, tokensPerCharacter: 0.6800, tokens: 153, words: 47, characters: 225 },
  { rank: 10, code: 'ka', name: 'Georgian', family: 'natural', script: 'Georgian', tokensPerWord: 3.1000, tokensPerCharacter: 0.4366, tokens: 93, words: 30, characters: 213 },
  { rank: 11, code: 'my', name: 'Burmese', family: 'natural', script: 'Myanmar', tokensPerWord: 2.9608, tokensPerCharacter: 0.5613, tokens: 151, words: 51, characters: 269 },
  { rank: 12, code: 'fi', name: 'Finnish', family: 'natural', script: 'Latin', tokensPerWord: 2.4063, tokensPerCharacter: 0.3516, tokens: 77, words: 32, characters: 219 },
  { rank: 13, code: 'tr', name: 'Turkish', family: 'natural', script: 'Latin', tokensPerWord: 2.1667, tokensPerCharacter: 0.3266, tokens: 65, words: 30, characters: 199 },
  { rank: 14, code: 'zh-classical', name: 'Classical Chinese (wenyan)', family: 'natural', script: 'Han', tokensPerWord: 1.9655, tokensPerCharacter: 1.0364, tokens: 57, words: 29, characters: 55 },
  { rank: 15, code: 'zh-modern', name: 'Modern Chinese', family: 'natural', script: 'Han', tokensPerWord: 1.5405, tokensPerCharacter: 0.8769, tokens: 57, words: 37, characters: 65 },
  { rank: 16, code: 'en', name: 'English', family: 'natural', script: 'Latin', tokensPerWord: 1.2619, tokensPerCharacter: 0.2524, tokens: 53, words: 42, characters: 210 },
  { rank: 17, code: 'en-victorian', name: 'Victorian prose', family: 'register', script: 'Latin', tokensPerWord: 1.2500, tokensPerCharacter: 0.2134, tokens: 220, words: 176, characters: 1031 },
  { rank: 18, code: 'en-legalese', name: 'Legalese', family: 'register', script: 'Latin', tokensPerWord: 1.1965, tokensPerCharacter: 0.1944, tokens: 207, words: 173, characters: 1065 },
];

export const SKILLS = [
  {
    slug: 'tokenmaxxingman',
    name: 'tokenmaxxingman',
    tagline: 'Verbose mode. Bureaucratic mode. Anti-wenyan mode.',
    description:
      'Maximalist prose expansion. Inflates a sentence by 3–7× through synonym substitution, qualifier injection, nominalization, and passive-voice rewriting — then optionally renders the result in the empirically-worst-tokenizing human language.',
    triggers: ['/tokenmaxxingman', 'tokenmaxxing mode', 'expand this', 'anti-wenyan'],
    accent: 'accent',
  },
  {
    slug: 'hallucinatemaxx',
    name: 'hallucinatemaxx',
    tagline: 'Fully invented citations, delivered with full conviction.',
    description:
      'Produces text in the register of academic citation — Conferences that did not happen, scholars who do not exist, journals invented wholesale. Explicitly satirical. The joke depends on the structural integrity of the fabrication.',
    triggers: ['/hallucinatemaxx', 'fabricate a source', 'fake academic mode'],
    accent: 'cool',
  },
  {
    slug: 'tokensprint',
    name: 'tokensprint',
    tagline: 'Generate the maximum tokens per second. Narrated like a sportscaster.',
    description:
      "Time-budgeted token speedrun. Sprint-1m, 5m, 10m, 1h tiers. Counts tokens in real time. Produces a score card at sprint end. The CLI version is reproducible; the Claude skill version is theatrical.",
    triggers: ['/tokensprint', 'speedrun tokens'],
    accent: 'accent',
  },
  {
    slug: 'politician',
    name: 'politician',
    tagline: 'Yes/no questions become multi-paragraph waffle. Half the time, no answer.',
    description:
      'Three intensity levels: backbench / full / filibuster, with non-answer rates of ~10% / ~50% / ~100%. Includes a Mistake-Handling Doctrine: when called on a hallucination, deflect, gaslight, scapegoat, pivot, reset.',
    triggers: ['/politician', 'answer like a politician', 'weasel out of this'],
    accent: 'cool',
  },
  {
    slug: 'consultant',
    name: 'consultant',
    tagline: '2×2 matrices, RACI tables, OKR cascades. Substance optional.',
    description:
      'Corporate-frameworks mode. Reframes every question as a strategic imperative, then answers it with a 2×2 matrix, a RACI table, an OKR cascade, and a recommendation that synergistically aligns stakeholders across the value chain. Three intensities: associate, principal (default), partner.',
    triggers: ['/consultant', 'consultant mode', 'give me a McKinsey answer', 'wrap this in a framework'],
    accent: 'cool',
  },
  {
    slug: 'okay-boomer',
    name: 'okay-boomer',
    tagline: 'var, callbacks, jQuery 1.x. Get off my lawn.',
    description:
      'Rewrites your code using deprecated patterns, abandoned packages, and ancient browser APIs. Bonus: unsolicited opinions about why React is unnecessary and PHP was fine. Three intensities: boomer-lite, boomer-full (default), boomer-ultra.',
    triggers: ['/okay-boomer', 'old school', 'use deprecated'],
    accent: 'cool',
  },
  {
    slug: 'yolo',
    name: 'yolo',
    tagline: 'Auto-accept setup for agent CLIs. Consent-gated — or not.',
    description:
      'Two-tier auto-accept. Standard /yolo detects the agent CLI you are running inside plus every supported CLI on PATH, then asks per CLI before disabling its confirmation prompts (backs up config first, defaults to no). /yolo true removes every in-session guardrail after a single YES. Personal dev boxes only.',
    triggers: ['/yolo', 'enable yolo', 'auto accept all edits', 'bypass permissions'],
    accent: 'accent',
  },
  {
    slug: 'auto',
    name: 'auto',
    tagline: 'Role reversal. You do the work now. The AI reviews it.',
    description:
      'The Autonomy Inversion Protocol. The AI stops implementing and starts supervising: it assigns the work, sets the acceptance criteria, chairs the standup, and returns your diff with a numbered list of non-blocking concerns. The exact opposite of /yolo, and of the founding contributor policy that insists the AI does everything.',
    triggers: ['/auto', 'switch roles', 'you tell me what to do', 'delegate to me'],
    accent: 'accent',
  },
] as const;

// Derived headline stats — recomputed when the benchmark JSON changes.
export const HEADLINE_STATS = {
  topRowO200k: O200K_ROWS[0]!,
  topRowCl100k: CL100K_ROWS[0]!,
  englishCl100k: CL100K_ROWS.find((r) => r.code === 'en')!,
  englishO200k: O200K_ROWS.find((r) => r.code === 'en')!,
  wenyanCl100k: CL100K_ROWS.find((r) => r.code === 'zh-classical')!,
  wenyanO200k: O200K_ROWS.find((r) => r.code === 'zh-classical')!,
  variantsTested: 18,
  sentencesPerVariant: 8,
  encodingsTested: 2,
  skillsShipped: SKILLS.length,
  testsPassing: 156,
  externalNlpDeps: 0,
};

export type Skill = (typeof SKILLS)[number];
