import { Play } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LINE_HEIGHT,
  RADIUS,
  SIZE,
  SPACE,
} from '../../constants';

// dashboard.sarvam.ai "Best-in-class Speech to Text" right column:
//
//   <div class="relative rounded-tatva-lg overflow-hidden border flex flex-col md:flex-row md:h-tatva-160">
//     ┌── md:w-1/3 ──────────┐  ┌── flex-1, scroll, h-tatva-160 ──────────┐
//     │ avatar + title       │  │ segments with colored left borders       │
//     └──────────────────────┘  └──────────────────────────────────────────┘
//
// Speaker colour is the left border on each segment:
//   brand  → warm peach   (one speaker)
//   indigo → cool blue    (the other speaker)
// Inactive segments (not currently playing) sit at opacity 0.4.

export type Speaker = 'brand' | 'indigo';

const SPEAKER_BORDER: Record<Speaker, string> = {
  brand: COLORS.accent.peach,
  indigo: COLORS.accent.lavender,
};

export type TranscriptSegment = {
  speaker: Speaker;
  text: string;
  active?: boolean; // currently-playing segment renders at full opacity
};

type Props = {
  title: string;
  segments: TranscriptSegment[];
  avatarGradient?: 'green' | 'indigo' | 'orange' | 'coral' | 'red';
};

export default function TranscriptCard({
  title,
  segments,
  avatarGradient = 'red',
}: Props) {
  return (
    <div
      className="flex-col md:flex-row"
      style={{
        position: 'relative',
        display: 'flex',
        height: SIZE.transcriptCardHeight, // 320px on md+
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        border: `1px solid ${COLORS.border.strong}`,
      }}
    >
      <LeftPanel title={title} avatarGradient={avatarGradient} />
      <TranscriptScroll segments={segments} />
    </div>
  );
}

// ---- Left panel (avatar + title) -----------------------------------------

function LeftPanel({
  title,
  avatarGradient,
}: {
  title: string;
  avatarGradient: NonNullable<Props['avatarGradient']>;
}) {
  return (
    <div
      className="md:w-1/3 md:flex-col md:items-start md:justify-between"
      style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE[12], // md:gap-tatva-12 (24px); collapses on mobile
        padding: SPACE[12], // md:p-tatva-12 (24px)
        height: '100%',
      }}
    >
      <PlayAvatar gradient={avatarGradient} />
      <p
        style={{
          margin: 0,
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.lg,           // text-tatva-body-lg (18px)
          fontWeight: FONT_WEIGHT.regular,  // 400
          color: COLORS.ink[900],           // content-primary
          lineHeight: LINE_HEIGHT.relaxed,  // 145%
        }}
      >
        {title}
      </p>
    </div>
  );
}

function PlayAvatar({ gradient }: { gradient: NonNullable<Props['avatarGradient']> }) {
  const bg = COLORS.gradient[gradient];
  return (
    <button
      type="button"
      aria-label="Play audio"
      style={{
        position: 'relative',
        width: SIZE.voiceAvatar,
        height: SIZE.voiceAvatar,
        minWidth: SIZE.voiceAvatar,
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'pointer',
        background: bg,
        border: 'none',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
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

// ---- Right panel (scrolling transcript) ----------------------------------

function TranscriptScroll({ segments }: { segments: TranscriptSegment[] }) {
  return (
    <div
      className="scrollbar-hide"
      style={{
        position: 'relative',
        zIndex: 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE[12], // md:gap-tatva-12 (24px)
        height: '100%',
        overflowY: 'auto',
        padding: SPACE[12], // md:p-tatva-12 (24px)
      }}
    >
      {segments.map((seg, i) => (
        <SegmentRow key={i} segment={seg} />
      ))}
    </div>
  );
}

function SegmentRow({ segment }: { segment: TranscriptSegment }) {
  return (
    <div
      style={{
        display: 'flex',
        borderLeft: `2px solid ${SPEAKER_BORDER[segment.speaker]}`,
        paddingLeft: SPACE[8], // pl-tatva-8 (16px)
        opacity: segment.active ? 1 : 0.4,
        transition: 'opacity 200ms',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: FONTS.display,        // font-season
          fontSize: FONT_SIZE.md,           // ~heading-xs in Tatva
          fontWeight: FONT_WEIGHT.regular,
          color: COLORS.ink[900],
          lineHeight: 1.5,                  // overridden 150% per Sarvam
        }}
      >
        {segment.text}
      </p>
    </div>
  );
}
