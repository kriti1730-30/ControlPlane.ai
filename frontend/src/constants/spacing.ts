// Spacing scale — single linear scale matching Tatva (dashboard.sarvam.ai).
//
// Each step is 2px. The numeric key matches Sarvam's `tatva-N` class names:
//   SPACE[12] === 24px === `px-tatva-12` / `gap-tatva-12`.
//
// Use SPACE directly everywhere instead of component-specific buckets:
//   padding: SPACE[12],          // 24px
//   gap: SPACE[28],              // 56px
//   width: SIZE.sidebarWidth,    // fixed dimension, off the scale
//
// For one-off values that aren't on the scale, use `space(n)`:
//   marginTop: space(3),         // 6px
//
const UNIT = 2;

export const SPACE = {
  0: 0,
  1: UNIT * 1,    //   2px
  2: UNIT * 2,    //   4px
  3: UNIT * 3,    //   6px
  4: UNIT * 4,    //   8px
  5: UNIT * 5,    //  10px
  6: UNIT * 6,    //  12px
  8: UNIT * 8,    //  16px
  10: UNIT * 10,  //  20px
  12: UNIT * 12,  //  24px
  14: UNIT * 14,  //  28px
  16: UNIT * 16,  //  32px
  18: UNIT * 18,  //  36px — nav item height (h-tatva-18)
  20: UNIT * 20,  //  40px
  22: UNIT * 22,  //  44px — md button min-height (min-h-tatva-22)
  24: UNIT * 24,  //  48px
  28: UNIT * 28,  //  56px
  32: UNIT * 32,  //  64px
  40: UNIT * 40,  //  80px
  48: UNIT * 48,  //  96px
  60: UNIT * 60,  // 120px
} as const;

// Ad-hoc multiplier for values not present on the standard scale.
export const space = (n: number) => UNIT * n;

// Fixed sizes that aren't part of the spacing scale.
export const SIZE = {
  sidebarWidth: 240,
  heroMaxWidth: 360,
  orbSize: 44,
  transcriptCardHeight: 320, // h-tatva-160 — Best-in-class Speech to Text card
  voiceAvatar: 56,           // w-tatva-28 / h-tatva-28 — voice card play button
} as const;
