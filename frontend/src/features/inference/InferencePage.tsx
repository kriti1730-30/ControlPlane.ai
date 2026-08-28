import { useCallback, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import InferenceHeader from './components/InferenceHeader';
import OutputColumn from './components/OutputColumn';
import PromptColumn from './components/PromptColumn';
import SettingsSidebar from './components/SettingsSidebar';
import {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_MAX_TOKENS,
  DEFAULT_MODEL,
  DEFAULT_REASONING_EFFORT,
  DEFAULT_SYSTEM_INSTRUCTIONS,
  DEFAULT_TEMPERATURE,
  ERROR_AT,
  type InputMode,
} from './config';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useStream } from './hooks/useStream';
import { useStreamMetrics } from './hooks/useStreamMetrics';

/**
 * Inference Playground page — orchestrates state and side-effects only. All
 * rendering is delegated to focused child components under ./components.
 */
export default function InferencePage() {
  // -------- state --------
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [prompt, setPrompt] = useState('');
  const [errorDemo, setErrorDemo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [model, setModel] = useState(DEFAULT_MODEL);

  // Chat-settings state — drives the right-hand sidebar. Default closed so
  // the playground itself is the first thing the user sees; the gear button
  // in the header opens it on demand.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextWindow, setContextWindow] = useState<string>(DEFAULT_CONTEXT_WINDOW);
  const [systemInstructions, setSystemInstructions] = useState(
    DEFAULT_SYSTEM_INSTRUCTIONS,
  );
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [reasoningEffort, setReasoningEffort] = useState<string>(
    DEFAULT_REASONING_EFFORT,
  );

  // -------- hooks --------
  const stream = useStream();
  const metrics = useStreamMetrics();
  const audio = useAudioRecording();

  // Wire stream tokens → metrics. Re-wires only when the callback identity
  // changes (which it doesn't, since recordToken is useCallback-stable).
  useEffect(() => {
    stream.setOnToken(metrics.recordToken);
    return () => stream.setOnToken(null);
  }, [stream, metrics.recordToken]);

  // -------- derived --------
  const isStreaming = stream.status === 'streaming';
  const hasOutput = stream.output.length > 0;
  const promptText = inputMode === 'audio' ? audio.transcript : prompt;
  const canRun = !isStreaming && promptText.trim().length > 0;

  // -------- effects --------
  // Live elapsed-time counter while streaming. The 0-reset is an explicit
  // synchronization point: the previous run's timer must clear before the
  // interval fires its first 100ms tick, otherwise the UI flashes stale time.
  useEffect(() => {
    if (!isStreaming) return;
    const start = performance.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on stream start
    setElapsed(0);
    const id = window.setInterval(() => {
      setElapsed((performance.now() - start) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [isStreaming]);

  // Push audio transcript into the prompt buffer so toggling back to text mode
  // preserves what was just dictated and lets the user edit before re-running.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing transcript→prompt is intentional cross-state coupling
    if (audio.transcript) setPrompt(audio.transcript);
  }, [audio.transcript]);

  // -------- handlers --------
  const handleStart = useCallback(async () => {
    if (!promptText.trim()) return;
    metrics.resetMetrics();
    await stream.start(promptText, errorDemo ? ERROR_AT : null);
  }, [promptText, errorDemo, metrics, stream]);

  const handleStop = useCallback(() => stream.stop(), [stream]);

  const handleReset = useCallback(() => {
    stream.reset();
    metrics.resetMetrics();
    setPrompt('');
    audio.resetRecording();
  }, [stream, metrics, audio]);

  const handleCopy = useCallback(() => {
    if (!stream.output) return;
    navigator.clipboard.writeText(stream.output).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }, [stream.output]);

  // Esc anywhere stops a running stream
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isStreaming) handleStop();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isStreaming, handleStop]);

  return (
    <Layout>
      <InferenceHeader
        errorDemo={errorDemo}
        onErrorDemoChange={setErrorDemo}
        settingsOpen={settingsOpen}
        onSettingsToggle={() => setSettingsOpen((o) => !o)}
      />

      <div
        className="flex-col-reverse md:flex-row"
        style={{ display: 'flex', flex: 1, minHeight: 0 }}
      >
        <PromptColumn
          inputMode={inputMode}
          onModeChange={setInputMode}
          prompt={prompt}
          onPromptChange={setPrompt}
          audio={audio}
          isStreaming={isStreaming}
          canRun={canRun}
          onRun={handleStart}
          onStop={handleStop}
          model={model}
          onModelChange={setModel}
        />

        <OutputColumn
          status={stream.status}
          output={stream.output}
          errorMessage={stream.error}
          tokenCount={metrics.tokenCount}
          tokensPerSecond={metrics.tokensPerSecond}
          elapsed={elapsed}
          isStreaming={isStreaming}
          hasOutput={hasOutput}
          copied={copied}
          onCopy={handleCopy}
          onRegenerate={handleStart}
          onReset={handleReset}
          model={model}
        />

        {/* Always-mounted sidebar — width transitions 0 ↔ 340 for smooth
            slide-in / slide-out animations (Sarvam transition-all pattern). */}
        <SettingsSidebar
          isOpen={settingsOpen}
          model={model}
          onModelChange={setModel}
          contextWindow={contextWindow}
          onContextWindowChange={setContextWindow}
          systemInstructions={systemInstructions}
          onSystemInstructionsChange={setSystemInstructions}
          temperature={temperature}
          onTemperatureChange={setTemperature}
          maxTokens={maxTokens}
          onMaxTokensChange={setMaxTokens}
          reasoningEffort={reasoningEffort}
          onReasoningEffortChange={setReasoningEffort}
          onClose={() => setSettingsOpen(false)}
        />
      </div>
    </Layout>
  );
}
