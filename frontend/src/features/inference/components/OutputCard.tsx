import { useEffect, useRef } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  SPACE,
} from '../../../constants';
import ErrorBanner from './ErrorBanner';

type Props = {
  output: string;
  isStreaming: boolean;
  hasOutput: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

/**
 * Streaming output surface. Renders the text as a single `<p>` so the inline
 * blinking caret can sit at the exact end of the streaming tip. Auto-scrolls
 * the inner container as tokens arrive.
 */
export default function OutputCard({
  output,
  isStreaming,
  hasOutput,
  errorMessage,
  onRetry,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new tokens and whenever the error banner appears, so the
  // user always sees the latest tip of the stream / the error inline.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [output, errorMessage]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.surfaceMuted,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <div
        ref={scrollRef}
        className="scrollbar-hide"
        role="region"
        aria-label="Model output"
        aria-live="polite"
        aria-atomic="false"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: SPACE[10],
        }}
      >
        {hasOutput ? (
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.regular,
              lineHeight: 2,
              color: COLORS.ink[900],
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {output}
            {isStreaming && (
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 8,
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
              fontSize: FONT_SIZE.md,
              color: COLORS.ink[500],
              fontStyle: 'italic',
            }}
          >
            Waiting for first token…
          </p>
        )}

        {/* Inline error — sits as a trailer at the end of the partial output
            so the failure is visually attached to the generation it belongs
            to, not a separate alert below the card. */}
        {errorMessage && (
          <div style={{ marginTop: SPACE[6] }}>
            <ErrorBanner message={errorMessage} onRetry={onRetry} />
          </div>
        )}
      </div>
    </div>
  );
}
