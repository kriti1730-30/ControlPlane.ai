import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

import Sidebar from './Sidebar';
import { LayoutContext } from './LayoutContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  COLORS,
  FONTS,
  RADIUS,
  SPACE,
} from '../../constants';

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  /*
   * Keep the same small framing gutter used by the original Sarvam layout.
   * The important visual relationship is:
   *
   *   desktop:
   *   sidebar | rounded application surface
   *
   *   mobile:
   *   drawer + small outer gutter + rounded application surface
   */
  const inset = SPACE[4];

  const openMobile = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((value) => !value);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => !value);
  }, []);

  /*
   * Navigation should always close the mobile drawer.
   * Desktop collapse state is intentionally preserved.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /*
   * Prevent the document underneath the mobile drawer from scrolling.
   */
  useEffect(() => {
    if (!mobileOpen || !isMobile) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, isMobile]);

  return (
    <LayoutContext.Provider
      value={{
        mobileOpen,
        openMobile,
        closeMobile,
        toggleMobile,
        collapsed,
        toggleCollapsed,
      }}
    >
      <div
        className="flex h-svh max-h-svh w-full overflow-hidden"
        style={{
          backgroundColor: COLORS.surfaceMuted,
          color: COLORS.ink[700],
          fontFamily: FONTS.sans,
        }}
      >
        <Sidebar />

        {isMobile && mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobile}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              border: 'none',
              padding: 0,
              backgroundColor: 'rgba(20, 20, 20, 0.18)',
              backdropFilter: 'blur(1px)',
              cursor: 'pointer',
              animation: 'fadeIn 160ms ease-out',
            }}
          />
        )}

        <main
          className="flex min-w-0 flex-1 flex-col"
          style={{
            paddingTop: inset,
            paddingRight: inset,
            paddingBottom: inset,
            paddingLeft: isMobile ? inset : 0,
          }}
        >
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            style={{
              backgroundColor: COLORS.surface,
              border: `1px solid ${COLORS.border.DEFAULT}`,
              borderRadius: RADIUS.lg,
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}