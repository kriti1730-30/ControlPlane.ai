import type { ReactNode } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACE,
} from '../../../constants';

type Variant = 'add' | 'remove' | 'neutral';

type Props = {
  icon: ReactNode;
  value: number;
  variant: Variant;
};

const COLOURS: Record<Variant, { bg: string; fg: string }> = {
  add: { bg: COLORS.successBg, fg: COLORS.success },
  remove: { bg: COLORS.dangerBg, fg: COLORS.danger },
  neutral: { bg: COLORS.cream[200], fg: COLORS.ink[600] },
};

/** Small +N / -N / =N pill shown in the diff page header. */
export default function StatChip({ icon, value, variant }: Props) {
  const c = COLOURS[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        paddingLeft: SPACE[3],
        paddingRight: SPACE[3],
        paddingTop: SPACE[1],
        paddingBottom: SPACE[1],
        borderRadius: RADIUS.pill,
        backgroundColor: c.bg,
        color: c.fg,
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.medium,
        lineHeight: 1.4,
      }}
    >
      {icon}
      <span style={{ fontFamily: FONTS.mono, minWidth: 16, textAlign: 'right' }}>
        {value}
      </span>
    </span>
  );
}
