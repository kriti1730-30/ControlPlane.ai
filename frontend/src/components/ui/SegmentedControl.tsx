import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

export type Segment = {
  id: string;
  label: string;
};

type Props = {
  segments: Segment[];
  activeId: string;
  onChange?: (id: string) => void;
};

// dashboard.sarvam.ai:
//   <div flex items-center gap-tatva-2 p-tatva-1 rounded-full
//        bg-tatva-background-secondary border>
//     <button px-tatva-8 py-tatva-3 rounded-full text-sm font-medium>
//       <div absolute bg-background-primary rounded-full shadow/>  ← only on active
//       <span>Label</span>
//     </button>
export default function SegmentedControl({
  segments,
  activeId,
  onChange,
}: Props) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        padding: SPACE[1],
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.cream[200],
        border: `1px solid ${COLORS.border.DEFAULT}`,
      }}
    >
      {segments.map((seg) => {
        const active = seg.id === activeId;
        return (
          <button
            key={seg.id}
            type="button"
            onClick={() => onChange?.(seg.id)}
            style={{
              position: 'relative',
              border: 'none',
              cursor: 'pointer',
              paddingTop: SPACE[3],
              paddingBottom: SPACE[3],
              paddingLeft: SPACE[8],
              paddingRight: SPACE[8],
              borderRadius: RADIUS.pill,
              backgroundColor: active ? COLORS.surface : 'transparent',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              color: active ? COLORS.ink[900] : COLORS.ink[600],
              transition: 'background-color 200ms, color 200ms',
              whiteSpace: 'nowrap',
            }}
            className="focus-visible:outline-none focus-visible:ring-2"
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
