export function applyCase(original: string, replacement: string): string {
  if (original.length === 0) return replacement;
  const firstChar = original[0];
  if (firstChar === undefined) return replacement;
  if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

export function splitOnSentenceBoundaries(input: string): string[] {
  return input.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}
