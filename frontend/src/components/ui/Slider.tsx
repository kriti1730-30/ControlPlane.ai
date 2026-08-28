import { COLORS, RADIUS, SPACE } from '../../constants';

type Props = {
  value: number;        // 0 - 1
  ariaLabel: string;
};

// dashboard.sarvam.ai (Radix Slider visual):
//   track: h-tatva-4 (8px) rounded-full bg-tatva-background-secondary
//   filled: bg-tatva-content-quaternary
//   thumb:  h-tatva-8 (16px) w-tatva-12 (24px) rounded-full bg-tatva-background-primary
//           border border-tatva-border-secondary  shadow
export default function Slider({ value, ariaLabel }: Props) {
  const filledPct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <span
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={value}
      tabIndex={0}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: SPACE[10],
        cursor: 'pointer',
      }}
    >
      {/* Track */}
      <span
        aria-hidden
        style={{
          position: 'relative',
          height: SPACE[4],
          width: '100%',
          borderRadius: RADIUS.pill,
          backgroundColor: COLORS.cream[200], // background-secondary
          overflow: 'hidden',
        }}
      >
        {/* Filled portion */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${filledPct}%`,
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.ink[400], // content-quaternary-ish
          }}
        />
      </span>
      {/* Thumb */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: `calc(${filledPct}% - 12px)`,
          width: SPACE[12],
          height: SPACE[8],
          borderRadius: RADIUS.pill,
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border.strong}`,
          boxShadow: '0px 0px 18px 0px rgba(0,0,0,0.08)',
        }}
      />
    </span>
  );
}
