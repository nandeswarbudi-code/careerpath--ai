import { useCallback, useEffect, useRef, useState } from 'react';

/** Minimal typings for the Web Speech API (not in lib.dom for all targets). */
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}
interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechState {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  /** Seconds of active speaking time in the current capture. */
  elapsedSec: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechToText(): SpeechState {
  const [supported] = useState<boolean>(() => getRecognitionCtor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const recRef = useRef<ISpeechRecognition | null>(null);
  const timerRef = useRef<number | null>(null);
  const keepAliveRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    recRef.current?.stop();
    setListening(false);
    clearTimer();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript + ' ';
        else interimText += res[0].transcript;
      }
      if (finalText) setTranscript((prev) => (prev + ' ' + finalText).replace(/\s+/g, ' ').trimStart());
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access denied. Voice answers are unavailable — delivery metrics will not be measured.');
        keepAliveRef.current = false;
        setListening(false);
        clearTimer();
      } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError(`Speech recognition error: ${e.error}`);
      }
    };
    rec.onend = () => {
      // Chrome stops recognition periodically; restart if user hasn't stopped.
      if (keepAliveRef.current) {
        try {
          rec.start();
        } catch {
          setListening(false);
          clearTimer();
        }
      } else {
        setListening(false);
        clearTimer();
      }
    };
    recRef.current = rec;
    keepAliveRef.current = true;
    try {
      rec.start();
      setListening(true);
      clearTimer();
      timerRef.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);
    } catch {
      setError('Could not start speech recognition.');
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setElapsedSec(0);
    setError(null);
  }, []);

  useEffect(
    () => () => {
      keepAliveRef.current = false;
      recRef.current?.abort();
      clearTimer();
    },
    [],
  );

  return { supported, listening, transcript, interim, error, elapsedSec, start, stop, reset };
}

export const FILLER_WORDS = ['um', 'uh', 'umm', 'uhh', 'like', 'you know', 'basically', 'actually', 'i mean', 'sort of', 'kind of', 'hmm'];

export function countFillers(text: string): number {
  const lower = ` ${text.toLowerCase()} `;
  return FILLER_WORDS.reduce((count, f) => {
    const re = new RegExp(`\\b${f.replace(/ /g, '\\s+')}\\b`, 'g');
    return count + (lower.match(re)?.length ?? 0);
  }, 0);
}
