// Sarvam design system — typography (Matter + Season Mix).
// All sizes calibrated against dashboard.sarvam.ai DOM inspections.

export const FONTS = {
  sans: '"Matter", system-ui, -apple-system, sans-serif',
  display: '"Season Mix", "Matter", system-ui, sans-serif',
  mono: '"Matter Mono", ui-monospace, Consolas, monospace',
} as const;

export const FONT_SIZE = {
  xs: '12px',
  sm: '14px',
  md: '15px',  // body / nav / list-title / button — matches Sarvam DOM
  lg: '18px',
  xl: '20px',  // page title ("Welcome") — Season Mix 500
  '2xl': '24px', // section title ("Voices That Feel Real") — Season Mix 500
  '3xl': '32px',
  '4xl': '40px',
  wordmark: '16px', // sidebar "sarvam" logo — Matter 400, ink[700]
} as const;

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

export const LINE_HEIGHT = {
  tight: 1.2,    // 24px@20px (Welcome), 29px@24px (section titles)
  snug: 1.35,
  normal: 1.5,   // 24px@16px (wordmark)
  relaxed: 1.467, // 22px@15px (body, tagline, list title, button)
} as const;

export const LETTER_SPACING = {
  tighter: '-0.02em',
  tight: '-0.01em',
  normal: '0',
  wide: '0.04em',
  wider: '0.06em',
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 9999,
} as const;

export const ICON = {
  strokeWidth: 2, // matches dashboard.sarvam.ai SVG stroke-width="2"
  nav: 16,
  button: 14,
  feature: 18,
  play: 14,
} as const;
