import {
  Check,
  Copy,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import AccentOrb from '../../../components/ui/AccentOrb';
import Button from '../../../components/ui/Button';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  ICON,
  SPACE,
} from '../../../constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { hueForModel } from '../config';
import EmptyOutputState from './EmptyOutputState';
import IconActionButton from './IconActionButton';
import MetricsText from './MetricsText';
import OutputCard from './OutputCard';
import StatusPill from './StatusPill';

type Props = {
  status: string;
  output: string;
  errorMessage: string | null;
  tokenCount: number;
  tokensPerSecond: number;
  elapsed: number;
  isStreaming: boolean;
  hasOutput: boolean;
  copied: boolean;
  onCopy: () => void;
  onRegenerate: () => void;
  onReset: () => void;
  model: string;
};

/**
 * Right column of the playground. Mirrors the prompt column's three-zone
 * rhythm: status/metrics on top, output surface in the middle, and a footer
 * with model + elapsed + per-result actions.
 */
export default function OutputColumn({
  status,
  output,
  errorMessage,
  tokenCount,
  tokensPerSecond,
  elapsed,
  isStreaming,
  hasOutput,
  copied,
  onCopy,
  onRegenerate,
  onReset,
  model,
}: Props) {
  const hasInteracted = isStreaming || status === 'done' || status === 'error';
  const isMobile = useIsMobile();

  return (
    <div
      className="w-full md:w-1/2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingLeft: isMobile ? SPACE[6] : SPACE[6],
        paddingRight: isMobile ? SPACE[6] : SPACE[12],
        paddingTop: isMobile ? SPACE[6] : SPACE[12],
        paddingBottom: isMobile ? SPACE[6] : SPACE[12],
        gap: SPACE[4],
        // Mobile only: fill the remaining vertical space above the input bar.
        // On desktop, default flex behavior (with md:w-1/2 basis) keeps the
        // two columns balanced as the settings drawer opens / closes.
        ...(isMobile ? { flex: 1, minHeight: 0 } : null),
      }}
    >
      {/* Zone 1 — status (streaming/error only) + metrics */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: SPACE[3],
          minHeight: SPACE[18],
        }}
      >
        {hasInteracted ? (
          <>
            {(status === 'streaming' || status === 'error') && (
              <StatusPill status={status} />
            )}
            <div style={{ marginLeft: 'auto' }}>
              <MetricsText
                tokenCount={tokenCount}
                tokensPerSecond={tokensPerSecond}
                isStreaming={isStreaming}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Zone 2 — output surface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!hasInteracted && !hasOutput ? (
          <EmptyOutputState hue={hueForModel(model)} />
        ) : (
          <OutputCard
            output={output}
            isStreaming={isStreaming}
            hasOutput={hasOutput}
            errorMessage={status === 'error' ? errorMessage : null}
            onRetry={onRegenerate}
          />
        )}
      </div>

      {/* Zone 3 — model badge + elapsed + per-result actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: SPACE[4],
          minHeight: SPACE[18],
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
          }}
        >
          {hasInteracted && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
                <AccentOrb hue={hueForModel(model)} size={12} />
                <span
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: FONT_SIZE.xs,
                    color: COLORS.ink[600],
                  }}
                >
                  {model}
                </span>
              </div>
              <span
                style={{
                  width: 1,
                  height: 12,
                  backgroundColor: COLORS.border.strong,
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: FONT_SIZE.xs,
                  color: COLORS.ink[500],
                }}
              >
                {elapsed.toFixed(1)}s
              </span>
            </>
          )}
        </div>

        {hasOutput && !isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
            <IconActionButton ariaLabel="Helpful">
              <ThumbsUp size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
            </IconActionButton>
            <IconActionButton ariaLabel="Not helpful">
              <ThumbsDown size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
            </IconActionButton>
            <IconActionButton ariaLabel="Regenerate" onClick={onRegenerate}>
              <RotateCcw size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
            </IconActionButton>
            <IconActionButton
              ariaLabel={copied ? 'Copied' : 'Copy output'}
              onClick={onCopy}
            >
              {copied ? (
                <Check
                  size={14}
                  strokeWidth={ICON.strokeWidth}
                  aria-hidden
                  style={{ color: COLORS.success }}
                />
              ) : (
                <Copy size={14} strokeWidth={ICON.strokeWidth} aria-hidden />
              )}
            </IconActionButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              leftIcon={
                <Trash2
                  size={ICON.button}
                  strokeWidth={ICON.strokeWidth}
                  aria-hidden
                />
              }
            >
              Clear
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
