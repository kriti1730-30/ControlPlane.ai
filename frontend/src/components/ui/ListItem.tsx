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

type GradientKey =
  | 'indigo'
  | 'peach'
  | 'rose'
  | 'mint'
  | 'sand'
  | 'sky';

type Props = {
  gradient: GradientKey;
  title: string;
  description?: string;
};

// Use Sarvam's hosted gradient avatar SVGs so the orbs match the real
// dashboard.sarvam.ai voice list 1:1.
const AVATARS: Record<GradientKey, string> = {
  indigo: 'https://dashboard.sarvam.ai/assets/voices/avatar-1.svg',
  peach:  'https://dashboard.sarvam.ai/assets/voices/avatar-2.svg',
  rose:   'https://dashboard.sarvam.ai/assets/voices/avatar-3.svg',
  mint:   'https://dashboard.sarvam.ai/assets/voices/avatar-5.svg',
  sand:   'https://dashboard.sarvam.ai/assets/voices/avatar-6.svg',
  sky:    'https://dashboard.sarvam.ai/assets/voices/avatar-8.svg',
};

export default function ListItem({ gradient, title, description }: Props) {
  return (
    <div
      style={{
        // dashboard.sarvam.ai: `flex items-center gap-tatva-8 p-tatva-8 border rounded-full`
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[8],                                  // 16px — gap-tatva-8
        padding: SPACE[8],                              // 16px all sides — p-tatva-8
        border: `1px solid ${COLORS.border.strong}`,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.surface,
      }}
    >
      <span
        aria-hidden
        style={{
          // w-tatva-28 = 56px (NOT 44 — Sarvam uses a chunky 56px orb)
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: SPACE[28],
          height: SPACE[28],
          minWidth: SPACE[28],
          borderRadius: '50%',
          backgroundImage: `url(${AVATARS[gradient]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <Play
          size={ICON.play}
          strokeWidth={ICON.strokeWidth}
          fill="currentColor"
          aria-hidden
        />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: FONT_SIZE.md,              // 15px per Sarvam
            fontWeight: FONT_WEIGHT.regular,     // 400 — per Sarvam DOM (NOT medium)
            color: COLORS.ink[900],              // rgb(20,20,20)
            lineHeight: LINE_HEIGHT.relaxed,     // 22px / 15px
          }}
        >
          {title}
        </p>
        {description && (
          <p
            style={{
              margin: 0,
              marginTop: 2,
              fontSize: FONT_SIZE.sm,
              color: COLORS.ink[500],
              lineHeight: LINE_HEIGHT.snug,
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
