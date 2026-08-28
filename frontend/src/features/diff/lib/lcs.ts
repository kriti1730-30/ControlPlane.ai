// Token-level diff via Longest Common Subsequence (LCS).
//
// Algorithm:
//   1. Build an (n+1) × (m+1) DP table where dp[i][j] = length of the LCS of
//      a[0..i) and b[0..j).
//      Recurrence:
//          if a[i-1] === b[j-1]: dp[i][j] = dp[i-1][j-1] + 1
//          else:                 dp[i][j] = max(dp[i-1][j], dp[i][j-1])
//   2. Backtrack from dp[n][m] → dp[0][0] to recover the edit script:
//        - diagonal step (match) → 'equal'
//        - up step             → 'delete' (token only in a)
//        - left step           → 'insert' (token only in b)
//      The choice of up-vs-left when dp[i-1][j] === dp[i][j-1] is arbitrary;
//      we prefer 'delete' first to produce stable left-leaning diffs.
//
// Complexity:
//   Time:  O(n · m)   — one constant-time check per DP cell
//   Space: O(n · m)   — full table retained for backtracking
//
//   For chat-style outputs (~200-500 tokens each) this is well under 1 ms in
//   a modern browser. If memory ever mattered we could drop to O(min(n, m))
//   via Hirschberg's divide-and-conquer refinement, at the cost of more code.
//
// Why LCS over alternatives:
//   - Myers diff is O((n+m)·D) where D = edit distance, so it's faster when
//     two outputs are very similar. But it's significantly trickier to
//     implement correctly by hand (the snake/k-line bookkeeping), and the
//     assignment forbids external libraries. LCS gives a textbook-correct
//     diff in ~30 lines we can fully reason about.
//   - Patience diff relies on tokens that are unique in both sequences as
//     anchors, then falls back to LCS in between. It produces nicer diffs
//     for source code where line-level uniqueness is common, but for natural
//     language output the unique-token assumption rarely holds.
//   - Line-level diff was explicitly disallowed.

import { isWhitespace } from './tokenize';

export type DiffOpType = 'equal' | 'delete' | 'insert';

export interface DiffOp {
  type: DiffOpType;
  token: string;
}

// Build the full LCS length table. Exposed for testing / introspection.
export function lcsTable(a: readonly string[], b: readonly string[]): Uint32Array[] {
  const n = a.length;
  const m = b.length;
  const dp: Uint32Array[] = new Array(n + 1);
  for (let i = 0; i <= n; i++) dp[i] = new Uint32Array(m + 1);

  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1];
    const row = dp[i];
    const prev = dp[i - 1];
    for (let j = 1; j <= m; j++) {
      if (ai === b[j - 1]) row[j] = prev[j - 1] + 1;
      else row[j] = prev[j] >= row[j - 1] ? prev[j] : row[j - 1];
    }
  }

  return dp;
}

// Compute the diff edit script between two token sequences.
export function diffTokens(a: readonly string[], b: readonly string[]): DiffOp[] {
  // Trim shared prefix / suffix — a common-sense optimisation that keeps
  // the DP small when the two inputs share large unchanged regions.
  let prefix = 0;
  const minLen = Math.min(a.length, b.length);
  while (prefix < minLen && a[prefix] === b[prefix]) prefix++;

  let suffix = 0;
  while (
    suffix < minLen - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++;
  }

  const aMid = a.slice(prefix, a.length - suffix);
  const bMid = b.slice(prefix, b.length - suffix);

  const ops: DiffOp[] = [];
  for (let k = 0; k < prefix; k++) ops.push({ type: 'equal', token: a[k] });

  // LCS + backtrack on the middle region only.
  const dp = lcsTable(aMid, bMid);
  let i = aMid.length;
  let j = bMid.length;
  const mid: DiffOp[] = [];
  while (i > 0 && j > 0) {
    if (aMid[i - 1] === bMid[j - 1]) {
      mid.push({ type: 'equal', token: aMid[i - 1] });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      mid.push({ type: 'delete', token: aMid[i - 1] });
      i--;
    } else {
      mid.push({ type: 'insert', token: bMid[j - 1] });
      j--;
    }
  }
  while (i > 0) {
    mid.push({ type: 'delete', token: aMid[--i] });
  }
  while (j > 0) {
    mid.push({ type: 'insert', token: bMid[--j] });
  }
  mid.reverse();
  ops.push(...mid);

  const aLen = a.length;
  for (let k = aLen - suffix; k < aLen; k++) ops.push({ type: 'equal', token: a[k] });

  return ops;
}

// ---------------------------------------------------------------------------
// Stats — counted on word tokens only, so whitespace doesn't inflate the diff.
// ---------------------------------------------------------------------------

export interface DiffStats {
  added: number;     // tokens only in b
  removed: number;   // tokens only in a
  unchanged: number; // tokens present in both
}

export function computeStats(ops: readonly DiffOp[]): DiffStats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const op of ops) {
    if (isWhitespace(op.token)) continue;
    if (op.type === 'insert') added++;
    else if (op.type === 'delete') removed++;
    else unchanged++;
  }

  return { added, removed, unchanged };
}

// ---------------------------------------------------------------------------
// foldUnchanged — collapse long runs of unchanged tokens into a single fold
// marker, keeping `context` word tokens of breathing room around every change.
//
// Used by the "Show only changes" view so engineers reviewing long outputs can
// jump straight to the differences without scrolling past paragraphs of
// identical text.
// ---------------------------------------------------------------------------

export interface FoldOp {
  type: 'fold';
  /** Number of word tokens hidden by this fold. */
  count: number;
}

export type RenderOp = DiffOp | FoldOp;

export function foldUnchanged(ops: readonly DiffOp[], context = 4): RenderOp[] {
  const n = ops.length;
  if (n === 0) return [];

  // Mark indices that are within `context` non-whitespace tokens of any change.
  const keep = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (ops[i].type === 'equal') continue;
    keep[i] = true;

    // Walk left, keeping until we've seen `context` word tokens
    let leftWords = 0;
    for (let j = i - 1; j >= 0 && leftWords < context; j--) {
      keep[j] = true;
      if (!isWhitespace(ops[j].token)) leftWords++;
    }
    // Walk right
    let rightWords = 0;
    for (let j = i + 1; j < n && rightWords < context; j++) {
      keep[j] = true;
      if (!isWhitespace(ops[j].token)) rightWords++;
    }
  }

  // Emit ops, folding consecutive runs of !keep indices.
  const out: RenderOp[] = [];
  let i = 0;
  while (i < n) {
    if (keep[i]) {
      out.push(ops[i]);
      i++;
    } else {
      let count = 0;
      while (i < n && !keep[i]) {
        if (!isWhitespace(ops[i].token)) count++;
        i++;
      }
      if (count > 0) out.push({ type: 'fold', count });
    }
  }
  return out;
}
