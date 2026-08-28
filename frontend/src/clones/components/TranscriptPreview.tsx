import { Play } from 'lucide-react';
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

type Props = {
  label: string;
  excerpt: string;
};

export default function TranscriptPreview({ label, excerpt }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: SPACE[4],
        padding: `${SPACE[2]}px ${SPACE[4]}px ${SPACE[2]}px ${SPACE[2]}px`,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.surface,
      }}
    >
      <button
        type="button"
        aria-label={`Play ${label}`}
        className="shrink-0 focus-visible:outline-none focus-visible:ring-2"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: COLORS.gradient.red,
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        <Play
          size={ICON.play}
          strokeWidth={ICON.strokeWidth}
          fill="currentColor"
          aria-hidden
        />
      </button>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: FONT_SIZE.sm,
            fontWeight: FONT_WEIGHT.medium,
            color: COLORS.ink[900],
            lineHeight: LINE_HEIGHT.snug,
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: FONT_SIZE.sm,
            color: COLORS.ink[600],
            lineHeight: LINE_HEIGHT.relaxed,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {excerpt}
        </p>
      </div>
    </div>
  );
}
