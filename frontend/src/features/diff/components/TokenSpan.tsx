import { AlertCircle } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  LETTER_SPACING,
  RADIUS,
  SPACE,
} from '../../../constants';
import { isWhitespace, type RenderOp } from '../lib';

/** Renders one diff op — equal text, an insert/delete chip, or a fold marker. */
export default function TokenSpan({ op }: { op: RenderOp }) {
  if (op.type === 'fold') return <FoldMarker count={op.count} />;
  if (isWhitespace(op.token)) return <>{op.token}</>;
  if (op.type === 'equal') return <span>{op.token}</span>;

  const isAdd = op.type === 'insert';
  const colors = isAdd
    ? { bg: COLORS.successBg, fg: COLORS.success }
    : { bg: COLORS.dangerBg, fg: COLORS.danger };

  // <mark> is the semantic element for highlighted/changed text; aria-label
  // lets screen readers announce "added <token>" / "removed <token>" instead
  // of reading the change as plain prose. Browser default mark styling is
  // overridden by inline backgroundColor / color.
  return (
    <mark
      aria-label={`${isAdd ? 'added' : 'removed'}: ${op.token}`}
      title={isAdd ? 'Added in B' : 'Only in A'}
      style={{
        backgroundColor: colors.bg,
        color: colors.fg,
        borderRadius: RADIUS.xs,
        paddingLeft: 3,
        paddingRight: 3,
        textDecoration: !isAdd ? 'line-through' : undefined,
        textDecorationThickness: !isAdd ? 1 : undefined,
        textDecorationColor: !isAdd ? `${COLORS.danger}99` : undefined,
        fontWeight: FONT_WEIGHT.medium,
      }}
    >
      {op.token}
    </mark>
  );
}

function FoldMarker({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} unchanged tokens hidden`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[2],
        marginLeft: 4,
        marginRight: 4,
        paddingLeft: SPACE[3],
        paddingRight: SPACE[3],
        paddingTop: 1,
        paddingBottom: 1,
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.cream[200],
        color: COLORS.ink[500],
        fontFamily: FONTS.mono,
        fontSize: FONT_SIZE.xs,
        letterSpacing: LETTER_SPACING.wide,
        verticalAlign: '1px',
        lineHeight: 1.4,
      }}
    >
      <AlertCircle
        size={10}
        strokeWidth={ICON.strokeWidth}
        aria-hidden
        style={{ color: COLORS.ink[400] }}
      />
      {count} unchanged
    </span>
  );
}
