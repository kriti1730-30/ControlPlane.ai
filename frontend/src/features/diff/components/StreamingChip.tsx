import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  RADIUS,
  SPACE,
} from '../../../constants';

/** "Streaming" pill shown in the view-controls bar while a run is in flight. */
export default function StreamingChip() {
  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        paddingLeft: SPACE[3],
        paddingRight: SPACE[3],
        paddingTop: SPACE[1],
        paddingBottom: SPACE[1],
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.successBg,
        color: COLORS.success,
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
        letterSpacing: LETTER_SPACING.wide,
        textTransform: 'uppercase',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: COLORS.success,
          animation: 'pulse 1.4s ease-in-out infinite',
        }}
      />
      Streaming
    </span>
  );
}
