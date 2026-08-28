import { Code2, Settings as SettingsIcon } from 'lucide-react';
import Button from '../../../components/ui/Button';
import MenuButton from '../../../components/layout/MenuButton';
import Switch from '../../../components/ui/Switch';
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

type Props = {
  errorDemo: boolean;
  onErrorDemoChange: (v: boolean) => void;
  settingsOpen: boolean;
  onSettingsToggle: () => void;
};

/**
 * Sticky page header — title + Error demo toggle + settings gear + Get Code.
 * The gear toggles the right-hand Chat Settings sidebar.
 * On mobile: shows a menu button on the left, hides the subtitle and "Get Code"
 * button so the essential controls (error demo + settings) fit on a phone.
 */
export default function InferenceHeader({
  errorDemo,
  onErrorDemoChange,
  settingsOpen,
  onSettingsToggle,
}: Props) {
  const isMobile = useIsMobile();
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? SPACE[3] : SPACE[6],
        paddingTop: SPACE[8],
        paddingBottom: SPACE[8],
        paddingLeft: isMobile ? SPACE[6] : SPACE[12],
        paddingRight: isMobile ? SPACE[6] : SPACE[12],
        borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
        backgroundColor: COLORS.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <MenuButton />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: FONT_SIZE.xl,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            letterSpacing: LETTER_SPACING.tight,
            lineHeight: LINE_HEIGHT.tight,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isMobile ? 'Inference' : 'Inference Playground'}
        </h2>
        {!isMobile && (
          <p
            style={{
              margin: 0,
              marginTop: SPACE[2],
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              color: COLORS.ink[600],
              lineHeight: LINE_HEIGHT.relaxed,
            }}
          >
            Token-by-token streaming with live metrics
          </p>
        )}
      </div>

      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.sm,
              color: COLORS.ink[600],
              lineHeight: LINE_HEIGHT.tight,
            }}
          >
            Error demo
          </span>
          <Switch
            checked={errorDemo}
            onChange={onErrorDemoChange}
            ariaLabel="Simulate a mid-stream error"
          />
        </div>
      )}

      {isMobile && (
        <Switch
          checked={errorDemo}
          onChange={onErrorDemoChange}
          ariaLabel="Simulate a mid-stream error"
        />
      )}

      <button
        type="button"
        onClick={onSettingsToggle}
        aria-label={settingsOpen ? 'Close settings' : 'Open settings'}
        aria-pressed={settingsOpen}
        title="Chat settings"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: SPACE[18],
          height: SPACE[18],
          borderRadius: RADIUS.pill,
          border: `1px solid ${settingsOpen ? COLORS.border.strong : 'transparent'}`,
          backgroundColor: settingsOpen ? COLORS.cream[300] : 'transparent',
          color: COLORS.ink[700],
          cursor: 'pointer',
          transition: 'background-color 120ms, border-color 120ms',
        }}
        className="hover:bg-tatva-surface-secondary focus-visible:outline-none focus-visible:ring-2"
      >
        <SettingsIcon
          size={ICON.feature}
          strokeWidth={ICON.strokeWidth}
          aria-hidden
        />
      </button>

      {!isMobile && (
        <Button
          variant="outlined"
          size="sm"
          leftIcon={
            <Code2
              size={ICON.button}
              strokeWidth={ICON.strokeWidth}
              aria-hidden
            />
          }
        >
          Get Code
        </Button>
      )}
    </header>
  );
}
