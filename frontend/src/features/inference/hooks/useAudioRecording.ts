import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

export interface UseAudioRecordingReturn {
  recordingState: RecordingState;
  transcript: string;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  isSupported: boolean;
}

// Minimal Web Speech API surface — the global lib doesn't ship typings yet,
// so we declare just the shape we actually use.
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useAudioRecording(): UseAudioRecordingReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef('');
  // Tracks whether the user explicitly stopped (vs. browser auto-ending on
  // silence). Used to keep recording alive across natural pauses.
  const userStoppedRef = useRef(false);

  const isSupported = getRecognitionCtor() !== null;

  const startRecording = useCallback(async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      setRecordingState('error');
      return;
    }

    try {
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      finalRef.current = '';
      userStoppedRef.current = false;
      setTranscript('');
      setError(null);

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            finalRef.current += text;
          } else {
            interim += text;
          }
        }
        const merged = (finalRef.current + interim).replace(/\s+/g, ' ').trim();
        setTranscript(merged);
      };

      recognition.onerror = (event) => {
        // 'no-speech' and 'aborted' are routine — ignore them so the UI
        // doesn't flash an error every time the user pauses.
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        setError(
          event.error === 'not-allowed'
            ? 'Microphone access denied.'
            : `Speech recognition error: ${event.error}`,
        );
        setRecordingState('error');
      };

      recognition.onend = () => {
        // The browser ends recognition automatically on silence. If the user
        // didn't ask to stop, restart so longer prompts keep transcribing.
        if (!userStoppedRef.current && recognitionRef.current === recognition) {
          try {
            recognition.start();
            return;
          } catch {
            // Fall through to 'done' if restart fails.
          }
        }
        setRecordingState((s) => (s === 'recording' ? 'done' : s));
      };

      recognition.start();
      recognitionRef.current = recognition;
      setRecordingState('recording');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start recording.';
      setError(msg);
      setRecordingState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    userStoppedRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const resetRecording = useCallback(() => {
    userStoppedRef.current = true;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    finalRef.current = '';
    setTranscript('');
    setRecordingState('idle');
    setError(null);
  }, []);

  // Make sure we don't leave a recognizer running if the page unmounts mid-flow.
  useEffect(() => {
    return () => {
      userStoppedRef.current = true;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    recordingState,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
  };
}
