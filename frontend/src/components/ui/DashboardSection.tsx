import type { ReactNode } from 'react';
import Button from './Button';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  LINE_HEIGHT,
  SPACE,
} from '../../constants';
import { useIsMobile } from '../../hooks/useIsMobile';

type Props = {
  title: string;
  tagline: string;
  ctaLabel: string;
  onCta?: () => void;
  children: ReactNode;
};

// dashboard.sarvam.ai:
//   <div class="flex flex-col md:flex-row gap-tatva-12 md:gap-tatva-24 items-start">
//     <div class="flex flex-col gap-tatva-4 md:w-[45%]">          ← left column
//       <h2>...</h2>
//       <p>...</p>
//       <div class="mt-tatva-8"><button>...</button></div>
//     <div class="flex flex-col gap-tatva-8 md:w-[55%] w-full">    ← right column
export default function DashboardSection({
  title,
  tagline,
  ctaLabel,
  onCta,
  children,
}: Props) {
  const isMobile = useIsMobile();
  return (
    <section
      className="flex-col md:flex-row md:items-start"
      style={{
        display: 'flex',
        gap: isMobile ? SPACE[8] : SPACE[24],
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[4], // 8px — gap-tatva-4 between h2 / p / button-container
          width: isMobile ? '100%' : '45%',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE['2xl'],          // heading-lg = 24px
            fontWeight: FONT_WEIGHT.medium,      // 500
            color: COLORS.ink[900],              // content-primary
            letterSpacing: LETTER_SPACING.tight,
            lineHeight: LINE_HEIGHT.tight,       // 120%
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,              // body-md = 15px
            fontWeight: FONT_WEIGHT.regular,     // 400
            color: COLORS.ink[600],              // content-secondary
            lineHeight: LINE_HEIGHT.relaxed,     // 145%
          }}
        >
          {tagline}
        </p>
        <div style={{ marginTop: SPACE[8] }}> {/* mt-tatva-8 = 16px */}
          <Button variant="outlined" size="md" onClick={onCta}>
            {ctaLabel} →
          </Button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[8], // 16px — gap-tatva-8 between voice cards
          width: isMobile ? '100%' : '55%',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}
