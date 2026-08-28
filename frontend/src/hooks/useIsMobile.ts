import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

/**
 * Reactive viewport width hook. Returns true on mobile breakpoint (<768px),
 * matching Tailwind v4's default `md` cutoff so CSS-only and JS-driven
 * responsive decisions stay aligned.
 *
 * Initial value is read from the live matchMedia on first render so there's
 * no layout flash on first paint.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
