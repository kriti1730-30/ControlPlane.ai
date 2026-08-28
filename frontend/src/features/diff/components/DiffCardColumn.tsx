import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, Pencil } from 'lucide-react';
import AccentOrb from '../../../components/ui/AccentOrb';
import Dropdown from '../../../components/ui/Dropdown';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LETTER_SPACING,
  SPACE,
} from '../../../constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import {
  hueForModel,
  MODELS,
} from '../config';
import type { RenderOp } from '../lib';
import CardEmptyState from './CardEmptyState';
import CardIconButton from './CardIconButton';
import DiffBody from './DiffBody';

type Props = {
  side: 'A' | 'B';
  model: string;
  onModelChange: (v: string) => void;
  rawValue: string;
  onRawChange: (v: string) => void;
  ops: RenderOp[];
  emptyOpType: 'insert' | 'delete';
  isRunning: boolean;
  copied: boolean;
  onCopy: () => void;
};

/**
 * One side of the side-by-side diff. Owns:
 *   - model dropdown header (with model-themed orb)
 *   - copy + edit icon buttons
 *   - either a `DiffBody` (read), a `<textarea>` (edit), or `CardEmptyState`
 *     (no run yet)
 */
export default function DiffCardColumn({
  side,
  model,
  onModelChange,
  rawValue,
  onRawChange,
  ops,
  emptyOpType,
  isRunning,
  copied,
  onCopy,
}: Props) {
  const [editing, setEditing] = useState(false);
  const isLeft = side === 'A';
  const scrollRef = useRef<HTMLDivElement>(null);
  const hue = hueForModel(model);
  const isMobile = useIsMobile();

  // Auto-scroll the diff body while streaming
  useEffect(() => {
    if (!isRunning || editing) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rawValue, isRunning, editing]);

  return (
    <div
      className="w-full md:w-1/2"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        paddingLeft: isMobile ? SPACE[6] : isLeft ? SPACE[12] : SPACE[6],
        paddingRight: isMobile ? SPACE[6] : isLeft ? SPACE[6] : SPACE[12],
        paddingTop: SPACE[6],
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
        {/* Card header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: SPACE[3],
            paddingLeft: SPACE[6],
            paddingRight: SPACE[3],
            paddingTop: SPACE[3],
            paddingBottom: SPACE[3],
            borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
            backgroundColor: COLORS.surface,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              opacity: isRunning ? 0.6 : 1,
              pointerEvents: isRunning ? 'none' : 'auto',
            }}
          >
            <Dropdown
              value={model}
              options={MODELS as unknown as { value: string; description?: string }[]}
              onChange={onModelChange}
              size="sm"
              fullWidth={false}
              menuMinWidth={160}
              leading={<AccentOrb hue={hue} size={14} />}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
            <CardIconButton
              ariaLabel={copied ? 'Copied' : `Copy ${side}`}
              onClick={onCopy}
              disabled={!rawValue}
            >
              {copied ? (
                <Check
                  size={13}
                  strokeWidth={ICON.strokeWidth}
                  aria-hidden
                  style={{ color: COLORS.success }}
                />
              ) : (
                <Copy size={13} strokeWidth={ICON.strokeWidth} aria-hidden />
              )}
            </CardIconButton>
            <CardIconButton
              ariaLabel={editing ? 'View diff' : 'Edit output'}
              onClick={() => setEditing((e) => !e)}
              active={editing}
              disabled={isRunning}
            >
              {editing ? (
                <Eye size={13} strokeWidth={ICON.strokeWidth} aria-hidden />
              ) : (
                <Pencil size={13} strokeWidth={ICON.strokeWidth} aria-hidden />
              )}
            </CardIconButton>
          </div>
        </header>

        {/* Card body — three states: edit / empty / diff */}
        {editing ? (
          <textarea
            value={rawValue}
            onChange={(e) => onRawChange(e.target.value)}
            aria-label={`Model ${side} output`}
            className="scrollbar-hide"
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: SPACE[10],
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.regular,
              lineHeight: 2,
              color: COLORS.ink[900],
              letterSpacing: LETTER_SPACING.normal,
              boxSizing: 'border-box',
            }}
          />
        ) : !rawValue && !isRunning ? (
          <CardEmptyState hue={hue} side={side} />
        ) : (
          <DiffBody
            ops={ops}
            emptyOpType={emptyOpType}
            isStreaming={isRunning}
            scrollRef={scrollRef}
          />
        )}
      </div>
    </div>
  );
}
