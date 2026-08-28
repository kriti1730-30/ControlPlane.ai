import { useState, type ReactNode } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  SPACE,
} from '../../constants';

type Props = {
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
  height?: number | string;
  readOnly?: boolean;
  /** Bottom toolbar — left side (e.g., language dropdown). */
  leftControls?: ReactNode;
  /** Bottom toolbar — right side (e.g., Clear button). Visible on hover. */
  rightControls?: ReactNode;
};

// dashboard.sarvam.ai:
//   <div bg-tatva-background-primary-hover rounded-3xl border overflow-hidden h-[430px]>
//     <div flex-1 overflow-y-auto px-tatva-10 pt-tatva-10 pb-tatva-4>
//       <textarea bg-transparent leading-[200%] resize-none ... />
//     </div>
//     <gradient fade overlay above bottom toolbar>
//     <div flex justify-between px-tatva-8 py-tatva-6>
//       <left controls>
//       <right controls (opacity-0, group-hover:opacity-100)>
export default function TextareaCard({
  value,
  onChange,
  placeholder,
  maxLength = 3500,
  height = 430,
  readOnly,
  leftControls,
  rightControls,
}: Props) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height,
        backgroundColor: COLORS.surfaceMuted, // background-primary-hover
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: 24, // rounded-3xl ≈ 24px
      }}
    >
      <div
        className="scrollbar-hide"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[10],
          paddingTop: SPACE[10],
          paddingBottom: SPACE[4],
        }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,           // body-md = 15px
            fontWeight: FONT_WEIGHT.regular,
            lineHeight: 2,                    // leading-[200%]
            color: COLORS.ink[900],
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Gradient fade above the bottom toolbar — masks bottom of overflowing text */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 60,
          height: 60,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${COLORS.surfaceMuted}b3 50%, ${COLORS.surfaceMuted})`,
        }}
      />

      {/* Bottom toolbar */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: SPACE[8],
          paddingRight: SPACE[8],
          paddingTop: SPACE[6],
          paddingBottom: SPACE[6],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
          {leftControls}
        </div>
        <div
          style={{
            opacity: hover ? 1 : 0,
            transition: 'opacity 120ms',
          }}
        >
          {rightControls}
        </div>
      </div>

      {/* Inline override for the Tailwind utility we reference above */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
    </div>
  );
}
