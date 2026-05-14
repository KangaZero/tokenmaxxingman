const FOOTNOTE_ASIDES: readonly string[] = [
  'it should be noted that this term, while in common usage, carries connotations not always intended',
  'the precise meaning of this word has been subject to considerable scholarly debate across multiple disciplines',
  'a careful reader will observe that this phrasing is, in fact, a conventional simplification of a more nuanced reality',
  'this expression, though widely employed, does not admit of a single unambiguous interpretation',
  'the word in question derives from a lineage of usage that is, to put it charitably, somewhat tangled',
  'one would be remiss not to acknowledge that this particular term is not universally accepted in all contexts',
  'the semantic load carried by this word is, upon reflection, rather heavier than it might initially appear',
  'it is worth pausing to appreciate that even this apparently simple term conceals substantial complexity',
  'the employment of this terminology is, strictly speaking, a matter of convention rather than logical necessity',
  'this phrase has acquired, over time, a somewhat specialised meaning that diverges from its etymological origins',
  'the casual reader may pass over this word without difficulty, but the attentive reader will note its ambiguity',
  'there exists within scholarly circles a not insignificant body of literature devoted to the precise definition of this term',
  'this concept, deceptively simple on its surface, has occupied the attention of numerous theorists',
  'the use of this word here is, admittedly, a somewhat loose application of its strictly technical definition',
  'it would be intellectually irresponsible to proceed without flagging that this term is contested',
  'the referent of this expression is, in certain philosophical traditions, considered deeply problematic',
  'a more rigorous treatment would demand a fuller unpacking of the assumptions embedded in this word',
  'the author acknowledges that this term is not the only possible choice and that alternatives exist',
  'this word, innocuous as it appears, has been known to generate considerable confusion among readers',
  'for the purposes of this discussion, a provisional and necessarily imprecise definition must suffice',
  'the full implications of this term are, regrettably, beyond the scope of the present discussion to explore',
  'suffice it to say that this phrase carries more theoretical weight than its apparent simplicity suggests',
];

export function footnotes(input: string): string {
  if (input.trim().length === 0) return input;

  const words = input.split(' ');
  if (words.length <= 1) return input;

  const result: string[] = [];
  let wordCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word === undefined) continue;
    result.push(word);
    wordCount++;

    // Insert footnote after every 3rd word.
    if (wordCount % 3 === 0) {
      const aside = FOOTNOTE_ASIDES[wordCount % FOOTNOTE_ASIDES.length];
      if (aside !== undefined) {
        result.push(`(${aside})`);
      }
    }
  }

  return result.join(' ');
}
