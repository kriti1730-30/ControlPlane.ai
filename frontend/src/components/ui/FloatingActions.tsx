import type { ReactNode } from 'react';
import { COLORS, RADIUS, SPACE } from '../../constants';

type Props = {
  children: ReactNode;
  visible?: boolean; // if undefined, always visible
};

// dashboard.sarvam.ai:
//   absolute top-tatva-5 right-tatva-5 z-10
//   opacity-0 group-hover:opacity-100
//   bg-tatva-background-secondary/90 backdrop-blur-sm
//   rounded-tatva-md p-tatva-2 gap-tatva-2
//
// Place inside a `position: relative` parent. Each child should be a small
// circular IconButton (rendered separately) — this just hosts them.
export default function FloatingActions({ children, visible }: Props) {
  const opacity = visible === undefined ? undefined : visible ? 1 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: SPACE[5],
        right: SPACE[5],
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[2],
        padding: SPACE[2],
        borderRadius: RADIUS.md,
        backgroundColor: `${COLORS.cream[200]}e6`, // /90 alpha
        backdropFilter: 'blur(6px)',
        opacity,
        transition: 'opacity 200ms',
      }}
      className={visible === undefined ? 'opacity-0 group-hover:opacity-100' : undefined}
    >
      {children}
    </div>
  );
}

// Round 28px icon button styled per Sarvam: `min-h-tatva-14 bg-background-tertiary`.
export function FloatingIconButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: SPACE[14],
        height: SPACE[14],
        minWidth: SPACE[14],
        minHeight: SPACE[14],
        borderRadius: RADIUS.pill,
        border: 'none',
        backgroundColor: COLORS.cream[300],
        color: COLORS.ink[900],
        cursor: 'pointer',
        transition: 'background-color 120ms, transform 120ms',
      }}
      className="hover:bg-tatva-bg-tertiary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2"
    >
      {children}
    </button>
  );
}
