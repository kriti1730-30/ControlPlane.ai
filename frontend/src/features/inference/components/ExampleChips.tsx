import { Sparkles } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  ICON,
  RADIUS,
  SPACE,
} from '../../../constants';
import { EXAMPLE_PROMPTS } from '../config';

/**
 * Inline horizontally-scrollable example prompts. Surfaces in zone 3 of the
 * prompt column while the textarea is empty.
 */
export default function ExampleChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div
      className="scrollbar-hide"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[2],
        overflowX: 'auto',
        flex: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.xs,
          color: COLORS.ink[500],
          flexShrink: 0,
        }}
      >
        Try:
      </span>
      {EXAMPLE_PROMPTS.map(({ label, prompt }) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(prompt)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: SPACE[2],
            paddingLeft: SPACE[4],
            paddingRight: SPACE[4],
            paddingTop: SPACE[2],
            paddingBottom: SPACE[2],
            borderRadius: RADIUS.pill,
            border: `1px solid ${COLORS.border.DEFAULT}`,
            backgroundColor: COLORS.surface,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.xs,
            color: COLORS.ink[700],
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'background-color 120ms, border-color 120ms',
          }}
          className="hover:bg-tatva-surface-secondary focus-visible:outline-none focus-visible:ring-2"
        >
          <Sparkles
            size={11}
            strokeWidth={ICON.strokeWidth}
            aria-hidden
            style={{ color: COLORS.ink[500] }}
          />
          {label}
        </button>
      ))}
    </div>
  );
}
