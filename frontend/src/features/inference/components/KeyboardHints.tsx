import { COLORS, FONTS, FONT_SIZE, SPACE } from '../../../constants';
import Kbd from './Kbd';

/**
 * Hint row showing ⌘↵ to run and (when streaming) Esc to stop. Sits in zone 3
 * of the prompt column once the user starts typing.
 */
export default function KeyboardHints({ isStreaming }: { isStreaming: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
        <Kbd>⌘</Kbd>
        <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.ink[500] }}>+</span>
        <Kbd>↵</Kbd>
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.xs,
            color: COLORS.ink[500],
          }}
        >
          to run
        </span>
      </div>
      {isStreaming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
          <Kbd>Esc</Kbd>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.xs,
              color: COLORS.ink[500],
            }}
          >
            to stop
          </span>
        </div>
      )}
    </div>
  );
}
