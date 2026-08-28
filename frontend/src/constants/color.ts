// Sarvam design system — colour tokens (from dashboard.sarvam.ai)
// Single source of truth. Import from here everywhere.

export const COLORS = {
  cream: {
    50: '#ffffff',
    100: '#fafafa', // shell + sidebar
    200: '#f5f5f5', // active nav pill
    300: '#f0f0f0',
  },

  surface: '#ffffff',
  surfaceMuted: '#fafafa',

  ink: {
    900: '#141414',
    800: '#1a1a1a',
    700: '#333333',
    600: '#666666',
    500: '#999999',
    400: '#b3b3b3',
    300: '#d6d6d6',
    200: '#e5e5e5',
  },

  border: {
    DEFAULT: '#f0f0f0',
    soft: '#f5f5f5',
    strong: '#e6e6e6',
  },

  accent: {
    peach: '#f59666',
    pink: '#f070a0',
    rose: '#dc6e8a',
    lavender: '#7c96e6',
    sky: '#9bb8e0',
    mint: '#82b84a',
    butter: '#e8b85a',
    sand: '#d4a574',
  },

  gradient: {
    green: 'linear-gradient(135deg, #c8e6a0 0%, #568418 100%)',
    indigo: 'linear-gradient(135deg, #a7c0f0 0%, #5151cc 100%)',
    orange: 'linear-gradient(135deg, #f5c896 0%, #e6652f 100%)',
    coral: 'linear-gradient(135deg, #f5b5c4 0%, #e88daa 100%)',
    red: 'linear-gradient(135deg, #f5a090 0%, #b81514 100%)',
  },

  danger: '#b81514',
  dangerBg: '#fde7e2',
  success: '#6ea335',
  successBg: '#f2f8eb',

  // Tatva tag colours — used by voice-card badges (Male/Female) and starred state
  tag: {
    indigo: { bg: '#e0e7ff', fg: '#3730a3' }, // bg-tatva-indigo-100 / text-tatva-indigo-800
    pink: { bg: '#fce7f3', fg: '#9d174d' },   // bg-tatva-pink-100 / text-tatva-pink-800
    amber: '#f59e0b',                          // star colour rgb(245, 158, 11)
  },
} as const;

export type ColorToken = typeof COLORS;
