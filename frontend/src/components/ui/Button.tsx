import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACE } from '../../constants';

type Variant = 'primary' | 'outlined' | 'ghost';
type Size = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
};

export default function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  children,
  style,
  ...rest
}: Props) {
  // dashboard.sarvam.ai buttons:
  //   md  → min-h-tatva-22 (44px) px-tatva-8 (16px) text-tatva-body-md (15px)
  //   sm  → min-h-tatva-18 (36px) px-tatva-6 (12px) text-tatva-body-sm (14px)
  const sizing =
    size === 'sm'
      ? {
          minHeight: SPACE[18],
          paddingLeft: SPACE[6],
          paddingRight: SPACE[6],
          fontSize: FONT_SIZE.sm,
        }
      : {
          minHeight: SPACE[22], // 44px — min-h-tatva-22
          paddingLeft: SPACE[8],
          paddingRight: SPACE[8],
          fontSize: FONT_SIZE.md,
        };

  const variantStyle =
    variant === 'primary'
      ? {
          backgroundColor: COLORS.ink[900],
          color: COLORS.surface,
          border: `1px solid ${COLORS.ink[900]}`,
        }
      : variant === 'outlined'
        ? {
            backgroundColor: COLORS.surface,
            color: COLORS.ink[900],
            border: `1px solid ${COLORS.border.strong}`,
          }
        : {
            backgroundColor: 'transparent',
            color: COLORS.ink[600],
            border: '1px solid transparent',
          };

  return (
    <button
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE[2],
        borderRadius: RADIUS.pill,
        fontWeight: FONT_WEIGHT.regular, // 400 — per Sarvam DOM ("Sign in", "Generate Speech")
        lineHeight: 1.5,
        cursor: 'pointer',
        transition: 'opacity 120ms, background-color 120ms',
        whiteSpace: 'nowrap',
        ...sizing,
        ...variantStyle,
        ...style,
      }}
      className="focus-visible:outline-none focus-visible:ring-2 hover:opacity-90"
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
