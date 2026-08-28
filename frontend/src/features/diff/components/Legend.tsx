import { COLORS, FONTS, FONT_SIZE, SPACE } from '../../../constants';

/** Tiny legend showing what the green / red chips mean. */
export default function Legend() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
      <LegendDot color={COLORS.success} bg={COLORS.successBg} label="Added" />
      <LegendDot color={COLORS.danger} bg={COLORS.dangerBg} label="Removed" />
    </div>
  );
}

function LegendDot({
  color,
  bg,
  label,
}: {
  color: string;
  bg: string;
  label: string;
}) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: SPACE[2] }}>
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 12,
          height: 12,
          borderRadius: 3,
          backgroundColor: bg,
          border: `1px solid ${color}33`,
        }}
      />
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.xs,
          color: COLORS.ink[600],
        }}
      >
        {label}
      </span>
    </div>
  );
}
