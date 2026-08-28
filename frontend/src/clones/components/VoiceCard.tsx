import { Heart, Play } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LINE_HEIGHT,
  SPACE,
} from '../../constants';
import Tag from './Tag';

type GradientKey = 'green' | 'indigo' | 'orange' | 'coral' | 'red';

export type Voice = {
  name: string;
  description: string;
  gender: 'Male' | 'Female';
  starred?: boolean;
  gradient: GradientKey;
  avatarSize?: number;
};

type Props = {
  voice: Voice;
  onPlay?: () => void;
  onFavourite?: () => void;
};

// dashboard.sarvam.ai voice list row:
//   <div flex justify-between gap-tatva-8>
//     <div flex items-center gap-tatva-8 flex-1>
//       <button> <img Avatar/> + play overlay (drop-shadow) </button>
//       <div flex-col gap-tatva-1>
//         <div flex items-center gap-tatva-4>
//           <p>Name</p>
//           <Tag>Male★</Tag>
//         </div>
//         <p>Description</p>
//       </div>
//     </div>
//     <button> <Heart/> </button>
//   <hr py-tatva-10/>
export default function VoiceCard({ voice, onPlay, onFavourite }: Props) {
  const size = voice.avatarSize ?? 56; // size-tatva-28
  const tagVariant = voice.gender === 'Male' ? 'indigo' : 'pink';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: SPACE[8],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[8],
            flex: 1,
            minWidth: 0,
          }}
        >
          <PlayAvatar gradient={voice.gradient} size={size} onClick={onPlay} />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: SPACE[1],
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: FONTS.sans,
                  fontSize: FONT_SIZE.sm,                // body-sm = 14px
                  fontWeight: FONT_WEIGHT.regular,
                  lineHeight: LINE_HEIGHT.relaxed,
                  color: COLORS.ink[900],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {voice.name}
              </p>
              <Tag variant={tagVariant} starred={voice.starred}>
                {voice.gender}
              </Tag>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.regular,
                lineHeight: LINE_HEIGHT.relaxed,
                color: COLORS.ink[600],                  // content-secondary
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {voice.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFavourite}
          aria-label={`Save ${voice.name}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: COLORS.ink[600],
            cursor: 'pointer',
            flexShrink: 0,
          }}
          className="hover:opacity-70 focus-visible:outline-none focus-visible:ring-2"
        >
          <Heart size={20} strokeWidth={ICON.strokeWidth} aria-hidden />
        </button>
      </div>

      {/* Divider — Sarvam uses py-tatva-10 (20px each side) wrapping a 1px hr */}
      <div style={{ paddingTop: SPACE[10], paddingBottom: SPACE[10] }}>
        <hr
          aria-orientation="horizontal"
          style={{
            margin: 0,
            border: 'none',
            height: 1,
            width: '100%',
            backgroundColor: COLORS.border.DEFAULT,
          }}
        />
      </div>
    </div>
  );
}

function PlayAvatar({
  gradient,
  size,
  onClick,
}: {
  gradient: GradientKey;
  size: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Play sample"
      style={{
        position: 'relative',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'pointer',
        background: COLORS.gradient[gradient],
        border: 'none',
        flexShrink: 0,
      }}
      className="group"
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 0px 1px 2px)',
        }}
      >
        <Play
          size={24}
          strokeWidth={ICON.strokeWidth}
          fill="currentColor"
          aria-hidden
        />
      </span>
    </button>
  );
}
