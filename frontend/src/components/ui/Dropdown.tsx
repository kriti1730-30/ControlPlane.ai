import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LINE_HEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';
import DropdownMenu, { type DropdownOption } from './DropdownMenu';

type Size = 'sm' | 'md';

type Props = {
  value: string;
  /** Optional list of selectable options. When provided, clicking opens a menu. */
  options?: DropdownOption[];
  onChange?: (value: string) => void;
  placeholder?: boolean;          // render value in tertiary colour
  size?: Size;                    // sm = h-18 (36px), md = h-22 (44px)
  leading?: React.ReactNode;      // optional avatar / icon shown before the value
  onClick?: () => void;
  fullWidth?: boolean;
  menuMinWidth?: number;
};

// dashboard.sarvam.ai trigger:
//   rounded-tatva-full border bg-tatva-background-primary
//   hover:border-tatva-border-secondary
//   sm: h-tatva-18 px-tatva-6
//   md: h-tatva-22 px-tatva-8
// The chevron rotates 180° when the menu is open.
export default function Dropdown({
  value,
  options,
  onChange,
  placeholder,
  size = 'sm',
  leading,
  onClick,
  fullWidth = true,
  menuMinWidth,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const height = size === 'sm' ? SPACE[18] : SPACE[22];
  const px = size === 'sm' ? SPACE[6] : SPACE[8];

  const handleClick = () => {
    if (options) setOpen((o) => !o);
    onClick?.();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-haspopup={options ? 'listbox' : undefined}
        aria-expanded={options ? open : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: SPACE[4],
          width: '100%',
          height,
          paddingLeft: px,
          paddingRight: px,
          borderRadius: RADIUS.pill,
          border: `1px solid ${open ? COLORS.border.strong : COLORS.border.DEFAULT}`,
          backgroundColor: COLORS.surface,
          cursor: 'pointer',
          transition: 'border-color 120ms',
        }}
        className="hover:border-tatva-secondary focus-visible:outline-none focus-visible:ring-2"
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: SPACE[4],
            minWidth: 0,
            flex: 1,
          }}
        >
          {leading && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{leading}</span>}
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.regular,
              lineHeight: LINE_HEIGHT.relaxed,
              color: placeholder ? COLORS.ink[500] : COLORS.ink[900],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'left',
            }}
          >
            {value}
          </span>
        </span>
        <ChevronDown
          size={ICON.feature}
          strokeWidth={ICON.strokeWidth}
          aria-hidden
          style={{
            color: COLORS.ink[500],
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms',
          }}
        />
      </button>

      {options && open && (
        <DropdownMenu
          triggerRef={triggerRef}
          options={options}
          selected={value}
          onSelect={(v) => {
            onChange?.(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
          minWidth={menuMinWidth}
        />
      )}
    </div>
  );
}
