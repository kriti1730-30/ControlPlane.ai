import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Mic, Square } from 'lucide-react';
import {
  COLORS,
  FONTS,
  FONT_SIZE,
  ICON,
  LETTER_SPACING,
  LINE_HEIGHT,
  SPACE,
} from '../../../constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useAudioRecording } from '../../inference/hooks/useAudioRecording';
import { useMicLevels } from '../../inference/hooks/useMicLevels';
import RoundRunButton from './RoundRunButton';

type Props = {
  value: string;
  onChange: (v: string) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
};

/**
 * Bottom prompt panel — multiline textarea with embedded Run / Stop button
 * and an optional voice-input mic. While recording, the SpeechRecognition
 * transcript types directly into the textarea (live interim results) and the
 * footer hint strip is replaced with a slim recording bar.
 * ⌘/Ctrl+Enter runs from the textarea; Esc stops.
 */
export default function PromptPanel({
  value,
  onChange,
  isRunning,
  onRun,
  onStop,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const audio = useAudioRecording();
  const isRecording = audio.recordingState === 'recording';
  const micLevels = useMicLevels(isRecording, 56);
  const canRun = !isRunning && !isRecording && value.trim().length > 0;
  const [duration, setDuration] = useState(0);
  const isMobile = useIsMobile();

  // Pipe live transcript → textarea value so users see words appear as they
  // speak and can edit before running.
  useEffect(() => {
    if (audio.transcript) onChange(audio.transcript);
  }, [audio.transcript, onChange]);

  // Duration ticker — explicit reset on stop so the next recording starts at 00:00.
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

  return (
    <div
      style={{
        flexShrink: 0,
        paddingLeft: isMobile ? SPACE[6] : SPACE[12],
        paddingRight: isMobile ? SPACE[6] : SPACE[12],
        paddingTop: SPACE[6],
        paddingBottom: isMobile ? SPACE[8] : SPACE[10],
        borderTop: `1px solid ${COLORS.border.DEFAULT}`,
        backgroundColor: COLORS.surface,
        // Pin to viewport bottom on mobile so the input stays reachable while
        // the page scrolls through the (potentially long) diff cards.
        ...(isMobile
          ? {
              position: 'sticky',
              bottom: 0,
              zIndex: 5,
            }
          : null),
      }}
    >
      <div
        onClick={() => ref.current?.focus()}
        style={{
          position: 'relative',
          backgroundColor: COLORS.surfaceMuted,
          border: `1px solid ${COLORS.border.DEFAULT}`,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              if (canRun) onRun();
            }
          }}
          placeholder={
            isRecording
              ? 'Listening — your words will appear here…'
              : "What's on your mind?"
          }
          rows={2}
          aria-label="Prompt"
          className="scrollbar-hide"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            paddingLeft: SPACE[8],
            // Reserve room on the right for the mic + run buttons stacked
            // inside the same corner cluster.
            paddingRight: SPACE[20],
            paddingTop: SPACE[5],
            paddingBottom: SPACE[12],
            fontFamily: FONTS.sans,
            fontSize: FONT_SIZE.md,
            lineHeight: LINE_HEIGHT.relaxed,
            color: COLORS.ink[900],
            boxSizing: 'border-box',
          }}
        />

        {/* Bottom strip — either hint copy or, while recording, a slim
            timer + waveform bar. Gradient fade matches the original. */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: SPACE[24],
            display: 'flex',
            alignItems: 'center',
            paddingLeft: SPACE[8],
            paddingRight: SPACE[20],
            background: `linear-gradient(to bottom, transparent, ${COLORS.surfaceMuted} 60%)`,
            pointerEvents: 'none',
          }}
        >
          {isRecording ? (
            <RecordingStrip duration={duration} levels={micLevels} />
          ) : (
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: FONT_SIZE.xs,
                color: COLORS.ink[500],
                pointerEvents: 'auto',
              }}
            >
              ⌘↵ to run · Esc to stop
            </span>
          )}
        </div>

        {/* Single contextual corner button.
            Priority:
              recording → stop dictation
              streaming → stop stream
              has text  → run / send
              idle empty → mic (start dictation) */}
        <div
          style={{
            position: 'absolute',
            bottom: SPACE[4],
            right: SPACE[4],
            pointerEvents: 'auto',
          }}
        >
          {isRecording ? (
            <RoundRunButton
              onClick={() => audio.stopRecording()}
              ariaLabel="Stop dictation"
              title="Stop dictation"
            >
              <Square
                size={16}
                strokeWidth={ICON.strokeWidth}
                aria-hidden
                fill={COLORS.surface}
              />
            </RoundRunButton>
          ) : isRunning ? (
            <RoundRunButton onClick={onStop} ariaLabel="Stop (Esc)" title="Stop (Esc)">
              <Square
                size={16}
                strokeWidth={ICON.strokeWidth}
                aria-hidden
                fill={COLORS.surface}
              />
            </RoundRunButton>
          ) : value.trim().length > 0 ? (
            <RoundRunButton
              onClick={onRun}
              disabled={!canRun}
              ariaLabel="Run comparison (⌘↵)"
              title="Run comparison (⌘↵)"
            >
              <ArrowUp size={18} strokeWidth={2.5} aria-hidden />
            </RoundRunButton>
          ) : (
            <RoundRunButton
              onClick={() => void audio.startRecording()}
              disabled={!audio.isSupported}
              ariaLabel="Dictate prompt"
              title="Dictate prompt"
            >
              <Mic size={18} strokeWidth={2.5} aria-hidden />
            </RoundRunButton>
          )}
        </div>
      </div>
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

/** Slim recording indicator that replaces the keyboard-hint line. */
function RecordingStrip({
  duration,
  levels,
}: {
  duration: number;
  levels: number[];
}) {
  const n = levels.length;
  const trackHeight = 16;
  const half = trackHeight / 2;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: SPACE[3],
        pointerEvents: 'auto',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: COLORS.danger,
          flexShrink: 0,
          animation: 'recordingDot 1.2s ease-in-out infinite',
        }}
      />
      <span
        aria-live="polite"
        style={{
          fontFamily: FONTS.mono,
          fontSize: FONT_SIZE.xs,
          color: COLORS.ink[800],
          letterSpacing: LETTER_SPACING.wide,
          flexShrink: 0,
        }}
      >
        {formatDuration(duration)}
      </span>
      <div
        aria-hidden
        role="presentation"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: trackHeight,
          flex: 1,
          minWidth: 0,
          maskImage:
            'linear-gradient(to right, transparent 0, black 8%, black 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0, black 8%, black 100%)',
        }}
      >
        {levels.map((level, i) => {
          const halfH = Math.max(1, Math.round(level * (half - 1)));
          const isTip = i === n - 1;
          const ageOpacity = 0.4 + (i / Math.max(1, n - 1)) * 0.6;
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
                transition: 'height 60ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

