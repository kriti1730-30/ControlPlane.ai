import { useEffect, useState } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../../../constants';

type Props = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  leftLabel?: string;
  rightLabel?: string;
  format?: (v: number) => string;
};

/**
 * Slider with an editable text input on the right. Wraps a native
 * `<input type="range">` for accessibility; the filled portion of the track
 * comes from a CSS variable (`--filled-pct`) set inline based on `value`.
 */
export default function SettingsSlider({
  value,
  min,
  max,
  step = 1,
  onChange,
  ariaLabel,
  leftLabel,
  rightLabel,
  format,
}: Props) {
  const display = format ? format(value) : String(value);
  const [draft, setDraft] = useState(display);

  // Sync the editable draft back to the formatted value whenever the slider
  // moves the source value (e.g. user drags the range while the input is blurred).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external value→local draft
    setDraft(display);
  }, [display]);

  const filledPct = ((value - min) / Math.max(1e-9, max - min)) * 100;

  function commit() {
    const cleaned = draft.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) {
      setDraft(display);
      return;
    }
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
    setDraft(format ? format(clamped) : String(clamped));
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[6] }}>
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={ariaLabel}
          className="settings-slider"
          style={
            {
              flex: 1,
              minWidth: 0,
              '--filled-pct': `${filledPct}%`,
            } as React.CSSProperties
          }
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              setDraft(display);
              (e.target as HTMLInputElement).blur();
            }
          }}
          aria-label={`${ariaLabel} value`}
          size={5}
          style={{
            height: SPACE[12],
            minWidth: SPACE[20],
            paddingLeft: SPACE[3],
            paddingRight: SPACE[3],
            borderRadius: RADIUS.md,
            border: `1px solid ${COLORS.border.strong}`,
            backgroundColor: COLORS.surface,
            textAlign: 'center',
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            color: COLORS.ink[900],
            outline: 'none',
            lineHeight: LINE_HEIGHT.tight,
          }}
        />
      </div>

      {(leftLabel || rightLabel) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: SPACE[2],
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.xs,
            color: COLORS.ink[500],
            lineHeight: 1.5,
          }}
        >
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
