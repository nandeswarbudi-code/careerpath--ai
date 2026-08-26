/**
 * Text-to-speech engine — browser speechSynthesis only.
 * Handles Chrome autoplay restrictions and long-utterance cutoff bugs.
 */

let warmedUp = false;
let cachedVoice: SpeechSynthesisVoice | null = null;

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Must be called from a user click handler to unlock Chrome TTS. */
export function warmUpTTS(): void {
  if (!ttsSupported() || warmedUp) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('.');
    u.volume = 0.01;
    u.rate = 10;
    window.speechSynthesis.speak(u);
    warmedUp = true;
    window.speechSynthesis.getVoices();
  } catch { /* ignore */ }
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const tests = [
    (v: SpeechSynthesisVoice) => v.lang === 'en-US' && /google.*us/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && /\b(mark|david|guy|james|daniel)\b/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && /natural|premium|enhanced|neural/i.test(v.name),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];
  for (const test of tests) {
    const m = voices.find(test);
    if (m) { cachedVoice = m; return m; }
  }
  cachedVoice = voices[0] ?? null;
  return cachedVoice;
}

if (ttsSupported()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { cachedVoice = null; pickVoice(); });
}

/** Speak text aloud. Returns promise that resolves when done. */
export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsSupported() || !text.trim()) { resolve(); return; }
    try {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.rate = 0.92; u.pitch = 0.95; u.volume = 1.0; u.lang = 'en-US';
          const voice = pickVoice();
          if (voice) u.voice = voice;
          let keepAlive: ReturnType<typeof setInterval> | null = null;
          const cleanup = () => { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } resolve(); };
          u.onend = cleanup;
          u.onerror = cleanup;
          keepAlive = setInterval(() => {
            if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
            else cleanup();
          }, 10000);
          window.speechSynthesis.speak(u);
          setTimeout(() => {
            if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
              cachedVoice = null;
              const r = new SpeechSynthesisUtterance(text);
              r.rate = 0.92; r.pitch = 0.95; r.volume = 1.0; r.lang = 'en-US';
              const v2 = pickVoice(); if (v2) r.voice = v2;
              r.onend = cleanup; r.onerror = cleanup;
              window.speechSynthesis.speak(r);
            }
          }, 500);
        } catch { resolve(); }
      }, 80);
    } catch { resolve(); }
  });
}

export function stopSpeaking(): void {
  if (!ttsSupported()) return;
  try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
}

export function isTTSSpeaking(): boolean {
  if (!ttsSupported()) return false;
  try { return window.speechSynthesis.speaking; } catch { return false; }
}
