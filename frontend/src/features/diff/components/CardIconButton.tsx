import type { ReactNode } from 'react';
import { COLORS, RADIUS, SPACE } from '../../../constants';

type Props = {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
  active?: boolean;
  disabled?: boolean;
};

/** Compact icon button used in a diff card's header strip (copy / edit). */
export default function CardIconButton({
  children,
  onClick,
  ariaLabel,
  active,
  disabled,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SPACE[16],
        height: SPACE[16],
        borderRadius: RADIUS.pill,
        border: `1px solid ${active ? COLORS.ink[900] : 'transparent'}`,
        backgroundColor: active ? COLORS.ink[900] : 'transparent',
        color: disabled
          ? COLORS.ink[300]
          : active
          ? COLORS.surface
          : COLORS.ink[700],
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 120ms, color 120ms, border-color 120ms',
      }}
      className="hover:bg-tatva-surface-secondary focus-visible:outline-none focus-visible:ring-2"
    >
      {children}
    </button>
  );
}
