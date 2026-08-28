import { useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LETTER_SPACING,
  SPACE,
} from '../../../constants';
import RoundActionButton from './RoundActionButton';

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  canRun: boolean;
  isStreaming: boolean;
  onRun: () => void;
  onStop: () => void;
};

/**
 * Text-mode prompt input with an embedded Send / Stop button at the bottom-
 * right (Sarvam Chat Completions pattern). Cmd/Ctrl + Enter runs from the
 * textarea.
 */
export default function TextPromptCard({
  value,
  onChange,
  disabled,
  canRun,
  isStreaming,
  onRun,
  onStop,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canRun) onRun();
    }
  }

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.surfaceMuted,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: 0,
      }}
      onClick={() => ref.current?.focus()}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="What's on your mind?"
        disabled={disabled}
        aria-label="Prompt"
        autoFocus
        className="scrollbar-hide"
        style={{
          flex: 1,
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[10],
          paddingTop: SPACE[10],
          paddingBottom: SPACE[24],
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.regular,
          lineHeight: 2,
          color: COLORS.ink[900],
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      />

      {/* Char count strip with gradient fade */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: SPACE[24],
          display: 'flex',
          alignItems: 'center',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[20],
          background: `linear-gradient(to bottom, transparent, ${COLORS.surfaceMuted} 60%)`,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: FONT_SIZE.xs,
            color: COLORS.ink[500],
            letterSpacing: LETTER_SPACING.wide,
            pointerEvents: 'auto',
          }}
        >
          {value.length} chars
        </span>
      </div>

      {/* Submit / Stop — explicit corner offset for clean visual margin */}
      <div
        style={{
          position: 'absolute',
          bottom: SPACE[4],
          right: SPACE[4],
          pointerEvents: 'auto',
        }}
      >
        {isStreaming ? (
          <RoundActionButton onClick={onStop} ariaLabel="Stop (Esc)" title="Stop (Esc)">
            <Square
              size={16}
              strokeWidth={ICON.strokeWidth}
              aria-hidden
              fill={COLORS.surface}
            />
          </RoundActionButton>
        ) : (
          <RoundActionButton
            onClick={onRun}
            disabled={!canRun}
            ariaLabel="Generate (⌘↵)"
            title="Generate (⌘↵)"
          >
            <ArrowUp size={18} strokeWidth={2.5} aria-hidden />
          </RoundActionButton>
        )}
      </div>
    </div>
  );
}
