import { synonyms } from '../transforms/synonyms.js';
import { passive } from '../transforms/passive.js';

const CONNECTORS: readonly string[] = [
  'put differently,',
  'stated another way,',
  'to rephrase this observation,',
  'or, to express the same sentiment through alternative phrasing,',
  'in other words and with slightly altered construction,',
  'restated for the sake of absolute clarity,',
  'to render the same point via an alternative formulation,',
  'expressed from a different linguistic vantage point,',
  'which is to say, in terms that may prove more illuminating,',
  'or, as one might alternatively articulate the selfsame proposition,',
];

function splitOnSentenceBoundaries(input: string): string[] {
  return input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

function rephrase(sentence: string): string {
  // Apply passive first, then synonyms to create a visibly different surface form.
  const passivized = passive(sentence);
  const verbosified = synonyms(passivized);
  // If neither transform changed anything, at minimum append a synonym pass alone.
  if (verbosified === sentence) {
    return synonyms(sentence);
  }
  return verbosified;
}

export function repetition(input: string): string {
  if (input.trim().length === 0) return input;

  const sentences = splitOnSentenceBoundaries(input);
  if (sentences.length === 0) return input;

  const result = sentences.map((sentence, index) => {
    const rephrased = rephrase(sentence);
    const connector = CONNECTORS[index % CONNECTORS.length];
    if (connector === undefined) return sentence;

    // Strip trailing punctuation from original to insert the semicolon connector cleanly.
    const trailingPunct = /[.!?]$/.test(sentence) ? sentence.slice(-1) : '.';
    const body = /[.!?]$/.test(sentence) ? sentence.slice(0, -1) : sentence;

    // Lowercase the rephrased clause since it follows a connector mid-sentence.
    const rephrasedLower = rephrased.charAt(0).toLowerCase() + rephrased.slice(1);
    return `${body}; ${connector} ${rephrasedLower}${trailingPunct}`;
  });

  return result.join(' ');
}
