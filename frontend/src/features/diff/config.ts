// Per-feature config for the Diff View. Model fixtures, the canonical sample
// prompt, the canned per-model outputs, and the model-to-hue mapping all live
// here so the page composition stays focused on orchestration.

export type ModelHue =
  | 'lavender'
  | 'peach'
  | 'rose'
  | 'mint'
  | 'sand'
  | 'sky';

export type ViewMode = 'split' | 'unified';

export const MODELS = [
  { value: 'Sarvam 8B', description: 'Compact, on-device ready' },
  { value: 'Sarvam 30B', description: 'Fast & efficient' },
  { value: 'Sarvam 105B', description: 'Best quality, deeper reasoning' },
] as const;

export const DEFAULT_MODEL_A = 'Sarvam 30B';
export const DEFAULT_MODEL_B = 'Sarvam 105B';

const MODEL_HUES: Record<string, ModelHue> = {
  'Sarvam 8B': 'peach',
  'Sarvam 30B': 'mint',
  'Sarvam 105B': 'lavender',
};

export function hueForModel(model: string): ModelHue {
  return MODEL_HUES[model] ?? 'lavender';
}

// -------- Demo fixtures --------

export const SAMPLE_PROMPT =
  'What are the key features of the Sarvam AI inference platform?';

export const SAMPLE_OUTPUT_A = `Sarvam AI provides state-of-the-art language models optimised for Indian languages. The platform supports eleven major Indian languages including Hindi, Bengali, Tamil, and Telugu.

Our models handle Devanagari and Dravidian scripts natively. The inference engine is built for low latency, making it suitable for voice assistants and customer support bots.

Prompt caching and batched inference are supported out of the box.`;

export const SAMPLE_OUTPUT_B = `Sarvam AI delivers state-of-the-art foundation models built for Indian languages. The platform supports twelve major Indian languages including Hindi, Bengali, Tamil, Telugu, and Marathi.

Our models handle Devanagari, Dravidian, and Perso-Arabic scripts natively. The inference engine is optimised for sub-second latency, making it ideal for voice assistants, conversational agents, and customer support bots.

Prompt caching, speculative decoding, and batched inference are all supported out of the box.`;

const SAMPLE_OUTPUT_8B = `Sarvam AI offers compact language models for Indian languages. Supports ten Indian languages including Hindi, Bengali, Tamil, and Telugu.

Handles Devanagari scripts. The engine targets low latency for on-device use cases like voice assistants and IVR bots.

Prompt caching is supported.`;

export const MODEL_RESPONSES: Record<string, string> = {
  'Sarvam 8B': SAMPLE_OUTPUT_8B,
  'Sarvam 30B': SAMPLE_OUTPUT_A,
  'Sarvam 105B': SAMPLE_OUTPUT_B,
};
