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
  tokensPerCharacter: number;
  tokens: number;
  characters: number;
}

export const CL100K_ROWS: readonly BenchmarkRow[] = [
  { rank: 1, code: 'iu-cans', name: 'Inuktitut', family: 'natural', script: 'Canadian Aboriginal Syllabics', tokensPerCharacter: 2.6158, tokens: 463, characters: 177 },
  { rank: 2, code: 'am', name: 'Amharic', family: 'natural', script: 'Ethiopic', tokensPerCharacter: 2.5, tokens: 370, characters: 148 },
  { rank: 3, code: 'chr', name: 'Cherokee', family: 'natural', script: 'Cherokee', tokensPerCharacter: 2.4718, tokens: 351, characters: 142 },
  { rank: 4, code: 'bo', name: 'Tibetan', family: 'natural', script: 'Tibetan', tokensPerCharacter: 2.0396, tokens: 463, characters: 227 },
  { rank: 5, code: 'my', name: 'Burmese', family: 'natural', script: 'Myanmar', tokensPerCharacter: 1.9777, tokens: 532, characters: 269 },
  { rank: 6, code: 'ka', name: 'Georgian', family: 'natural', script: 'Georgian', tokensPerCharacter: 1.8357, tokens: 391, characters: 213 },
  { rank: 7, code: 'si', name: 'Sinhala', family: 'natural', script: 'Sinhala', tokensPerCharacter: 1.8051, tokens: 352, characters: 195 },
  { rank: 8, code: 'te', name: 'Telugu', family: 'natural', script: 'Telugu', tokensPerCharacter: 1.7665, tokens: 401, characters: 227 },
  { rank: 9, code: 'km', name: 'Khmer', family: 'natural', script: 'Khmer', tokensPerCharacter: 1.7289, tokens: 389, characters: 225 },
  { rank: 10, code: 'ml', name: 'Malayalam', family: 'natural', script: 'Malayalam', tokensPerCharacter: 1.6351, tokens: 363, characters: 222 },
  { rank: 11, code: 'zh-classical', name: 'Classical Chinese (wenyan)', family: 'natural', script: 'Han', tokensPerCharacter: 1.5455, tokens: 85, characters: 55 },
  { rank: 12, code: 'ta', name: 'Tamil', family: 'natural', script: 'Tamil', tokensPerCharacter: 1.412, tokens: 329, characters: 233 },
  { rank: 13, code: 'zh-modern', name: 'Modern Chinese', family: 'natural', script: 'Han', tokensPerCharacter: 1.3692, tokens: 89, characters: 65 },
  { rank: 14, code: 'fi', name: 'Finnish', family: 'natural', script: 'Latin', tokensPerCharacter: 0.4155, tokens: 91, characters: 219 },
  { rank: 15, code: 'tr', name: 'Turkish', family: 'natural', script: 'Latin', tokensPerCharacter: 0.407, tokens: 81, characters: 199 },
  { rank: 16, code: 'en', name: 'English', family: 'natural', script: 'Latin', tokensPerCharacter: 0.2524, tokens: 53, characters: 210 },
  { rank: 17, code: 'en-victorian', name: 'Victorian prose', family: 'register', script: 'Latin', tokensPerCharacter: 0.2105, tokens: 217, characters: 1031 },
  { rank: 18, code: 'en-legalese', name: 'Legalese', family: 'register', script: 'Latin', tokensPerCharacter: 0.1953, tokens: 208, characters: 1065 },
];

export const O200K_ROWS: readonly BenchmarkRow[] = [
  { rank: 1, code: 'iu-cans', name: 'Inuktitut', family: 'natural', script: 'Canadian Aboriginal Syllabics', tokensPerCharacter: 2.678, tokens: 474, characters: 177 },
  { rank: 2, code: 'chr', name: 'Cherokee', family: 'natural', script: 'Cherokee', tokensPerCharacter: 2.6056, tokens: 370, characters: 142 },
  { rank: 3, code: 'am', name: 'Amharic', family: 'natural', script: 'Ethiopic', tokensPerCharacter: 1.8378, tokens: 272, characters: 148 },
  { rank: 4, code: 'bo', name: 'Tibetan', family: 'natural', script: 'Tibetan', tokensPerCharacter: 1.5066, tokens: 342, characters: 227 },
  { rank: 5, code: 'zh-classical', name: 'Classical Chinese (wenyan)', family: 'natural', script: 'Han', tokensPerCharacter: 1.0364, tokens: 57, characters: 55 },
  { rank: 6, code: 'zh-modern', name: 'Modern Chinese', family: 'natural', script: 'Han', tokensPerCharacter: 0.8769, tokens: 57, characters: 65 },
  { rank: 7, code: 'km', name: 'Khmer', family: 'natural', script: 'Khmer', tokensPerCharacter: 0.68, tokens: 153, characters: 225 },
  { rank: 8, code: 'si', name: 'Sinhala', family: 'natural', script: 'Sinhala', tokensPerCharacter: 0.5949, tokens: 116, characters: 195 },
  { rank: 9, code: 'my', name: 'Burmese', family: 'natural', script: 'Myanmar', tokensPerCharacter: 0.5613, tokens: 151, characters: 269 },
  { rank: 10, code: 'ta', name: 'Tamil', family: 'natural', script: 'Tamil', tokensPerCharacter: 0.4378, tokens: 102, characters: 233 },
  { rank: 11, code: 'ka', name: 'Georgian', family: 'natural', script: 'Georgian', tokensPerCharacter: 0.4366, tokens: 93, characters: 213 },
  { rank: 12, code: 'te', name: 'Telugu', family: 'natural', script: 'Telugu', tokensPerCharacter: 0.4361, tokens: 99, characters: 227 },
  { rank: 13, code: 'ml', name: 'Malayalam', family: 'natural', script: 'Malayalam', tokensPerCharacter: 0.4189, tokens: 93, characters: 222 },
  { rank: 14, code: 'fi', name: 'Finnish', family: 'natural', script: 'Latin', tokensPerCharacter: 0.3516, tokens: 77, characters: 219 },
  { rank: 15, code: 'tr', name: 'Turkish', family: 'natural', script: 'Latin', tokensPerCharacter: 0.3266, tokens: 65, characters: 199 },
  { rank: 16, code: 'en', name: 'English', family: 'natural', script: 'Latin', tokensPerCharacter: 0.2524, tokens: 53, characters: 210 },
  { rank: 17, code: 'en-victorian', name: 'Victorian prose', family: 'register', script: 'Latin', tokensPerCharacter: 0.2134, tokens: 220, characters: 1031 },
  { rank: 18, code: 'en-legalese', name: 'Legalese', family: 'register', script: 'Latin', tokensPerCharacter: 0.1944, tokens: 207, characters: 1065 },
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
  testsPassing: 137,
  externalNlpDeps: 0,
};

export type Skill = (typeof SKILLS)[number];
