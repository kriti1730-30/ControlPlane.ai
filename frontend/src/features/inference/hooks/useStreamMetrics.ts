import { useCallback, useRef, useState } from 'react';

export interface StreamMetrics {
  tokenCount: number;
  tokensPerSecond: number;
}

export interface UseStreamMetricsReturn extends StreamMetrics {
  recordToken: () => void;
  resetMetrics: () => void;
}

export function useStreamMetrics(): UseStreamMetricsReturn {
  const [metrics, setMetrics] = useState<StreamMetrics>({ tokenCount: 0, tokensPerSecond: 0 });
  const startTimeRef = useRef<number | null>(null);
  const countRef = useRef(0);

  const recordToken = useCallback(() => {
    const now = performance.now();

    if (startTimeRef.current === null) {
      startTimeRef.current = now;
    }

    countRef.current += 1;
    const elapsed = (now - startTimeRef.current) / 1000; // seconds
    const tps = elapsed > 0 ? countRef.current / elapsed : 0;

    setMetrics({ tokenCount: countRef.current, tokensPerSecond: Math.round(tps * 10) / 10 });
  }, []);

  const resetMetrics = useCallback(() => {
    startTimeRef.current = null;
    countRef.current = 0;
    setMetrics({ tokenCount: 0, tokensPerSecond: 0 });
  }, []);

  return { ...metrics, recordToken, resetMetrics };
}
