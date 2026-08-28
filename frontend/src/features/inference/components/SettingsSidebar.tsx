import type { ReactNode } from 'react';
import { X, Info } from 'lucide-react';
import AccentOrb from '../../../components/ui/AccentOrb';
import Dropdown from '../../../components/ui/Dropdown';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LETTER_SPACING,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../../../constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import {
  CONTEXT_WINDOWS,
  hueForModel,
  MAX_MAX_TOKENS,
  MIN_MAX_TOKENS,
  MODELS,
  REASONING_EFFORTS,
  TEMPERATURE_MAX,
  TEMPERATURE_MIN,
} from '../config';
import SettingsSlider from './SettingsSlider';

type Props = {
  isOpen: boolean;
  model: string;
  onModelChange: (v: string) => void;
  contextWindow: string;
  onContextWindowChange: (v: string) => void;
  systemInstructions: string;
  onSystemInstructionsChange: (v: string) => void;
  temperature: number;
  onTemperatureChange: (v: number) => void;
  maxTokens: number;
  onMaxTokensChange: (v: number) => void;
  reasoningEffort: string;
  onReasoningEffortChange: (v: string) => void;
  onClose: () => void;
};

/**
 * Chat Settings sidebar — pixel-port of dashboard.sarvam.ai's settings drawer.
 * Field order: Model · Context window · System instructions · Temperature ·
 * Max tokens · Reasoning effort.
 */
export default function SettingsSidebar({
  isOpen,
  model,
  onModelChange,
  contextWindow,
  onContextWindowChange,
  systemInstructions,
  onSystemInstructionsChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  reasoningEffort,
  onReasoningEffortChange,
  onClose,
}: Props) {
  const isMobile = useIsMobile();

  const desktopStyle: React.CSSProperties = {
    width: isOpen ? 340 : 0,
    minWidth: isOpen ? 340 : 0,
    flexShrink: 0,
    borderLeft: `1px solid ${isOpen ? COLORS.border.DEFAULT : 'transparent'}`,
    backgroundColor: COLORS.surface,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 200ms ease, min-width 200ms ease, border-color 200ms ease',
  };

  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    right: 0,
    width: '88vw',
    maxWidth: 360,
    zIndex: 60,
    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
    borderLeft: `1px solid ${COLORS.border.DEFAULT}`,
    boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.25)' : 'none',
    backgroundColor: COLORS.surface,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'transform 220ms ease, box-shadow 220ms ease',
  };

  return (
    <>
      {isMobile && isOpen && (
        <button
          type="button"
          aria-label="Close settings"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 55,
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            animation: 'fadeIn 160ms ease-out',
          }}
        />
      )}
    <aside
      aria-label="Chat settings"
      aria-hidden={!isOpen}
      style={isMobile ? mobileStyle : desktopStyle}
    >
      {/* Header — px-8 pt-8 pb-6 in tatva units */}
      <div
        style={{
          paddingLeft: SPACE[8],
          paddingRight: SPACE[8],
          paddingTop: SPACE[8],
          paddingBottom: SPACE[6],
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: SPACE[2],
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
            Chat Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: SPACE[18],
              height: SPACE[18],
              padding: 0,
              borderRadius: RADIUS.pill,
              border: 'none',
              background: 'transparent',
              color: COLORS.ink[900],
              cursor: 'pointer',
              transition: 'background-color 120ms',
            }}
            className="hover:bg-tatva-surface-secondary focus-visible:outline-none focus-visible:ring-2 active:scale-95"
          >
            <X size={ICON.feature} strokeWidth={ICON.strokeWidth} aria-hidden />
          </button>
        </div>
      </div>

      {/* Scrollable body — p-8 with 20 gap between fields */}
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: SPACE[8],
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[10],
        }}
      >
        <Field label="Model">
          <Dropdown
            value={model}
            options={MODELS as unknown as { value: string; description?: string }[]}
            onChange={onModelChange}
            size="sm"
            leading={<AccentOrb hue={hueForModel(model)} size={14} />}
            menuMinWidth={280}
          />
        </Field>

        <Field label="Context window">
          <Dropdown
            value={contextWindow}
            options={CONTEXT_WINDOWS as unknown as string[]}
            onChange={onContextWindowChange}
            size="sm"
            menuMinWidth={140}
          />
        </Field>

        <Field label="System instructions">
          <textarea
            value={systemInstructions}
            onChange={(e) => onSystemInstructionsChange(e.target.value)}
            placeholder="You are a helpful assistant..."
            rows={3}
            aria-label="System instructions"
            className="scrollbar-hide"
            style={{
              width: '100%',
              minHeight: SPACE[40],
              resize: 'vertical',
              paddingLeft: SPACE[6],
              paddingRight: SPACE[6],
              paddingTop: SPACE[4],
              paddingBottom: SPACE[4],
              borderRadius: RADIUS.sm,
              border: `1px solid ${COLORS.border.strong}`,
              backgroundColor: 'transparent',
              outline: 'none',
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              color: COLORS.ink[900],
              lineHeight: LINE_HEIGHT.relaxed,
              boxSizing: 'border-box',
            }}
          />
        </Field>

        <Field label="Temperature">
          <SettingsSlider
            value={temperature}
            min={TEMPERATURE_MIN}
            max={TEMPERATURE_MAX}
            step={0.05}
            onChange={onTemperatureChange}
            ariaLabel="Temperature"
            leftLabel="Precise"
            rightLabel="Creative"
            format={(v) => trimZeros(v.toFixed(2))}
          />
        </Field>

        <Field label="Max tokens">
          <SettingsSlider
            value={maxTokens}
            min={MIN_MAX_TOKENS}
            max={MAX_MAX_TOKENS}
            step={1}
            onChange={onMaxTokensChange}
            ariaLabel="Max tokens"
            leftLabel={String(MIN_MAX_TOKENS)}
            rightLabel={MAX_MAX_TOKENS.toLocaleString()}
            format={(v) => v.toLocaleString()}
          />
        </Field>

        <Field label="Reasoning effort">
          <Dropdown
            value={reasoningEffort}
            options={REASONING_EFFORTS as unknown as string[]}
            onChange={onReasoningEffortChange}
            size="sm"
            menuMinWidth={140}
          />
        </Field>
      </div>
    </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[2] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[1] }}>
        <label
          style={{
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            lineHeight: LINE_HEIGHT.tight,
          }}
        >
          {label}
        </label>
        <Info
          size={14}
          strokeWidth={ICON.strokeWidth}
          aria-hidden
          style={{ color: COLORS.ink[400], cursor: 'help' }}
        />
      </div>
      {children}
    </div>
  );
}

// 0.80 → "0.8", 0.50 → "0.5", 0.00 → "0", 1.00 → "1"
function trimZeros(s: string): string {
  if (!s.includes('.')) return s;
  return s.replace(/\.?0+$/, '');
}
