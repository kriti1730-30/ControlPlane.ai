// Per-feature config for the Inference Playground. Keeping models, example
// prompts, and the model-to-orb-hue mapping here makes it easy to swap in real
// values once the backend is wired up.

export type ModelHue =
  | 'lavender'
  | 'peach'
  | 'rose'
  | 'mint'
  | 'sand'
  | 'sky';

export const MODELS = [
  { value: 'Sarvam 8B', description: 'Compact, on-device ready' },
  { value: 'Sarvam 30B', description: 'Fast & efficient' },
  { value: 'Sarvam 105B', description: 'Best quality, deeper reasoning' },
] as const;

export const DEFAULT_MODEL = 'Sarvam 105B';

// Each model gets its own avatar gradient (see components/ui/AccentOrb.tsx
// for hue → SVG mapping). Three visually distinct hues so they stay easy to
// tell apart in the dropdown and the empty-state sphere.
const MODEL_HUES: Record<string, ModelHue> = {
  'Sarvam 8B': 'peach',
  'Sarvam 30B': 'mint',
  'Sarvam 105B': 'lavender',
};

export function hueForModel(model: string): ModelHue {
  return MODEL_HUES[model] ?? 'lavender';
}

// Probability into the stream at which we inject a simulated network failure
// when "Error demo" is on. 0.45 means ~45 % of tokens stream through before
// the error fires, leaving meaningful partial output.
export const ERROR_AT = 0.45;

// -------- Chat-settings defaults --------

export const DEFAULT_SYSTEM_INSTRUCTIONS = '';

// Sarvam's panel uses a 0–2 temperature range
export const TEMPERATURE_MIN = 0;
export const TEMPERATURE_MAX = 2;
export const DEFAULT_TEMPERATURE = 0.8;

export const MIN_MAX_TOKENS = 1;
export const MAX_MAX_TOKENS = 4096;
export const DEFAULT_MAX_TOKENS = 4096;

export const CONTEXT_WINDOWS = ['32K', '64K', '128K', '256K'] as const;
export const DEFAULT_CONTEXT_WINDOW = '128K';

export const REASONING_EFFORTS = ['Low', 'Medium', 'High'] as const;
export const DEFAULT_REASONING_EFFORT = 'Medium';

export type InputMode = 'text' | 'audio';

export const EXAMPLE_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: 'Platform features',
    prompt: 'What are the key features of the Sarvam AI inference platform?',
  },
  {
    label: 'Indic tokenisation',
    prompt:
      'Explain how the Sarvam tokeniser handles Indic scripts like Devanagari and Tamil.',
  },
  {
    label: 'Speculative decoding',
    prompt: 'Summarise speculative decoding in two sentences.',
  },
];
