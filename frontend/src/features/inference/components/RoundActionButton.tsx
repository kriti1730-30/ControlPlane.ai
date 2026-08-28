import type { ReactNode } from 'react';
import { COLORS } from '../../../constants';

type Props = {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  title?: string;
};

/**
 * 40px round black pill — the primary submit / stop affordance embedded inside
 * the prompt textarea, à la Sarvam's Chat Completions input.
 */
export default function RoundActionButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  title,
}: Props) {
  const bg = disabled ? COLORS.ink[300] : COLORS.ink[900];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: bg,
        color: COLORS.surface,
        boxShadow: disabled ? 'none' : '0 2px 8px rgba(0,0,0,0.18)',
        transition: 'background-color 120ms, transform 120ms, box-shadow 120ms',
      }}
      className="hover:opacity-95 active:scale-95 focus-visible:outline-none focus-visible:ring-2"
    >
      {children}
    </button>
  );
}
