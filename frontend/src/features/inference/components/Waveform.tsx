import { COLORS, SPACE } from '../../../constants';

type Props = {
  /** Per-bar level in 0..1. When omitted, falls back to a static idle row. */
  levels?: number[];
};

/**
 * Audio waveform shown while the mic is recording. When `levels` are provided
 * (driven by `useMicLevels`), each bar's height tracks live mic volume; the
 * bars also mirror left↔right around the centre for a balanced VU-meter look.
 */
export default function Waveform({ levels }: Props) {
  const bars = levels ?? new Array(14).fill(0.18);
  // Mirror around the centre so the loudest energy radiates from the middle.
  const n = bars.length;
  const mirrored = bars.map((_, i) => {
    const d = Math.abs(i - (n - 1) / 2);
    const idx = Math.round((n - 1) / 2 - d);
    return bars[idx] ?? 0;
  });

  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[1],
        height: 40,
      }}
    >
      {mirrored.map((level, i) => {
        const h = Math.round(8 + level * 32); // 8..40 px
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 3,
              height: h,
              borderRadius: 2,
              backgroundColor: COLORS.ink[800],
              transition: 'height 80ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        );
      })}
    </div>
  );
}
