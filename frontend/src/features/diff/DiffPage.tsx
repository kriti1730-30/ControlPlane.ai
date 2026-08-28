import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Layout from '../../components/layout/Layout';
import DiffHeader from './components/DiffHeader';
import PromptPanel from './components/PromptPanel';
import SplitView from './components/SplitView';
import UnifiedView from './components/UnifiedView';
import ViewControls from './components/ViewControls';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  DEFAULT_MODEL_A,
  DEFAULT_MODEL_B,
  MODEL_RESPONSES,
  SAMPLE_OUTPUT_A,
  SAMPLE_OUTPUT_B,
  type ViewMode,
} from './config';
import {
  computeStats,
  diffTokens,
  foldUnchanged,
  tokenize,
  type RenderOp,
} from './lib';
import { streamInto } from './lib/parallelStream';

/**
 * Model Output Diff page — orchestrates state, side-by-side / unified views,
 * and parallel-stream lifecycle. All rendering is delegated to components
 * under ./components.
 */
export default function DiffPage() {
  const isMobile = useIsMobile();

  // -------- state --------
  // Fresh empty state — user lands with no prompt and no outputs, types a
  // prompt, hits Run, and only then sees streaming + diff. Matches the
  // "new chat" feel of the inference page.
  const [prompt, setPrompt] = useState('');
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');
  const [modelA, setModelA] = useState(DEFAULT_MODEL_A);
  const [modelB, setModelB] = useState(DEFAULT_MODEL_B);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [changesOnly, setChangesOnly] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [copiedSide, setCopiedSide] = useState<'A' | 'B' | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Has the user generated anything yet? Drives whether the stats chips and
  // change counter render — otherwise they sit at 0 / 0 and look broken.
  const hasGenerated = outputA.length > 0 || outputB.length > 0 || isRunning;

  // -------- diff computation (live) --------
  const { ops, stats } = useMemo(() => {
    const a = tokenize(outputA);
    const b = tokenize(outputB);
    const o = diffTokens(a, b);
    return { ops: o, stats: computeStats(o) };
  }, [outputA, outputB]);

  const renderOps: RenderOp[] = useMemo(
    () => (changesOnly ? foldUnchanged(ops, 4) : ops),
    [ops, changesOnly],
  );

  const totalChanges = stats.added + stats.removed;
  const totalTokens = totalChanges + stats.unchanged;
  const changePct =
    totalTokens > 0 ? Math.round((totalChanges / totalTokens) * 100) : 0;

  // -------- handlers --------
  const handleRun = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setOutputA('');
    setOutputB('');
    setIsRunning(true);

    const respA = MODEL_RESPONSES[modelA] ?? SAMPLE_OUTPUT_A;
    const respB = MODEL_RESPONSES[modelB] ?? SAMPLE_OUTPUT_B;
    // Note: the user's actual `prompt` string isn't sent to a model — there
    // is no backend. The canned MODEL_RESPONSES are streamed instead so the
    // diff has stable, distinctive fixtures to compare on every run.

    try {
      await Promise.all([
        streamInto(respA, controller.signal, (chunk) => {
          setOutputA((prev) => prev + chunk);
        }),
        streamInto(respB, controller.signal, (chunk) => {
          setOutputB((prev) => prev + chunk);
        }),
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [modelA, modelB]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setOutputA('');
    setOutputB('');
    setPrompt('');
    setChangesOnly(false);
  }, []);

  const handleCopy = useCallback(
    (side: 'A' | 'B') => {
      const text = side === 'A' ? outputA : outputB;
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSide(side);
        window.setTimeout(() => setCopiedSide(null), 1500);
      });
    },
    [outputA, outputB],
  );

  // Esc stops; ⌘/Ctrl+Enter runs from anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isRunning) handleStop();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isRunning) {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, handleStop, handleRun]);

  return (
    <Layout>
      <DiffHeader
        stats={stats}
        onReset={handleReset}
        showStats={hasGenerated}
      />

      <ViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        changesOnly={changesOnly}
        onChangesOnlyChange={setChangesOnly}
        changeCount={totalChanges}
        changePct={changePct}
        isRunning={isRunning}
        hasGenerated={hasGenerated}
      />

      {/* Diff area — desktop: independent inner scroll inside a fixed page
          height. Mobile: defer to the page (Layout) scroll so the user can
          flick through both stacked cards naturally without nested scroll. */}
      <div
        className="scrollbar-hide"
        style={
          isMobile
            ? { flex: 'none' }
            : { flex: 1, overflowY: 'auto', minHeight: 0 }
        }
      >
        {viewMode === 'split' ? (
          <SplitView
            outputA={outputA}
            outputB={outputB}
            onOutputAChange={setOutputA}
            onOutputBChange={setOutputB}
            modelA={modelA}
            modelB={modelB}
            onModelAChange={setModelA}
            onModelBChange={setModelB}
            renderOps={renderOps}
            isRunning={isRunning}
            copiedSide={copiedSide}
            onCopy={handleCopy}
          />
        ) : (
          <UnifiedView
            renderOps={renderOps}
            modelA={modelA}
            modelB={modelB}
            isRunning={isRunning}
          />
        )}
      </div>

      <PromptPanel
        value={prompt}
        onChange={setPrompt}
        isRunning={isRunning}
        onRun={handleRun}
        onStop={handleStop}
      />
    </Layout>
  );
}
