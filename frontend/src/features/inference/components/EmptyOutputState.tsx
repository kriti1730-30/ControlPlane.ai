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
  /** Maps to one of the Sarvam avatar gradients (see AccentOrb). */
  hue: ModelHue;
};

/**
 * Hero empty-state for the output column. The brand sphere keeps the
 * "this model is alive and waiting" feel before the first generation.
 */
export default function EmptyOutputState({ hue }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE[8],
        backgroundColor: COLORS.surfaceMuted,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: 24,
        padding: SPACE[12],
        minHeight: 0,
        textAlign: 'center',
      }}
    >
      <BrandSphere hue={hue} size={120} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[3],
          maxWidth: 360,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE.xl,
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
          Type a prompt on the left and press the send button to stream the
          response token-by-token.
        </p>
      </div>
    </div>
  );
}
