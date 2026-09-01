import { NavLink, useNavigate } from 'react-router-dom';
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

const OTHER_WORKSPACE: Record<SessionRole, { to: string; label: string }> = {
  employee: { to: '/customer-operations', label: 'Customer Operations' },
  support_operator: { to: '/employee', label: 'Employee AI' },
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
];

export default function Sidebar() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const sessionRole = readSessionRole();

  // If no session role is found (shouldn't happen post-login, but fail
  // toward showing both rather than showing neither) fall back to all.
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
    backgroundColor: COLORS.surfaceMuted,
    fontFamily: FONTS.sans,
    color: COLORS.ink[700],
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
                  backgroundColor: '#EEE9FF',
                  color: '#7758D8',
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
                    color: COLORS.ink[900],
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
                    color: COLORS.ink[500],
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
          ? COLORS.cream[200]
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: COLORS.ink[900],
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
            color: COLORS.ink[500],
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

  const rowStyle = (isActive: boolean) =>
    ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed
        ? 'center'
        : 'flex-start',
      gap: SPACE[4],
      height: SPACE[18],
      paddingLeft: collapsed ? 0 : SPACE[6],
      paddingRight: collapsed ? 0 : SPACE[6],
      borderRadius: RADIUS.pill,
      backgroundColor: isActive
        ? COLORS.cream[300]
        : hover
          ? COLORS.cream[200]
          : 'transparent',
      color: isActive
        ? COLORS.ink[900]
        : COLORS.ink[600],
      textDecoration: 'none',
      transition:
        'background-color 200ms, padding 200ms',
    }) as const;

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="focus-visible:outline-none focus-visible:ring-2"
      style={({ isActive }) => rowStyle(isActive)}
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
              fontWeight: FONT_WEIGHT.regular,
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
            color: COLORS.ink[400],
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
          ? COLORS.cream[200]
          : 'transparent',
        color: COLORS.ink[600],
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
        borderTop: `1px solid ${COLORS.border.DEFAULT}`,
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
          {other && (
            <NavLink
              to={other.to}
              onClick={() => setOpen(false)}
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
          justifyContent: collapsed
            ? 'center'
            : 'flex-start',
          gap: SPACE[4],
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: collapsed
            ? 0
            : `0 ${SPACE[6]}px`,
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            display: 'flex',
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: RADIUS.pill,
            backgroundColor: COLORS.cream[300],
            color: COLORS.ink[700],
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
              minWidth: 0,
              textAlign: 'left',
              flex: 1,
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.medium,
                color: COLORS.ink[900],
                lineHeight: LINE_HEIGHT.normal,
              }}
            >
              {profile.title}
            </span>

            <span
              style={{
                display: 'block',
                marginTop: 2,
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.regular,
                color: COLORS.ink[500],
                lineHeight: LINE_HEIGHT.normal,
              }}
            >
              {profile.subtitle}
            </span>
          </span>
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