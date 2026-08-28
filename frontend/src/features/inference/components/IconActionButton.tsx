import type { ReactNode } from 'react';
import { COLORS, RADIUS, SPACE } from '../../../constants';

type Props = {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
};

/**
 * Small (36px) outlined round icon button used in the output toolbar — copy,
 * regenerate, thumbs up/down, etc.
 */
export default function IconActionButton({ children, onClick, ariaLabel }: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      title={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SPACE[18],
        height: SPACE[18],
        borderRadius: RADIUS.pill,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        backgroundColor: COLORS.surface,
        color: COLORS.ink[700],
        cursor: 'pointer',
        transition: 'background-color 120ms, border-color 120ms',
      }}
      className="hover:bg-tatva-surface-secondary focus-visible:outline-none focus-visible:ring-2"
    >
      {children}
    </button>
  );
}
