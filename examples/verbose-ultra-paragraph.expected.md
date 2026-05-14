# verbose-ultra-paragraph

Expands a plain 3-sentence paragraph using the `verbose-ultra` pipeline: synonym inflation, dense qualifier injection, nominalizations, and passive-voice heuristics.

## Command

```bash
tokenmaxxingman expand examples/verbose-ultra-paragraph.input.txt --mode verbose-ultra
```

## Input

```
The team fixed the bug before the deadline. Everyone helped with the review. We need to start the next sprint soon.
```

## Output

```
It is, of course, important to note that the team fixed the bug prior to the temporally antecedent moment of the deadline, as the case may be. Everyone helped with the conduct a review of. As any reasonable person would readily acknowledge, we necessitate to commence the next sprint soon, for what it is worth.
```

## Notes

- Qualifiers are injected deterministically by sentence index (no randomness).
- `fix` → `fixed` is preserved; synonym substitution targets uninflected verb forms.
- `need` → `necessitate`, `start` → `commence` are nominalization/synonym transforms.
- The passive heuristic fires on simple SVO patterns only; complex sentences are left unchanged.
