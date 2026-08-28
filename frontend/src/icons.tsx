// All custom SVG icons live here. Each is a React component that inherits
// `currentColor` for theming. Add new icons as named exports below.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

// ---------------------------------------------------------------------------
// Sidebar toggle — custom panel-with-rail glyph used by the sidebar header
// ---------------------------------------------------------------------------

export function SidebarToggleIcon({
  size = 16,
  strokeWidth = 2,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
      {...rest}
    >
      <path d="M2 12C2 8.31087 2 6.4663 2.81382 5.15877C3.1149 4.67502 3.48891 4.25427 3.91891 3.91554C5.08116 3 6.72077 3 10 3H14C17.2792 3 18.9188 3 20.0811 3.91554C20.5111 4.25427 20.8851 4.67502 21.1862 5.15877C22 6.4663 22 8.31087 22 12C22 15.6891 22 17.5337 21.1862 18.8412C20.8851 19.325 20.5111 19.7457 20.0811 20.0845C18.9188 21 17.2792 21 14 21H10C6.72077 21 5.08116 21 3.91891 20.0845C3.48891 19.7457 3.1149 19.325 2.81382 18.8412C2 17.5337 2 15.6891 2 12Z" />
      <path d="M9.5 3L9.5 21" strokeLinejoin="round" />
      <path d="M5 7H6M5 10H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Home — custom roof-and-base glyph used by the sidebar home row
// ---------------------------------------------------------------------------

export function HomeIcon({
  size = 16,
  strokeWidth = 2,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d="M22 10.5L12.8825 2.82207C12.6355 2.61407 12.3229 2.5 12 2.5C11.6771 2.5 11.3645 2.61407 11.1175 2.82207L2 10.5" />
      <path d="M20.5 9.5V16C20.5 18.3456 20.5 19.5184 19.8801 20.3263C19.7205 20.5343 19.5343 20.7205 19.3263 20.8801C18.5184 21.5 17.3456 21.5 15 21.5V17C15 15.5858 15 14.8787 14.5607 14.4393C14.1213 14 13.4142 14 12 14C10.5858 14 9.87868 14 9.43934 14.4393C9 14.8787 9 15.5858 9 17V21.5C6.65442 21.5 5.48164 21.5 4.67372 20.8801C4.46572 20.7205 4.27954 20.5343 4.11994 20.3263C3.5 19.5184 3.5 18.3456 3.5 16V9.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sarvam monogram — stylised 8-fold lotus mark, drawn as four overlapping
// lens shapes with a small diamond at the centre. Used as a hero glyph on
// empty states (rendered in white over a gradient sphere).
// ---------------------------------------------------------------------------

export function SarvamMonogram({
  size = 64,
  strokeWidth = 3,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {/* Four overlapping lens shapes rotated 0 / 45 / 90 / 135 */}
      <ellipse cx="50" cy="50" rx="38" ry="13" />
      <ellipse cx="50" cy="50" rx="13" ry="38" />
      <ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="13"
        transform="rotate(45 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="13"
        transform="rotate(-45 50 50)"
      />
      {/* Central diamond */}
      <rect
        x="45"
        y="45"
        width="10"
        height="10"
        transform="rotate(45 50 50)"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}