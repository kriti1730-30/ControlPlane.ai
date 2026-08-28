import { COLORS, ICON, RADIUS, SPACE } from '../../constants';
import { SidebarToggleIcon } from '../../icons';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLayout } from './LayoutContext';

/**
 * Mobile-only navigation trigger.
 *
 * The sidebar state itself lives in LayoutContext.
 * This component only exposes the action required by the page header.
 */
export default function MenuButton() {
  const isMobile = useIsMobile();
  const { openMobile } = useLayout();

  if (!isMobile) return null;

  return (
    <button
      type="button"
      aria-label="Open navigation menu"
      onClick={openMobile}
      className="focus-visible:outline-none focus-visible:ring-2"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: SPACE[18],
        height: SPACE[18],
        border: 'none',
        borderRadius: RADIUS.pill,
        backgroundColor: 'transparent',
        color: COLORS.ink[900],
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor =
          COLORS.cream[200];
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          'transparent';
      }}
    >
      <SidebarToggleIcon
        size={ICON.nav}
        strokeWidth={ICON.strokeWidth}
      />
    </button>
  );
}