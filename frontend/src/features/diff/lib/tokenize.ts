// Token-level tokenizer for diff comparison.
//
// Strategy: split the input into an alternating sequence of whitespace runs
// and non-whitespace runs. Keeping whitespace as its own token means:
//   1. The diff can match identical whitespace structure (paragraph breaks,
//      indentation) the same way it matches words.
//   2. The renderer can skip painting a highlight background on whitespace
//      tokens, so the visual "chips" of inserted / deleted text stay word-
//      shaped and don't bleed into the gaps.
//
// Examples:
//   tokenize("hello world")   →  ["hello", " ", "world"]
//   tokenize("a  b\nc")       →  ["a", "  ", "b", "\n", "c"]
//   tokenize("")              →  []

export function tokenize(text: string): string[] {
  return text.match(/\s+|\S+/g) ?? [];
}

export function isWhitespace(token: string): boolean {
  return /^\s+$/.test(token);
}
