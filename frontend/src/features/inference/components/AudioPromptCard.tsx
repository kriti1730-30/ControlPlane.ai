import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';
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
import type { useAudioRecording } from '../hooks/useAudioRecording';
import { useMicLevels } from '../hooks/useMicLevels';
import RoundActionButton from './RoundActionButton';

type Props = {
  audio: ReturnType<typeof useAudioRecording>;
  transcript: string;
  onTranscriptChange: (v: string) => void;
  disabled: boolean;
  canRun: boolean;
  isStreaming: boolean;
  onRun: () => void;
  onStop: () => void;
};

/**
 * Audio-mode prompt card. Visually identical to the text card so the surface
 * never jumps when the user toggles modes — instead of a separate mic stage,
 * speech is transcribed directly into the same textarea, and the bottom
 * affordance morphs:
 *   - idle / empty       → mic button (start)
 *   - recording          → pill with timer + live waveform + stop
 *   - has transcript     → submit button (same chrome as text mode)
 */
export default function AudioPromptCard({
  audio,
  transcript,
  onTranscriptChange,
  disabled,
  canRun,
  isStreaming,
  onRun,
  onStop,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [duration, setDuration] = useState(0);
  const isRecording = audio.recordingState === 'recording';
  const micLevels = useMicLevels(isRecording, 80);
  const hasTranscript = transcript.trim().length > 0;

  // Duration ticker — explicit reset on stop so the next recording starts at
  // 00:00 instead of flashing the previous take's time for 100ms.
  useEffect(() => {
    if (!isRecording) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on recording stop
      setDuration(0);
      return;
    }
    const start = performance.now();
    const id = window.setInterval(() => {
      setDuration((performance.now() - start) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [isRecording]);

  // ⌘↵ to submit from the textarea
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canRun) onRun();
    }
  }

  function handleStartRecording() {
    void audio.startRecording();
  }

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.surfaceMuted,
        border: `1px solid ${COLORS.border.DEFAULT}`,
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: 0,
      }}
      onClick={() => textareaRef.current?.focus()}
    >
      <textarea
        ref={textareaRef}
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={
          isRecording
            ? 'Listening — your words will appear here…'
            : 'Start speaking to get transcription'
        }
        disabled={disabled}
        aria-label="Prompt (speech-to-text)"
        className="scrollbar-hide"
        style={{
          flex: 1,
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[10],
          paddingTop: SPACE[10],
          paddingBottom: SPACE[24],
          fontFamily: FONTS.sans,
          fontSize: FONT_SIZE.md,
          fontWeight: FONT_WEIGHT.regular,
          lineHeight: 2,
          color: COLORS.ink[900],
          boxSizing: 'border-box',
          minHeight: 0,
        }}
      />

      {/* Char count + gradient mask, mirrors text mode */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: SPACE[24],
          display: 'flex',
          alignItems: 'center',
          paddingLeft: SPACE[10],
          paddingRight: SPACE[20],
          background: `linear-gradient(to bottom, transparent, ${COLORS.surfaceMuted} 60%)`,
          pointerEvents: 'none',
        }}
      >
        {!isRecording && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: FONT_SIZE.xs,
              color: COLORS.ink[500],
              letterSpacing: LETTER_SPACING.wide,
              pointerEvents: 'auto',
            }}
          >
            {transcript.length} chars
          </span>
        )}
      </div>

      {/* Bottom-right affordance — start / submit / stop */}
      {isRecording ? (
        <RecordingBar
          duration={duration}
          levels={micLevels}
          onStop={audio.stopRecording}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            bottom: SPACE[4],
            right: SPACE[4],
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
            pointerEvents: 'auto',
          }}
        >
          {isStreaming ? (
            <RoundActionButton onClick={onStop} ariaLabel="Stop (Esc)" title="Stop (Esc)">
              <Square
                size={16}
                strokeWidth={ICON.strokeWidth}
                aria-hidden
                fill={COLORS.surface}
              />
            </RoundActionButton>
          ) : hasTranscript ? (
            <RoundActionButton
              onClick={onRun}
              disabled={!canRun}
              ariaLabel="Generate (⌘↵)"
              title="Generate (⌘↵)"
            >
              <ArrowUp size={18} strokeWidth={2.5} aria-hidden />
            </RoundActionButton>
          ) : (
            <RoundActionButton
              onClick={handleStartRecording}
              disabled={disabled || !audio.isSupported}
              ariaLabel={
                audio.isSupported
                  ? 'Start recording'
                  : 'Speech recognition not supported'
              }
              title="Start recording"
            >
              <Mic size={18} strokeWidth={2.5} aria-hidden />
            </RoundActionButton>
          )}
        </div>
      )}

      {/* Live status for screen readers — separate from the visible waveform
          so it doesn't disturb sighted users */}
      {!audio.isSupported && (
        <p
          role="status"
          style={{
            position: 'absolute',
            top: SPACE[6],
            left: SPACE[10],
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.xs,
            color: COLORS.danger,
          }}
        >
          Speech recognition not supported in this browser
        </p>
      )}
      {audio.error && audio.recordingState === 'error' && (
        <p
          role="alert"
          style={{
            position: 'absolute',
            top: SPACE[6],
            left: SPACE[10],
            margin: 0,
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.xs,
            color: COLORS.danger,
          }}
        >
          {audio.error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function formatDuration(seconds: number): string {
  const total = Math.floor(seconds);
  const mm = Math.floor(total / 60).toString().padStart(2, '0');
  const ss = (total % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Bottom recording pill: mm:ss · reactive waveform · stop button. */
function RecordingBar({
  duration,
  levels,
  onStop,
}: {
  duration: number;
  levels: number[];
  onStop: () => void;
}) {
  return (
    <div
      role="toolbar"
      aria-label="Recording controls"
      style={{
        position: 'absolute',
        bottom: SPACE[4],
        left: SPACE[4],
        right: SPACE[4],
        display: 'flex',
        alignItems: 'center',
        gap: SPACE[4],
        paddingLeft: SPACE[5],
        paddingRight: SPACE[2],
        paddingTop: SPACE[2],
        paddingBottom: SPACE[2],
        borderRadius: RADIUS.pill,
        backgroundColor: COLORS.cream[100],
        border: `1px solid ${COLORS.border.DEFAULT}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        pointerEvents: 'auto',
      }}
    >
      <span
        aria-live="polite"
        style={{
          fontFamily: FONTS.mono,
          fontSize: FONT_SIZE.sm,
          color: COLORS.ink[800],
          letterSpacing: LETTER_SPACING.wide,
          minWidth: 48,
        }}
      >
        {formatDuration(duration)}
      </span>

      <InlineWaveform levels={levels} />

      <button
        type="button"
        onClick={onStop}
        aria-label="Stop recording"
        title="Stop recording"
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: COLORS.dangerBg,
          color: COLORS.danger,
          cursor: 'pointer',
        }}
        className="hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 active:scale-95"
      >
        <Square
          size={16}
          strokeWidth={2.5}
          aria-hidden
          fill={COLORS.danger}
        />
      </button>
    </div>
  );
}

/**
 * Time-domain scrolling waveform — oldest samples on the left fade out as new
 * ones arrive on the right. Bars are mirrored above and below a center line
 * so the shape reads as a proper audio trace, not a bar chart.
 */
function InlineWaveform({ levels }: { levels: number[] }) {
  const n = levels.length;
  const trackHeight = 28;
  const half = trackHeight / 2;

  return (
    <div
      aria-hidden
      role="presentation"
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        height: trackHeight,
        minWidth: 0,
        maskImage:
          'linear-gradient(to right, transparent 0, black 8%, black 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0, black 8%, black 100%)',
      }}
    >
      {levels.map((level, i) => {
        // Half-height so the bar extends equally above and below center.
        const halfH = Math.max(1, Math.round(level * (half - 1)));
        // Age fade — oldest samples (left) sit at 40% opacity, newest at 100%.
        const ageOpacity = 0.4 + (i / Math.max(1, n - 1)) * 0.6;
        // Newest sample gets the accent colour so the "now" tip is obvious.
        const isTip = i === n - 1;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 2,
              height: halfH * 2,
              borderRadius: 1,
              backgroundColor: isTip ? COLORS.danger : COLORS.ink[700],
              opacity: ageOpacity,
              transition:
                'height 60ms cubic-bezier(0.2, 0.8, 0.2, 1), background-color 120ms',
            }}
          />
        );
      })}
    </div>
  );
}
