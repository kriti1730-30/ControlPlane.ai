// Token-level mock streamer used by the Diff page. Implements the Fetch +
// ReadableStream contract from the assignment so the two streams can pipe
// into the diff in parallel and the LCS recomputes live as tokens arrive.

export function createTokenStream(
  text: string,
  signal: AbortSignal,
): ReadableStream<string> {
  const tokens = text.match(/\s+|\S+/g) ?? [];
  let idx = 0;

  return new ReadableStream<string>({
    start(controller) {
      function push() {
        if (signal.aborted || idx >= tokens.length) {
          controller.close();
          return;
        }
        controller.enqueue(tokens[idx++]);
        setTimeout(push, 18 + Math.random() * 38);
      }
      push();
    },
    cancel() {
      idx = tokens.length;
    },
  });
}

/** Drain a `createTokenStream` into a callback. Aborts honour the signal. */
export async function streamInto(
  text: string,
  signal: AbortSignal,
  onToken: (chunk: string) => void,
): Promise<void> {
  const stream = createTokenStream(text, signal);
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done || value === undefined) break;
    onToken(value);
  }
}
