# benchmark-markdown

Runs the tokenization benchmark against the bundled 8-sentence corpus and outputs a ranked markdown table. The benchmark is fully deterministic: results are stable as long as `gpt-tokenizer` and `data/corpus.json` are unchanged.

## Command

```bash
tokenmaxxingman benchmark --format markdown
```

## Output

```
# tokenmaxxingman benchmark

Encoding: `cl100k_base` · Corpus v1 · Generated <timestamp>

| Rank | Code | Name | Script | Family | Tokens | Chars | Tok/Char | Tok/Sent |
|------|------|------|--------|--------|--------|-------|----------|----------|
| 1 | iu-cans | Inuktitut (Unified Canadian Aboriginal Syllabics) | Canadian Aboriginal Syllabics | natural | 463 | 177 | 2.6158 | 57.88 |
| 2 | am | Amharic | Ethiopic | natural | 370 | 148 | 2.5000 | 46.25 |
| 3 | chr | Cherokee | Cherokee | natural | 351 | 142 | 2.4718 | 43.88 |
| 4 | bo | Tibetan | Tibetan | natural | 463 | 227 | 2.0396 | 57.88 |
| 5 | my | Burmese | Myanmar | natural | 532 | 269 | 1.9777 | 66.50 |
| 6 | ka | Georgian | Georgian | natural | 391 | 213 | 1.8357 | 48.88 |
| 7 | si | Sinhala | Sinhala | natural | 352 | 195 | 1.8051 | 44.00 |
| 8 | te | Telugu | Telugu | natural | 401 | 227 | 1.7665 | 50.13 |
| 9 | km | Khmer | Khmer | natural | 389 | 225 | 1.7289 | 48.63 |
| 10 | ml | Malayalam | Malayalam | natural | 363 | 222 | 1.6351 | 45.38 |
| 11 | zh-classical | Classical Chinese (wenyan) | Han | natural | 85 | 55 | 1.5455 | 10.63 |
| 12 | ta | Tamil | Tamil | natural | 329 | 233 | 1.4120 | 41.13 |
| 13 | zh-modern | Modern Chinese (Mandarin) | Han | natural | 89 | 65 | 1.3692 | 11.13 |
| 14 | fi | Finnish | Latin | natural | 91 | 219 | 0.4155 | 11.38 |
| 15 | tr | Turkish | Latin | natural | 81 | 199 | 0.4070 | 10.13 |
| 16 | en | English | Latin | natural | 53 | 210 | 0.2524 | 6.63 |
| 17 | en-victorian | Victorian prose | Latin | register | 217 | 1031 | 0.2105 | 27.13 |
| 18 | en-legalese | Legalese | Latin | register | 208 | 1065 | 0.1953 | 26.00 |
```

## Notes

- **Rank 1 winner:** Inuktitut (Unified Canadian Aboriginal Syllabics) at 2.6158 tokens/char under `cl100k_base`. The Syllabics script is largely outside the BPE vocabulary, so each character costs close to one full token.
- **Baseline (last natural language):** Classical Chinese at 1.5455 tokens/char — dense meaning-per-character is the inverse of the token-maxxing goal, which is why zh-classical serves as the density baseline.
- The `Generated` timestamp in the header will differ on each run; all numeric values are deterministic.
- Run with `--encoding o200k_base` to compare against the o200k vocabulary.
