import BrandSphere from '../../../components/ui/BrandSphere';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LETTER_SPACING,
  LINE_HEIGHT,
  SPACE,
} from '../../../constants';
import type { ModelHue } from '../config';

type Props = {
  hue: ModelHue;
  side: 'A' | 'B';
};

/** Centered empty-state shown inside an output card before its first run. */
export default function CardEmptyState({ hue, side }: Props) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE[6],
        padding: SPACE[12],
        textAlign: 'center',
      }}
    >
      <BrandSphere hue={hue} size={96} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2], maxWidth: 280 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE.lg,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            letterSpacing: LETTER_SPACING.tight,
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          Ready when you are
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.sm,
            color: COLORS.ink[600],
            lineHeight: LINE_HEIGHT.relaxed,
          }}
        >
          Output {side} will stream here once you Run.
        </p>
      </div>
    </div>
  );
}
