import { SPACE } from '../../../constants';
import type { RenderOp } from '../lib';
import DiffCardColumn from './DiffCardColumn';

type Props = {
  outputA: string;
  outputB: string;
  onOutputAChange: (v: string) => void;
  onOutputBChange: (v: string) => void;
  modelA: string;
  modelB: string;
  onModelAChange: (v: string) => void;
  onModelBChange: (v: string) => void;
  renderOps: RenderOp[];
  isRunning: boolean;
  copiedSide: 'A' | 'B' | null;
  onCopy: (side: 'A' | 'B') => void;
};

/**
 * Side-by-side diff layout. Splits the rendered ops by type so each card only
 * sees its own perspective (A = equal + delete, B = equal + insert).
 */
export default function SplitView({
  outputA,
  outputB,
  onOutputAChange,
  onOutputBChange,
  modelA,
  modelB,
  onModelAChange,
  onModelBChange,
  renderOps,
  isRunning,
  copiedSide,
  onCopy,
}: Props) {
  const opsA = renderOps.filter((o) => o.type !== 'insert');
  const opsB = renderOps.filter((o) => o.type !== 'delete');

  return (
    <div
      className="flex-col md:flex-row"
      style={{
        display: 'flex',
        height: '100%',
        boxSizing: 'border-box',
        paddingBottom: SPACE[8],
        minHeight: 0,
      }}
    >
      <DiffCardColumn
        side="A"
        model={modelA}
        onModelChange={onModelAChange}
        rawValue={outputA}
        onRawChange={onOutputAChange}
        ops={opsA}
        emptyOpType="delete"
        isRunning={isRunning}
        copied={copiedSide === 'A'}
        onCopy={() => onCopy('A')}
      />
      <DiffCardColumn
        side="B"
        model={modelB}
        onModelChange={onModelBChange}
        rawValue={outputB}
        onRawChange={onOutputBChange}
        ops={opsB}
        emptyOpType="insert"
        isRunning={isRunning}
        copied={copiedSide === 'B'}
        onCopy={() => onCopy('B')}
      />
    </div>
  );
}
