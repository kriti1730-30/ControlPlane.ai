import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  LINE_HEIGHT,
  SPACE,
} from '../../../constants';

type Props = {
  tokenCount: number;
  tokensPerSecond: number;
  isStreaming: boolean;
};

/**
 * Inline text metrics — "142 tokens · 38.4 tok/s". Replaces the iconed-pill
 * version since plain text fits the Sarvam typographic vocabulary better.
 */
export default function MetricsText({
  tokenCount,
  tokensPerSecond,
  isStreaming,
}: Props) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: SPACE[2],
        fontFamily: FONTS.sans,
        fontSize: FONT_SIZE.sm,
        lineHeight: LINE_HEIGHT.tight,
      }}
    >
      <span style={{ fontWeight: FONT_WEIGHT.medium, color: COLORS.ink[900] }}>
        {tokenCount}
      </span>
      <span style={{ color: COLORS.ink[500] }}>tokens</span>
      <span style={{ color: COLORS.ink[300], paddingLeft: 2, paddingRight: 2 }}>·</span>
      <span style={{ fontWeight: FONT_WEIGHT.medium, color: COLORS.ink[900] }}>
        {isStreaming ? tokensPerSecond.toFixed(1) : '—'}
      </span>
      <span style={{ color: COLORS.ink[500] }}>tok/s</span>
    </div>
  );
}
