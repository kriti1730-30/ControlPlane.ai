import { AlertTriangle } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  SPACE,
} from '../../../constants';

type Props = {
  message: string;
  onRetry?: () => void;
};

/**
 * Minimal inline error notice — sits as a small trailer at the end of the
 * partial output. Just an icon + short message + retry link. No pill / card
 * chrome around it, so it doesn't dominate the actual generation above.
 */
export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.sm,
        lineHeight: 1.4,
      }}
    >
      <AlertTriangle
        size={13}
        strokeWidth={ICON.strokeWidth}
        aria-hidden
        style={{ color: COLORS.danger, flexShrink: 0 }}
      />
      <span style={{ color: COLORS.danger, fontWeight: FONT_WEIGHT.medium }}>
        {message}
      </span>
      {onRetry && (
        <>
          <span style={{ color: COLORS.ink[300] }}>·</span>
          <button
            type="button"
            onClick={onRetry}
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.sm,
              color: COLORS.ink[900],
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              cursor: 'pointer',
            }}
            className="hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
