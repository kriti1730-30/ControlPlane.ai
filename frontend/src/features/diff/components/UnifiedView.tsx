import { useEffect, useRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import AccentOrb from '../../../components/ui/AccentOrb';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  ICON,
  SPACE,
} from '../../../constants';
import { hueForModel } from '../config';
import type { RenderOp } from '../lib';
import TokenSpan from './TokenSpan';

type Props = {
  renderOps: RenderOp[];
  modelA: string;
  modelB: string;
  isRunning: boolean;
};

/**
 * Single-column interleaved diff view. Useful for spotting transitions
 * (A → B substitutions) that the split view shows on separate sides.
 */
export default function UnifiedView({
  renderOps,
  modelA,
  modelB,
  isRunning,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRunning) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [renderOps, isRunning]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        minHeight: 0,
        paddingLeft: SPACE[12],
        paddingRight: SPACE[12],
        paddingTop: SPACE[6],
        paddingBottom: SPACE[8],
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 360,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.surfaceMuted,
          border: `1px solid ${COLORS.border.DEFAULT}`,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        {/* Two-side label strip */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[6],
            paddingLeft: SPACE[6],
            paddingRight: SPACE[6],
            paddingTop: SPACE[3],
            paddingBottom: SPACE[3],
            borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
            backgroundColor: COLORS.surface,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <AccentOrb hue={hueForModel(modelA)} size={16} />
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                color: COLORS.ink[700],
              }}
            >
              A · {modelA}
            </span>
          </div>
          <ArrowLeftRight
            size={14}
            strokeWidth={ICON.strokeWidth}
            aria-hidden
            style={{ color: COLORS.ink[400] }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
            <AccentOrb hue={hueForModel(modelB)} size={16} />
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                color: COLORS.ink[700],
              }}
            >
              B · {modelB}
            </span>
          </div>
        </header>

        <div
          ref={scrollRef}
          role="region"
          aria-label="Unified diff"
          aria-live={isRunning ? 'polite' : undefined}
          className="scrollbar-hide"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: SPACE[10],
          }}
        >
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
            {renderOps.map((op, i) => (
              <TokenSpan key={i} op={op} />
            ))}
            {isRunning && (
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
        </div>
      </div>
    </div>
  );
}
