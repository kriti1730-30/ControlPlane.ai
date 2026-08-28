import { useEffect, useRef, useState } from 'react';

// Returns a rolling history of mic amplitude samples — oldest at index 0,
// newest at the last index — refreshed each animation frame.
//
// Why time-domain history instead of a frequency snapshot:
//   A spectrum bar chart jitters in place because each bar is a different
//   frequency band that only correlates loosely with what the user perceives
//   as "loudness". A time-domain history, by contrast, scrolls left as new
//   samples push in from the right — exactly how voice-memo / dictation apps
//   visualise live audio, so users intuitively read it as "this is what just
//   happened in the last second of speech".
//
// Internals:
//   1. getUserMedia → AnalyserNode → getByteTimeDomainData each RAF
//   2. Compute peak deviation from the 128 midpoint (a cheap loudness proxy)
//   3. Push onto a circular buffer of length `samples`
//   4. setState with a copy so React re-renders without aliasing
//
// When `enabled` flips back off the audio graph is torn down and the mic
// tracks are stopped so the browser's recording indicator clears.

const FLOOR = 0.04; // resting bar height as a fraction (idle look)

export function useMicLevels(enabled: boolean, samples = 80): number[] {
  const [history, setHistory] = useState<number[]>(() =>
    new Array(samples).fill(FLOOR),
  );
  const samplesRef = useRef(samples);
  useEffect(() => {
    samplesRef.current = samples;
  }, [samples]);

  useEffect(() => {
    // When recording stops, drain the bars to floor immediately.
    if (!enabled) {
      setHistory(new Array(samplesRef.current).fill(FLOOR));
      return;
    }

    let cancelled = false;
    let raf = 0;
    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;
    const buffer: number[] = new Array(samplesRef.current).fill(FLOOR);

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        ctx = new AC();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);

        const td = new Uint8Array(analyser.fftSize);

        function tick() {
          if (cancelled) return;
          analyser.getByteTimeDomainData(td);
          // Peak deviation from the 128 mid-line over this frame's window.
          // Peak (rather than RMS) makes plosives + clear syllables pop while
          // background hum stays low — better visual cadence with speech.
          let peak = 0;
          for (let i = 0; i < td.length; i++) {
            const d = Math.abs(td[i] - 128);
            if (d > peak) peak = d;
          }
          const norm = Math.min(1, (peak / 128) * 1.6);
          const value = Math.max(FLOOR, norm);

          // Shift left, append newest on the right.
          buffer.shift();
          buffer.push(value);
          setHistory(buffer.slice());

          raf = requestAnimationFrame(tick);
        }
        tick();
      } catch {
        // Mic denied / unsupported — leave bars at floor; the UI keeps working
        // because SpeechRecognition continues to drive the transcript.
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close().catch(() => {});
    };
  }, [enabled]);

  return history;
}
