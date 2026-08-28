import { COLORS, RADIUS, SPACE } from '../../constants';

type Props = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  ariaLabel?: string;
};

// dashboard.sarvam.ai:
//   <button role="switch" w-tatva-20 (40px) p-tatva-2 (4px)
//     bg-tatva-background-secondary rounded-tatva-full>
//     <span size-tatva-8 (16px) bg-tatva-background-primary rounded-full
//       translate-x-tatva-0 / translate-x-tatva-10 (20px) on checked/>
//   </button>
export default function Switch({ checked, onChange, ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange?.(!checked)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        width: SPACE[20],   // 40px
        padding: SPACE[2],  // 4px inner padding
        borderRadius: RADIUS.pill,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: checked ? COLORS.ink[900] : COLORS.cream[200],
        transition: 'background-color 200ms',
      }}
      className="focus-visible:outline-none focus-visible:ring-2"
    >
      <span
        aria-hidden
        style={{
          width: SPACE[8],   // 16px
          height: SPACE[8],
          borderRadius: '50%',
          backgroundColor: COLORS.surface,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
          transform: checked ? `translateX(${SPACE[8]}px)` : 'translateX(0)',
          transition: 'transform 200ms ease-out',
        }}
      />
    </button>
  );
}
