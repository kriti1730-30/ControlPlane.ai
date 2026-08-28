import { Eye, EyeOff } from 'lucide-react';
import SegmentedControl from '../../../components/ui/SegmentedControl';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  FONT_WEIGHT,
  ICON,
  RADIUS,
  SPACE,
} from '../../../constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import type { ViewMode } from '../config';
import Legend from './Legend';
import StreamingChip from './StreamingChip';

type Props = {
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  changesOnly: boolean;
  onChangesOnlyChange: (v: boolean) => void;
  changeCount: number;
  changePct: number;
  isRunning: boolean;
  /** Hide change-counter + Changes-only toggle until something exists. */
  hasGenerated: boolean;
};

/**
 * Toolbar between the header and the diff cards. Hosts the split / unified
 * toggle, the live change-counter, the "Changes only" fold toggle, and the
 * inline colour legend.
 */
export default function ViewControls({
  viewMode,
  onViewModeChange,
  changesOnly,
  onChangesOnlyChange,
  changeCount,
  changePct,
  isRunning,
  hasGenerated,
}: Props) {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACE[3],
        paddingLeft: isMobile ? SPACE[6] : SPACE[12],
        paddingRight: isMobile ? SPACE[6] : SPACE[12],
        paddingTop: isMobile ? SPACE[4] : SPACE[6],
        paddingBottom: isMobile ? SPACE[4] : SPACE[6],
        borderBottom: `1px solid ${COLORS.border.DEFAULT}`,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[4],
          flexWrap: 'wrap',
        }}
      >
        <SegmentedControl
          segments={[
            { id: 'split', label: 'Side-by-side' },
            { id: 'unified', label: 'Unified' },
          ]}
          activeId={viewMode}
          onChange={(id) => onViewModeChange(id as ViewMode)}
        />
        {hasGenerated && !isMobile && (
          <span
            style={{
              fontFamily: FONTS.sans,
              fontSize: FONT_SIZE.sm,
              color: COLORS.ink[600],
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: SPACE[2],
            }}
          >
            <span style={{ fontWeight: FONT_WEIGHT.medium, color: COLORS.ink[900] }}>
              {changeCount}
            </span>
            changes
            <span style={{ color: COLORS.ink[300] }}>·</span>
            <span style={{ fontWeight: FONT_WEIGHT.medium, color: COLORS.ink[900] }}>
              {changePct}%
            </span>
            diff
          </span>
        )}
        {isRunning && <StreamingChip />}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[4] }}>
        {hasGenerated && (
        <button
          type="button"
          onClick={() => onChangesOnlyChange(!changesOnly)}
          aria-pressed={changesOnly}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: SPACE[2],
            paddingLeft: SPACE[4],
            paddingRight: SPACE[4],
            paddingTop: SPACE[2],
            paddingBottom: SPACE[2],
            borderRadius: RADIUS.pill,
            border: `1px solid ${changesOnly ? COLORS.ink[900] : COLORS.border.DEFAULT}`,
            backgroundColor: changesOnly ? COLORS.ink[900] : COLORS.surface,
            color: changesOnly ? COLORS.surface : COLORS.ink[700],
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.sm,
            cursor: 'pointer',
            transition: 'background-color 120ms, color 120ms, border-color 120ms',
          }}
          className="focus-visible:outline-none focus-visible:ring-2"
        >
          {changesOnly ? (
            <EyeOff size={12} strokeWidth={ICON.strokeWidth} aria-hidden />
          ) : (
            <Eye size={12} strokeWidth={ICON.strokeWidth} aria-hidden />
          )}
          {isMobile ? 'Changes' : 'Changes only'}
        </button>
        )}
        {!isMobile && <Legend />}
      </div>
    </div>
  );
}
