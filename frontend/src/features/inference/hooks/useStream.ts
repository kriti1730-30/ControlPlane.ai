import { useCallback, useRef, useState } from 'react';
import { mockInference } from '../lib/mockStream';

export type StreamStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface StreamState {
  output: string;
  status: StreamStatus;
  error: string | null;
}

export interface UseStreamReturn extends StreamState {
  start: (prompt: string, errorAt?: number | null) => Promise<void>;
  stop: () => void;
  reset: () => void;
  setOnToken: (cb: ((token: string) => void) | null) => void;
}

const INITIAL: StreamState = { output: '', status: 'idle', error: null };

export function useStream(): UseStreamReturn {
  const [state, setState] = useState<StreamState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  const onTokenRef = useRef<((token: string) => void) | null>(null);

  const setOnToken = useCallback((cb: ((token: string) => void) | null) => {
    onTokenRef.current = cb;
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(INITIAL);
  }, []);

  const start = useCallback(async (prompt: string, errorAt: number | null = null) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ output: '', status: 'streaming', error: null });

    try {
      const response = await mockInference(prompt, {
        errorAt,
        signal: controller.signal,
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines: "data: {...}\n\n"
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          try {
            const json = JSON.parse(trimmed.slice(5).trim()) as { token: string };
            const token = json.token;
            // Count only content tokens, not whitespace runs — matches how
            // real LLM token counters behave for end users.
            if (!/^\s+$/.test(token)) onTokenRef.current?.(token);
            // Append the token verbatim so whitespace / newlines from the
            // server stream survive intact in the rendered output.
            setState((prev) => ({
              ...prev,
              output: prev.output + token,
            }));
          } catch {
            // malformed chunk — skip
          }
        }
      }

      setState((prev) => ({ ...prev, status: 'done' }));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User stopped — preserve partial output, mark done
        setState((prev) => ({ ...prev, status: 'done' }));
        return;
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      // Preserve partial output, show error state
      setState((prev) => ({ ...prev, status: 'error', error: message }));
    }
  }, []);

  return {
    ...state,
    start,
    stop,
    reset,
    setOnToken,
  };
}
