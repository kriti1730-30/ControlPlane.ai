import { COLORS, FONTS, FONT_SIZE, SPACE } from '../../../constants';
import type { RenderOp } from '../lib';
import TokenSpan from './TokenSpan';

type Props = {
  ops: RenderOp[];
  emptyOpType: 'insert' | 'delete';
  isStreaming: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

/**
 * Per-card scrollable diff surface. Renders ops via `TokenSpan` and shows a
 * blinking cursor at the streaming tip.
 */
export default function DiffBody({
  ops,
  emptyOpType,
  isStreaming,
  scrollRef,
}: Props) {
  const hasContent = ops.some(
    (o) => o.type === 'equal' || o.type === 'fold' || o.type !== emptyOpType,
  );

  return (
    <div
      ref={scrollRef}
      role="region"
      aria-label="Diff output"
      aria-live={isStreaming ? 'polite' : undefined}
      className="scrollbar-hide"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: SPACE[10],
        boxSizing: 'border-box',
      }}
    >
      {hasContent ? (
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            lineHeight: 2,
            color: COLORS.ink[900],
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {ops.map((op, i) => (
            <TokenSpan key={i} op={op} />
          ))}
          {isStreaming && (
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 7,
                height: '1em',
                marginLeft: 2,
                verticalAlign: '-2px',
                backgroundColor: COLORS.ink[900],
                animation: 'blink 1s step-start infinite',
              }}
            />
          )}
        </p>
      ) : (
        <p
          style={{
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.sm,
            color: COLORS.ink[500],
            fontStyle: 'italic',
          }}
        >
          {isStreaming ? 'Streaming…' : 'No content'}
        </p>
      )}
    </div>
  );
}
