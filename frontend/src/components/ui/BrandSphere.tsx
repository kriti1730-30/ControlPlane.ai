import { COLORS } from '../../constants';
import AccentOrb from './AccentOrb';

type Hue = Parameters<typeof AccentOrb>[0]['hue'];

type Props = {
  /** Model-themed gradient — drives the orb colour. */
  hue: Hue;
  /** Outer sphere diameter in px. */
  size?: number;
  /** Monogram diameter — defaults to 40% of `size`. */
  monogramSize?: number;
};

/**
 * Sarvam brand sphere — the gradient AccentOrb stacked with a top-left
 * specular highlight and the white Sarvam monogram. Used everywhere a model
 * is represented as a large avatar (empty states for inference + diff).
 *
 * Three stacked layers:
 *   1. AccentOrb avatar (model-themed gradient background)
 *   2. Radial highlight at 30%/25% — gives the sphere a 3D shine
 *   3. Sarvam monogram, inverted to white via filter
 */
export default function BrandSphere({
  hue,
  size = 120,
  monogramSize,
}: Props) {
  const mono = monogramSize ?? Math.round(size * 0.4);

  return (
    <div
      aria-hidden
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08)',
        flexShrink: 0,
      }}
    >
      {/* Layer 1 — gradient avatar */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <AccentOrb hue={hue} size={size} />
      </div>

      {/* Layer 2 — specular highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.35) 0%, transparent 45%)',
        }}
      />

      {/* Layer 3 — Sarvam monogram, inverted to white */}
      <img
        alt=""
        src="/sarvam-mono-gram.png"
        draggable={false}
        style={{
          width: mono,
          height: mono,
          filter: `brightness(0) invert(1) drop-shadow(0 1px 2px ${COLORS.ink[900]}40)`,
          position: 'relative',
          zIndex: 1,
          userSelect: 'none',
        }}
      />
    </div>
  );
}
