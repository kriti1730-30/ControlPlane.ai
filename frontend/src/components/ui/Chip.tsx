import type { ReactNode } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

type Props = {
  children: ReactNode;
};

// dashboard.sarvam.ai:
//   px-tatva-3 py-tatva-1 rounded-full text-xs
//   bg-tatva-background-secondary text-tatva-content-secondary
export default function Chip({ children }: Props) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        paddingTop: SPACE[1],
        paddingBottom: SPACE[1],
        paddingLeft: SPACE[3],
        paddingRight: SPACE[3],
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.cream[200],
        color: COLORS.ink[600],
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.xs,
        fontWeight: FONT_WEIGHT.regular,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
