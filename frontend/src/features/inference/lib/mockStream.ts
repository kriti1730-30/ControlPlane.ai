// Simulates a streaming inference API endpoint.
// Returns a ReadableStream that yields tokens with realistic timing.
// Pass errorAt (0-1) to inject a mid-stream failure at that fraction of the response.

const MOCK_RESPONSE = `The Sarvam AI platform provides state-of-the-art language models optimised for Indian languages and dialects. Our models support eleven major Indian languages including Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Marathi, Punjabi, Odia, and Urdu.

The inference engine is built for low latency and high throughput, making it suitable for real-time applications such as voice assistants, customer support bots, content generation, and document summarisation.

Our architecture uses a transformer-based foundation model fine-tuned on curated Indian-language corpora. The tokeniser handles Devanagari, Dravidian, and other Indic scripts natively, ensuring accurate token boundaries and efficient encoding.

Prompt caching, speculative decoding, and batched inference are all supported out of the box, allowing developers to optimise for either latency or cost depending on their use case.

For enterprise deployments, on-device inference is available for select model sizes, enabling air-gapped and privacy-sensitive workloads without sending data to the cloud.`;

function tokenize(text: string): string[] {
  // Match either a run of whitespace OR a run of non-whitespace. Keeping
  // whitespace as its own token lets the consumer reassemble the response
  // verbatim — including paragraph breaks — by concatenating tokens in order.
  return text.match(/\s+|\S+/g) ?? [];
}

export function createMockStream(
  errorAt: number | null = null,
): ReadableStream<Uint8Array> {
  const tokens = tokenize(MOCK_RESPONSE);
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      function push() {
        if (index >= tokens.length) {
          controller.close();
          return;
        }

        if (errorAt !== null && index / tokens.length >= errorAt) {
          controller.error(new Error('Stream interrupted: simulated network failure'));
          return;
        }

        const token = tokens[index++];
        // Emit SSE-style data line so the consumer can parse it uniformly
        const chunk = `data: ${JSON.stringify({ token })}\n\n`;
        controller.enqueue(encoder.encode(chunk));

        // Vary delay to simulate real model cadence
        const delay = 30 + Math.random() * 50;
        setTimeout(push, delay);
      }

      push();
    },
  });
}

// Simulates fetch() returning a streaming response body backed by the mock stream.
export async function mockInference(
  _prompt: string,
  options?: { errorAt?: number | null; signal?: AbortSignal },
): Promise<Response> {
  const errorAt = options?.errorAt ?? null;
  const signal = options?.signal;

  // Honour abort before we even start
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const stream = createMockStream(errorAt);

  // If signal fires, cancel the underlying stream
  signal?.addEventListener('abort', () => {
    stream.cancel().catch(() => {});
  });

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
