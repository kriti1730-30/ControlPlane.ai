import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  RADIUS,
  SPACE,
} from '../../../constants';

type Status = 'idle' | 'streaming' | 'done' | 'error' | string;

const MAP: Record<string, { label: string; bg: string; color: string; dot?: boolean }> = {
  streaming: { label: 'Streaming', bg: COLORS.successBg, color: COLORS.success, dot: true },
  done: { label: 'Done', bg: COLORS.cream[200], color: COLORS.ink[700] },
  error: { label: 'Error', bg: COLORS.dangerBg, color: COLORS.danger },
  idle: { label: 'Idle', bg: COLORS.cream[200], color: COLORS.ink[500] },
};

/** Aria-live status indicator for the streaming state. */
export default function StatusPill({ status }: { status: Status }) {
  const pill = MAP[status] ?? MAP['idle'];

  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        paddingLeft: SPACE[4],
        paddingRight: SPACE[4],
        paddingTop: SPACE[2],
        paddingBottom: SPACE[2],
        borderRadius: RADIUS.pill,
        backgroundColor: pill.bg,
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
        color: pill.color,
        letterSpacing: LETTER_SPACING.wide,
        textTransform: 'uppercase',
      }}
    >
      {pill.dot && (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: pill.color,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      )}
      {pill.label}
    </span>
  );
}
