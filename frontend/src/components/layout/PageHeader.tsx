import type { ReactNode } from 'react';

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
import MenuButton from './MenuButton';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

/**
 * Shared ControlPlane page header.
 *
 * Visual intent:
 * - Preserve the compact, restrained Sarvam-style header.
 * - Keep mobile navigation in the shared MenuButton.
 * - Keep page-specific actions supplied by the page itself.
 * - No workspace/business logic belongs here.
 */
export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACE[4],

        /*
         * Keep the same generous horizontal rhythm as the reference
         * implementation, with tighter mobile padding.
         */
        paddingTop: SPACE[8],
        paddingBottom: SPACE[8],
        paddingLeft: isMobile ? SPACE[6] : SPACE[12],
        paddingRight: isMobile ? SPACE[6] : SPACE[12],

        borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
        backgroundColor: COLORS.surface,

        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,

        minHeight: 70,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[3],
          minWidth: 0,
        }}
      >
        <MenuButton />

        <div
          style={{
            minWidth: 0,
          }}
        >
          <h1
            style={{
              margin: 0,

              fontFamily: FONTS.display,
              fontSize: FONT_SIZE.xl,
              fontWeight: FONT_WEIGHT.medium,

              color: COLORS.ink[900],
              letterSpacing: LETTER_SPACING.tight,
              lineHeight: LINE_HEIGHT.tight,

              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                margin: 0,
                marginTop: SPACE[2],

                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.regular,

                color: COLORS.ink[500],
                lineHeight: LINE_HEIGHT.relaxed,

                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
          }}
        >
          {action}
        </div>
      )}
    </header>
  );
}