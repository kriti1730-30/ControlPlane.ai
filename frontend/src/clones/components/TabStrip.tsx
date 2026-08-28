import type { ReactNode } from 'react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

export type Tab = {
  id: string;
  label: string;
  icon: ReactNode;
};

type Props = {
  tabs: Tab[];
  activeId: string;
  onSelect?: (id: string) => void;
};

// dashboard.sarvam.ai:
//   <div flex items-start overflow-x-auto px-tatva-10 py-tatva-12 gap-tatva-2 scrollbar-hide>
//     <div shrink-0 relative>
//       <div absolute bg-tatva-background-secondary rounded-full z-0/>  ← only on active
//       <button h-tatva-18 px-tatva-8 rounded-tatva-full text-tatva-body-sm>
//         <icon size-tatva-8/>  <p>Conversational</p>
//       </button>
export default function TabStrip({ tabs, activeId, onSelect }: Props) {
  return (
    <div
      className="scrollbar-hide"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: SPACE[2],
        overflowX: 'auto',
        paddingLeft: SPACE[10],
        paddingRight: SPACE[10],
        paddingTop: SPACE[12],
        paddingBottom: SPACE[12],
      }}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={tab.id === activeId}
          onClick={() => onSelect?.(tab.id)}
        />
      ))}
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick,
}: {
  tab: Tab;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div style={{ flexShrink: 0, position: 'relative' }}>
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.cream[200], // bg-background-secondary
          }}
        />
      )}
      <button
        type="button"
        onClick={onClick}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: SPACE[4],
          minHeight: SPACE[18], // 36px
          paddingLeft: SPACE[8],
          paddingRight: SPACE[8],
          borderRadius: RADIUS.pill,
          border: 'none',
          background: 'transparent',
          color: COLORS.ink[900],
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.regular,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background-color 120ms',
        }}
        className="hover:bg-tatva-background-secondary focus-visible:outline-none focus-visible:ring-2"
      >
        <span style={{ display: 'inline-flex', flexShrink: 0 }}>{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    </div>
  );
}

