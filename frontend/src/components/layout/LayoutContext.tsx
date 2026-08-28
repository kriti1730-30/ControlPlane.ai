import { createContext, useContext } from 'react';

export type LayoutCtx = {
  /** Mobile drawer state — true when the off-canvas sidebar is showing. */
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
  /** Desktop sidebar collapsed-to-rail state. */
  collapsed: boolean;
  toggleCollapsed: () => void;
};

export const LayoutContext = createContext<LayoutCtx>({
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
  collapsed: false,
  toggleCollapsed: () => {},
});

export function useLayout(): LayoutCtx {
  return useContext(LayoutContext);
}
