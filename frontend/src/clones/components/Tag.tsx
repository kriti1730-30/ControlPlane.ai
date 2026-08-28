import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACE,
} from '../../constants';

type Variant = 'indigo' | 'pink';

type Props = {
  variant: Variant;
  children: React.ReactNode;
  starred?: boolean;
};

// dashboard.sarvam.ai:
//   bg-tatva-{indigo|pink}-100  text-{indigo|pink}-800
//   h-tatva-10 (20px)  px-tatva-4 (8px)  gap-tatva-2 (4px)  text-tatva-body-xs (12px)
//   rounded-tatva-full   font-matter
export default function Tag({ variant, children, starred }: Props) {
  const { bg, fg } = COLORS.tag[variant];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACE[2],
        height: SPACE[10],            // h-tatva-10
        paddingLeft: SPACE[4],        // px-tatva-4
        paddingRight: SPACE[4],
        borderRadius: RADIUS.pill,
        backgroundColor: bg,
        color: fg,
        fontSize: FONT_SIZE.xs,       // text-tatva-body-xs
        fontWeight: FONT_WEIGHT.regular,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: SPACE[1] }}>
        {children}
        {starred && (
          <span aria-hidden style={{ color: COLORS.tag.amber, cursor: 'default' }}>
            ★
          </span>
        )}
      </span>
    </span>
  );
}
