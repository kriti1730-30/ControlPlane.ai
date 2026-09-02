import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BrainCircuit,
  ChevronRight,
  ClipboardList,
  History,
  LogOut,
  Repeat,
  Settings,
  ShieldCheck,
  Sparkles,
  Code2,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
  SIZE,
} from '../../constants';

import { SidebarToggleIcon } from '../../icons';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLayout } from './LayoutContext';

const COLLAPSED_WIDTH = 64;
const MOBILE_WIDTH = 280;
const SESSION_STORAGE_KEY = 'controlplane_session';

// Glass theme — scoped to this file only, not the shared design tokens,
// since the connected content area stays exactly as it is (white/light).
const GLASS = {
  background:
    'linear-gradient(165deg, rgba(40,40,44,0.94) 0%, rgba(28,28,30,0.96) 50%, rgba(18,18,20,0.97) 100%)',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.60)',
  textMuted: 'rgba(255,255,255,0.38)',
  hoverBg: 'rgba(255,255,255,0.08)',
  iconBadgeBg: 'rgba(255,255,255,0.14)',
} as const;

type SessionRole = 'employee' | 'support_operator';

function readSessionRole(): SessionRole | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { role?: string };
    return parsed.role === 'employee' || parsed.role === 'support_operator'
      ? parsed.role
      : null;
  } catch {
    return null;
  }
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // best-effort — nothing else to fall back to for a demo session
  }
}

// Fix: "Switch to X" only ever navigated the route — it never touched the
// stored session, so the sidebar (role-filtered nav + profile identity)
// kept reflecting whichever role you originally logged in as, forever.
// That's why the switch only ever worked in one direction and the sidebar
// never matched the page you'd actually navigated to. This updates the
// session's role/workspace at the moment of the click, before navigation
// completes, so the next render picks up the correct, current role.
function switchSessionRole(newRole: SessionRole): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      ...existing,
      role: newRole,
      workspace: WORKSPACE_ROUTE_FOR_ROLE[newRole],
    }));
  } catch {
    // best-effort — worst case the switch link's target is stale next time
  }
}

const OTHER_WORKSPACE: Record<SessionRole, { to: string; label: string }> = {
  employee: { to: '/customer-operations', label: 'Customer Operations' },
  support_operator: { to: '/employee', label: 'Employee AI' },
};

const WORKSPACE_ROUTE_FOR_ROLE: Record<SessionRole, string> = {
  employee: '/employee',
  support_operator: '/customer-operations',
};

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
};

const iconProps = {
  size: ICON.nav,
  strokeWidth: ICON.strokeWidth,
  'aria-hidden': true as const,
};

// Fix: both entries always rendered regardless of who signed in — an
// Employee-role session saw Customer Operations too, and vice versa.
// Filtered by session role at render time, below.
const ALL_WORKSPACE_ITEMS: (NavItem & { forRole: SessionRole })[] = [
  {
    to: '/employee',
    label: 'Employee AI',
    icon: <BrainCircuit {...iconProps} />,
    forRole: 'employee',
  },
  {
    to: '/customer-operations',
    label: 'Customer Operations',
    icon: <ShieldCheck {...iconProps} />,
    forRole: 'support_operator',
  },
];

// Fix: every workflow item pointed at the exact same route ('/employee'),
// so clicking one while already on that page did nothing visible — it
// wasn't a broken click handler, it was a same-page no-op navigation.
// The query param is read by EmployeeWorkspace to actually open that task.
const WORKFLOW_ITEMS: NavItem[] = [
  {
    to: '/employee?task=research',
    label: 'Research',
    icon: <ClipboardList {...iconProps} />,
  },
  {
    to: '/employee?task=debugging',
    label: 'Coding',
    icon: <Code2 {...iconProps} />,
  },
  {
    to: '/employee?task=analysis',
    label: 'Data Analysis',
    icon: <BarChart3 {...iconProps} />,
  },
  {
    to: '/employee?task=production_change',
    label: 'Production Change',
    icon: <ShieldCheck {...iconProps} />,
  },
];

export default function Sidebar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  // Subscribing to location explicitly guarantees Sidebar itself re-renders
  // on every navigation (not just deeper children like NavRow that already
  // subscribe) — that's what makes sessionRole actually re-read from
  // localStorage right after a workspace switch, instead of only updating
  // deeper in the tree while this component's own role/filtering goes stale.
  useLocation();
  const sessionRole = readSessionRole();

  // Fix: both workspaces are real, finished features here, not a role-
  // gated production system — hiding one behind the other's login was
  // actively confusing (switching workspaces via the profile menu changed
  // the page but not the stored role, so the nav kept showing only the
  // original one). Always show both; sessionRole is still used for the
  // profile row's own identity label further down.
  // Restored: each credential should only show its own workspace by
  // default — showing both regardless of login defeats the point of having
  // separate Employee / Support Operator accounts. Reaching the other one
  // is still possible via the profile menu's "Switch to..." link below.
  const workspaceItems = sessionRole
    ? ALL_WORKSPACE_ITEMS.filter((item) => item.forRole === sessionRole)
    : ALL_WORKSPACE_ITEMS;

  const {
    collapsed,
    toggleCollapsed,
    mobileOpen,
    closeMobile,
  } = useLayout();

  /*
   * The original Sarvam sidebar never collapses inside the mobile drawer.
   * Preserve that behavior.
   */
  const effectiveCollapsed = isMobile ? false : collapsed;

  const baseStyle: React.CSSProperties = {
    width: isMobile
      ? MOBILE_WIDTH
      : effectiveCollapsed
        ? COLLAPSED_WIDTH
        : SIZE.sidebarWidth,
    flexShrink: 0,
    paddingLeft: SPACE[6],
    paddingRight: SPACE[6],
    background: GLASS.background,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: `1px solid ${GLASS.border}`,
    fontFamily: FONTS.sans,
    color: GLASS.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    transition: isMobile
      ? 'transform 220ms ease'
      : 'width 200ms ease',
    overflow: 'hidden',
  };

  const mobileStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: mobileOpen
          ? 'translateX(0)'
          : 'translateX(-100%)',
        boxShadow: mobileOpen
          ? '0 10px 30px rgba(0,0,0,0.18)'
          : 'none',
      }
    : {};

  return (
    <aside
      aria-label="Primary"
      aria-hidden={isMobile && !mobileOpen}
      style={{
        ...baseStyle,
        ...mobileStyle,
      }}
    >
      <LogoRow
        isMobile={isMobile}
        collapsed={effectiveCollapsed}
        onToggle={isMobile ? closeMobile : toggleCollapsed}
        toggleLabel={
          isMobile
            ? 'Close menu'
            : effectiveCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
        }
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingTop: SPACE[6],
            paddingBottom: SPACE[6],
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: SPACE[10],
            }}
          >
            <NavGroup
              label="Workspace"
              items={workspaceItems}
              collapsed={effectiveCollapsed}
            />

            <NavGroup
              label="Workflows"
              items={WORKFLOW_ITEMS}
              collapsed={effectiveCollapsed}
            />

            <NavGroup
              label="Activity"
              collapsed={effectiveCollapsed}
              items={[
                {
                  to: '/employee?history=open',
                  label: 'History',
                  icon: <History {...iconProps} />,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          flexShrink: 0,
          paddingTop: SPACE[4],
        }}
      >
        <SettingsRow collapsed={effectiveCollapsed} />
      </div>

      <div
        style={{
          flexShrink: 0,
          paddingTop: SPACE[4],
          paddingBottom: SPACE[4],
        }}
      >
        <ProfileRow
          collapsed={effectiveCollapsed}
          role={sessionRole}
          onSignOut={() => {
            clearSession();
            navigate('/', { replace: true });
          }}
        />
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Logo row                                                                   */
/* -------------------------------------------------------------------------- */

function LogoRow({
  isMobile,
  collapsed,
  onToggle,
  toggleLabel,
}: {
  isMobile: boolean;
  collapsed: boolean;
  onToggle: () => void;
  toggleLabel: string;
}) {
  const [hover, setHover] = useState(false);

  const showWordmark = isMobile || !collapsed;

  return (
    <div
      style={{
        paddingTop: SPACE[6],
        paddingBottom: SPACE[6],
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: showWordmark
            ? 'space-between'
            : 'center',
          paddingTop: SPACE[4],
          paddingBottom: SPACE[4],
        }}
      >
        {showWordmark && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACE[4],
                paddingLeft: SPACE[2],
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: RADIUS.md,
                  backgroundColor: GLASS.iconBadgeBg,
                  color: GLASS.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: FONTS.sans,
                    fontSize: FONT_SIZE.md,
                    fontWeight: FONT_WEIGHT.medium,
                    color: GLASS.textPrimary,
                    lineHeight: LINE_HEIGHT.normal,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ControlPlane
                </p>

                <p
                  style={{
                    margin: 0,
                    marginTop: 2,
                    fontFamily: FONTS.sans,
                    fontSize: FONT_SIZE.sm,
                    fontWeight: FONT_WEIGHT.regular,
                    color: GLASS.textSecondary,
                    lineHeight: LINE_HEIGHT.normal,
                    whiteSpace: 'nowrap',
                  }}
                >
                  AI assurance
                </p>
              </div>
            </div>
          </div>
        )}

        {!isMobile && (
          <CollapseButton
            onClick={onToggle}
            label={toggleLabel}
            expanded={!collapsed}
            hover={hover}
            setHover={setHover}
          />
        )}

        {isMobile && (
          <CollapseButton
            onClick={onToggle}
            label={toggleLabel}
            expanded
            hover={hover}
            setHover={setHover}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collapse button                                                            */
/* -------------------------------------------------------------------------- */

function CollapseButton({
  onClick,
  label,
  expanded,
  hover,
  setHover,
}: {
  onClick: () => void;
  label: string;
  expanded: boolean;
  hover: boolean;
  setHover: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: SPACE[18],
        minWidth: SPACE[18],
        borderRadius: RADIUS.pill,
        backgroundColor: hover
          ? GLASS.hoverBg
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: GLASS.textPrimary,
        transition: 'background-color 120ms',
        flexShrink: 0,
      }}
    >
      <SidebarToggleIcon
        size={ICON.nav}
        strokeWidth={ICON.strokeWidth}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation groups                                                         */
/* -------------------------------------------------------------------------- */

function NavGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: SPACE[4],
      }}
    >
      {!collapsed && (
        <p
          style={{
            margin: 0,
            paddingLeft: SPACE[6],
            paddingRight: SPACE[6],
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.regular,
            lineHeight: LINE_HEIGHT.relaxed,
            color: GLASS.textMuted,
          }}
        >
          {label}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[2],
        }}
      >
        {items.map((item) => (
          <NavRow
            key={`${item.to}-${item.label}`}
            {...item}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Navigation row                                                             */
/* -------------------------------------------------------------------------- */

function NavRow({
  to,
  label,
  icon,
  end,
  collapsed,
}: NavItem & {
  collapsed: boolean;
}) {
  const [hover, setHover] = useState(false);
  const location = useLocation();

  // Fix: NavLink's own isActive only compares pathname, never the query
  // string — so every one of Research/Coding/Data Analysis/Production
  // Change/History (all "/employee?...", differing only by query) matched
  // as active simultaneously. Active state is computed manually here by
  // comparing pathname AND search exactly, so only the one actually
  // matching the current URL lights up.
  const [toPath, toQuery = ''] = to.split('?');
  const currentSearch = location.search.replace(/^\?/, '');
  const isActive = location.pathname === toPath && currentSearch === toQuery;

  // Fix (styling): every item — active or not — was rendering with the
  // same rounded-pill background, so nothing visually distinguished the
  // current section. Now: active = bright white text, no background at
  // all; inactive = translucent white, no background; hover = a barely-
  // there text-color shift only, never a box. (Colors inverted for the
  // dark glass sidebar — active still means "solid/full-strength text",
  // just white instead of black now that the background is dark.)
  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: SPACE[4],
    height: SPACE[18],
    paddingLeft: collapsed ? 0 : SPACE[6],
    paddingRight: collapsed ? 0 : SPACE[6],
    backgroundColor: 'transparent',
    color: isActive
      ? GLASS.textPrimary
      : hover
        ? GLASS.textSecondary
        : GLASS.textMuted,
    fontWeight: isActive ? FONT_WEIGHT.medium : FONT_WEIGHT.regular,
    textDecoration: 'none',
    transition: 'color 150ms',
  } as const;

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="focus-visible:outline-none focus-visible:ring-2"
      style={rowStyle}
    >
      <span
        style={{
          display: 'inline-flex',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      {!collapsed && (
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              fontWeight: 'inherit',
              lineHeight: LINE_HEIGHT.relaxed,
              color: 'inherit',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </p>
        </div>
      )}

      {!collapsed && hover && (
        <ChevronRight
          size={14}
          strokeWidth={1.7}
          style={{
            flexShrink: 0,
            color: GLASS.textMuted,
          }}
          aria-hidden
        />
      )}
    </NavLink>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

function SettingsRow({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      title={collapsed ? 'Settings' : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="focus-visible:outline-none focus-visible:ring-2"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed
          ? 'center'
          : 'flex-start',
        gap: SPACE[4],
        width: '100%',
        height: SPACE[18],
        paddingLeft: collapsed ? 0 : SPACE[6],
        paddingRight: collapsed ? 0 : SPACE[6],
        border: 'none',
        borderRadius: RADIUS.pill,
        backgroundColor: hover
          ? GLASS.hoverBg
          : 'transparent',
        color: GLASS.textSecondary,
        cursor: 'pointer',
        transition:
          'background-color 200ms, padding 200ms',
      }}
    >
      <Settings {...iconProps} />

      {!collapsed && (
        <span
          style={{
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.regular,
            lineHeight: LINE_HEIGHT.relaxed,
          }}
        >
          Settings
        </span>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

function ProfileRow({
  collapsed,
  role,
  onSignOut,
}: {
  collapsed: boolean;
  role: SessionRole | null;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  const profile =
    role === 'support_operator'
      ? { initial: 'S', title: 'Support Operator', subtitle: 'Customer Operations' }
      : { initial: 'E', title: 'Employee', subtitle: 'Internal AI' };

  const other = role ? OTHER_WORKSPACE[role] : null;

  return (
    <div
      style={{
        position: 'relative',
        borderTop: `1px solid ${GLASS.border}`,
        paddingTop: SPACE[4],
      }}
    >
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: collapsed ? 0 : SPACE[6],
            right: collapsed ? undefined : SPACE[6],
            marginBottom: SPACE[2],
            width: collapsed ? 220 : undefined,
            borderRadius: RADIUS.lg,
            border: `1px solid ${COLORS.border.DEFAULT}`,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 14px 35px rgba(0,0,0,0.12)',
            padding: SPACE[2],
            zIndex: 60,
          }}
        >
          {other && role && (
            <NavLink
              to={other.to}
              onClick={() => {
                switchSessionRole(role === 'employee' ? 'support_operator' : 'employee');
                setOpen(false);
              }}
              role="menuitem"
              style={{ ...menuItemStyle, textDecoration: 'none' }}
            >
              <Repeat size={14} strokeWidth={1.8} aria-hidden />
              <span>Switch to {other.label}</span>
            </NavLink>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={menuItemStyle}
          >
            <Settings size={14} strokeWidth={1.8} aria-hidden />
            <span>Settings</span>
          </button>

          <div style={{ height: 1, backgroundColor: COLORS.border.DEFAULT, margin: `${SPACE[2]}px 0` }} />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            style={{ ...menuItemStyle, color: '#B3261E' }}
          >
            <LogOut size={14} strokeWidth={1.8} aria-hidden />
            <span>Sign out</span>
          </button>
        </div>
      )}

      <button
        type="button"
        title={collapsed ? profile.title : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="focus-visible:outline-none focus-visible:ring-2"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: SPACE[3],
          border: 'none',
          borderRadius: RADIUS.pill,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          padding: collapsed ? 0 : `${SPACE[2]}px ${SPACE[3]}px`,
          height: collapsed ? 40 : undefined,
          width: collapsed ? 40 : '100%',
          cursor: 'pointer',
          transition: 'transform 120ms',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: 'flex',
              width: 26,
              height: 26,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: RADIUS.pill,
              backgroundColor: '#1c1c1e',
              color: '#FFFFFF',
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.medium,
              flexShrink: 0,
            }}
          >
            {profile.initial}
          </span>

          {!collapsed && (
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.medium,
                color: '#1c1c1e',
                lineHeight: LINE_HEIGHT.normal,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile.title}
            </span>
          )}
        </span>

        {!collapsed && (
          <ChevronRight
            size={14}
            strokeWidth={2}
            style={{
              flexShrink: 0,
              color: '#1c1c1e',
              transform: open ? 'rotate(-90deg)' : 'rotate(90deg)',
              transition: 'transform 150ms',
            }}
            aria-hidden
          />
        )}
      </button>
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: SPACE[3],
  width: '100%',
  padding: `${SPACE[3]}px ${SPACE[3]}px`,
  border: 'none',
  borderRadius: RADIUS.md,
  backgroundColor: 'transparent',
  color: COLORS.ink[700],
  fontFamily: FONTS.sans,
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.regular,
  textAlign: 'left',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};