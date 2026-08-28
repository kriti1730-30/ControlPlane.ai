import type { ReactNode } from 'react';
import { COLORS, FONTS } from '../../../constants';

/** Tiny keyboard-key glyph used in the hint row. */
export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 5,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border.strong}`,
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: COLORS.ink[700],
        lineHeight: 1,
        boxShadow: '0 1px 1px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </kbd>
  );
}
