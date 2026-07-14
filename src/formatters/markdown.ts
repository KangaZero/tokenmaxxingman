import type { BenchmarkResult } from '../benchmark.js';

export function toMarkdown(result: BenchmarkResult): string {
  const header = [
    `# tokenmaxxingman benchmark`,
    ``,
    `Encoding: \`${result.encoding}\` · Corpus v${result.corpusVersion}`,
    ``,
    `| Rank | Code | Name | Script | Family | Tokens | Words | Chars | Tok/Word | Tok/Char | Tok/Sent |`,
    `|------|------|------|--------|--------|--------|-------|-------|----------|----------|----------|`,
  ];

  const dataRows = result.rows.map((row) => {
    const tokPerWord = row.tokensPerWord.toFixed(4);
    const tokPerChar = row.tokensPerCharacter.toFixed(4);
    const tokPerSent = row.tokensPerSentence.toFixed(2);
    return `| ${row.rank} | ${row.code} | ${row.name} | ${row.script} | ${row.family} | ${row.totalTokens} | ${row.totalWords} | ${row.totalCharacters} | ${tokPerWord} | ${tokPerChar} | ${tokPerSent} |`;
  });

  return [...header, ...dataRows].join('\n');
}
