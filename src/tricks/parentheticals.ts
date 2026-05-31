const LEVEL_ONE_ASIDES: readonly string[] = [
  'though one might argue (and indeed many have argued (often without success)) that this is a matter of perspective',
  'notwithstanding the obvious (and frequently overlooked (much to the detriment of clarity)) counterarguments',
  'as is commonly supposed (though rarely demonstrated (with any degree of rigour)) in the relevant literature',
  'despite appearances to the contrary (which are, themselves (if examined closely), somewhat misleading)',
  'which most observers accept (though a vocal minority dissent (not always for defensible reasons))',
  'a position held by many (if not all (and arguably not even most)) commentators on the subject',
  'a claim that is (at least superficially (if not upon deeper examination)) broadly plausible',
  'subject to the usual caveats (which are (as always (and somewhat tediously)) numerous and important)',
  'setting aside (for the moment (and possibly for longer than strictly necessary)) the obvious objections',
  'which is (it must be admitted (however reluctantly)) a rather difficult proposition to defend',
  'an assertion that (while convenient (and therefore popular (among those who prefer convenience to accuracy))) remains contested',
  'proceeding on the assumption (which may be (and likely is) overly charitable) that the reader is persuaded',
  'a conclusion that (to the surprise of few (and the relief of even fewer)) admits of no easy resolution',
  'bearing in mind (though not dwelling upon (which would be excessive)) the full weight of the counterevidence',
  'with all due respect to those who disagree (and there are many (more, perhaps, than is generally acknowledged))',
];

const CONJUNCTIONS_PATTERN = /\b(and|but|or|however)\b/gi;

export function parentheticals(input: string): string {
  if (input.trim().length === 0) return input;

  let matchCount = 0;
  const result = input.replace(CONJUNCTIONS_PATTERN, (match) => {
    const aside = LEVEL_ONE_ASIDES[matchCount % LEVEL_ONE_ASIDES.length];
    matchCount++;
    if (aside === undefined) return match;
    return `${match} (${aside})`;
  });

  return result;
}
