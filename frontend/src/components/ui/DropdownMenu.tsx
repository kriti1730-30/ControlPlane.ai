import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
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

// dashboard.sarvam.ai listbox popover, rendered via portal to document.body so
// it escapes any `overflow: hidden` parents (TextareaCard, Layout's rounded
// panel, etc.) — this is the standard fix for dropdown z-index / clipping bugs.

export type DropdownOption =
  | string
  | { value: string; description?: string };

type Props = {
  triggerRef: RefObject<HTMLElement | null>;
  options: DropdownOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  minWidth?: number;
  maxHeight?: number;
};

function normalise(opt: DropdownOption): { value: string; description?: string } {
  return typeof opt === 'string' ? { value: opt } : opt;
}

export default function DropdownMenu({
  triggerRef,
  options,
  selected,
  onSelect,
  onClose,
  minWidth,
  maxHeight = 280,
}: Props) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Measure trigger position; keep in sync with scroll/resize.
  useLayoutEffect(() => {
    function update() {
      const el = triggerRef.current;
      if (el) setRect(el.getBoundingClientRect());
    }
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [triggerRef]);

  // Outside-click + Escape to close. Ignore clicks on the trigger itself.
  useEffect(() => {
    function onDocPointer(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDocPointer);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocPointer);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose, triggerRef]);

  if (!rect) return null;

  const menu = (
    <div
      ref={menuRef}
      role="listbox"
      style={{
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        minWidth,
        zIndex: 1000,
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: RADIUS.lg,
        paddingTop: SPACE[4],
        paddingBottom: SPACE[4],
        boxShadow:
          '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
        outline: 'none',
      }}
    >
      <div
        className="scrollbar-overlay"
        style={{
          maxHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[2],
        }}
      >
        {options.map((raw) => {
          const opt = normalise(raw);
          const isSelected = opt.value === selected;
          return (
            <Item
              key={opt.value}
              option={opt}
              selected={isSelected}
              onClick={() => onSelect(opt.value)}
            />
          );
        })}
      </div>
    </div>
  );

  return createPortal(menu, document.body);
}

function Item({
  option,
  selected,
  onClick,
}: {
  option: { value: string; description?: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={onClick}
      style={{
        marginLeft: SPACE[4],
        marginRight: SPACE[4],
        paddingLeft: SPACE[6],
        paddingRight: SPACE[6],
        paddingTop: SPACE[4],
        paddingBottom: SPACE[4],
        borderRadius: option.description ? RADIUS.md : RADIUS.pill,
        cursor: 'pointer',
        transition: 'background-color 120ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = COLORS.cream[200];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: option.description ? 'flex-start' : 'center',
          gap: SPACE[6],
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
          <p
            style={{
              margin: 0,
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.sm,
              fontWeight: FONT_WEIGHT.regular,
              lineHeight: LINE_HEIGHT.relaxed,
              color: COLORS.ink[900],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {option.value}
          </p>
          {option.description && (
            <p
              style={{
                margin: 0,
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.regular,
                lineHeight: LINE_HEIGHT.relaxed,
                color: COLORS.ink[600],
              }}
            >
              {option.description}
            </p>
          )}
        </div>
        {selected && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Check
              size={ICON.feature}
              strokeWidth={ICON.strokeWidth}
              aria-hidden
              style={{ color: COLORS.ink[900] }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
