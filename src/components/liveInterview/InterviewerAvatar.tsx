import { useEffect, useRef, useState } from 'react';

interface GabrielAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  variant?: 'gabriel' | 'maya';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const scaleMap = { sm: 0.6, md: 0.8, lg: 1, xl: 1.25 } as const;

export function GabrielAvatar({
  isSpeaking = false,
  isListening = false,
  variant = 'gabriel',
  size = 'lg',
  className = '',
}: GabrielAvatarProps) {
  const [mouthHeight, setMouthHeight] = useState(4);
  const [mouthWidth, setMouthWidth] = useState(44);
  const [isBlinking, setIsBlinking] = useState(false);
  const frameRef = useRef<number | null>(null);
  const scale = scaleMap[size];

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let closeTimeout: ReturnType<typeof setTimeout>;

    const blink = () => {
      setIsBlinking(true);
      closeTimeout = setTimeout(() => {
        setIsBlinking(false);
        blinkTimeout = setTimeout(blink, 3000 + Math.random() * 2000);
      }, 150);
    };

    blinkTimeout = setTimeout(blink, 3500);
    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(closeTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthHeight(4);
      setMouthWidth(44);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      return;
    }

    const start = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - start) / 1000;
      const wave = Math.sin(elapsed * 10) * 0.45
        + Math.sin(elapsed * 22) * 0.35
        + Math.sin(elapsed * 4) * 0.2;
      const normalized = Math.max(0.1, (wave + 1) / 2);
      setMouthHeight(Math.round(4 + normalized * 24));
      setMouthWidth(Math.round(40 + normalized * 18));
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [isSpeaking]);

  const idleAccent = variant === 'maya' ? '#c084fc' : '#00f0ff';
  const accent = isSpeaking ? '#38bdf8' : isListening ? '#34d399' : idleAccent;
  const stateLabel = isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready';
  const interviewerName = variant === 'maya' ? 'Maya' : 'Gabriel';

  return (
    <div
      className={`relative flex select-none flex-col items-center justify-center ${className}`}
      style={{ width: 320 * scale, height: 340 * scale, transform: `scale(${scale})` }}
    >
      <style>{`
        @keyframes gabriel-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        @keyframes gabriel-speak { 0%, 100% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-2px) rotate(.8deg); } 75% { transform: translateY(1px) rotate(-.8deg); } }
        @keyframes gabriel-listen { 0%, 100% { transform: rotate(0); } 30% { transform: rotate(2.8deg) translateY(-1px); } 70% { transform: rotate(-2.2deg) translateY(1px); } }
        @keyframes gabriel-pulse { 0%, 100% { box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; opacity: .85; } 50% { box-shadow: 0 0 18px currentColor, 0 0 32px currentColor; opacity: 1; } }
        @keyframes gabriel-gaze { 0%, 100% { transform: translateX(0); } 40% { transform: translateX(2px); } 80% { transform: translateX(-2px); } }
        .gabriel-idle { animation: gabriel-breathe 4s ease-in-out infinite; }
        .gabriel-speaking { animation: gabriel-speak 1.8s ease-in-out infinite; }
        .gabriel-listening { animation: gabriel-listen 4.5s ease-in-out infinite; }
      `}</style>

      <div className={`relative flex flex-col items-center ${
        isSpeaking ? 'gabriel-speaking' : isListening ? 'gabriel-listening' : 'gabriel-idle'
      }`}>
        <div className="-mb-1 flex flex-col items-center">
          <div className="h-3.5 w-3.5 rounded-full" style={{ color: accent, backgroundColor: accent, animation: 'gabriel-pulse 2s infinite ease-in-out' }} />
          <div className="h-6 w-1.5 rounded-t bg-gradient-to-b from-slate-400 to-slate-600" />
        </div>

        <div className="relative flex items-center">
          <div className={`h-14 w-3 rounded-l-md border-y border-l shadow-md ${variant === 'maya' ? 'border-fuchsia-400/40 bg-gradient-to-r from-purple-700 to-slate-800' : 'border-cyan-500/30 bg-gradient-to-r from-slate-700 to-slate-800'}`} />
          <div
            className={`relative flex h-48 w-56 flex-col items-center justify-between border p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${variant === 'maya' ? 'rounded-[44px] border-purple-500/40 bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950' : 'rounded-[36px] border-slate-700/60 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950'}`}
            style={{ boxShadow: `0 10px 35px -5px ${accent}4d, 0 0 15px ${accent}26` }}
          >
            <div className="mt-0.5 flex items-center gap-1.5 opacity-70">
              <span className={`h-1.5 w-1.5 rounded-full ${variant === 'maya' ? 'bg-fuchsia-400' : 'bg-cyan-400'}`} />
              <span className="h-1 w-12 overflow-hidden rounded bg-slate-700">
                <span className={`block h-full transition-all duration-300 ${variant === 'maya' ? 'bg-fuchsia-400' : 'bg-cyan-400'}`} style={{ width: isSpeaking ? '100%' : isListening ? '65%' : '20%' }} />
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${variant === 'maya' ? 'bg-fuchsia-400' : 'bg-cyan-400'}`} />
            </div>

            <div className="flex h-20 w-44 items-center justify-around rounded-2xl border border-slate-800/80 bg-slate-950/90 px-4 shadow-inner">
              {[0, 1].map((eye) => (
                <div key={eye} className="relative flex h-11 w-11 items-center justify-center" style={{ transform: isBlinking ? 'scaleY(.1)' : 'scaleY(1)', transition: 'transform 150ms ease-in-out' }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300" style={{ backgroundColor: accent, boxShadow: `0 0 16px ${accent}`, animation: isListening ? 'gabriel-gaze 4s ease-in-out infinite' : undefined }}>
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-950/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-white opacity-90" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex h-10 w-28 items-center justify-center">
              <div className="rounded-full transition-all duration-75 ease-out" style={{ width: mouthWidth, height: mouthHeight, backgroundColor: isSpeaking ? '#38bdf8' : '#64748b', boxShadow: isSpeaking ? '0 0 12px rgba(56,189,248,.8), inset 0 0 4px #fff' : undefined }} />
            </div>
          </div>
          <div className={`h-14 w-3 rounded-r-md border-y border-r shadow-md ${variant === 'maya' ? 'border-fuchsia-400/40 bg-gradient-to-l from-purple-700 to-slate-800' : 'border-cyan-500/30 bg-gradient-to-l from-slate-700 to-slate-800'}`} />
        </div>
        <div className="flex h-3 w-16 justify-center gap-1 rounded-b-md border-x border-b border-slate-700/80 bg-slate-800 py-0.5">
          <div className="h-full w-1 rounded bg-slate-900" /><div className="h-full w-1 rounded bg-slate-900" /><div className="h-full w-1 rounded bg-slate-900" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/80 px-3 py-1 shadow-sm">
        <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'animate-ping bg-sky-400' : isListening ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`} />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-300">{interviewerName} · {stateLabel}</span>
      </div>
    </div>
  );
}

interface VoiceAvatarProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
}

export function VoiceAvatar({
  isSpeaking = false,
  isListening = false,
  className = '',
}: VoiceAvatarProps) {
  const accent = isSpeaking ? 'text-sky-400' : isListening ? 'text-emerald-400' : 'text-violet-400';
  const stateLabel = isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready';

  return (
    <div className={`flex min-h-[340px] flex-col items-center justify-center ${className}`}>
      <div className={`flex h-32 w-32 items-center justify-center rounded-full border-2 border-current bg-slate-950/80 shadow-[0_0_45px_currentColor] transition-all duration-500 ${accent} ${isSpeaking || isListening ? 'scale-105' : 'scale-100'}`}>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
          <span className={`text-5xl transition-transform duration-300 ${isSpeaking || isListening ? 'scale-110' : 'scale-100'}`} aria-hidden="true">🎙</span>
        </div>
      </div>

      <div className="mt-7 flex h-12 items-center gap-1.5" aria-label={`Maya ${stateLabel.toLowerCase()} audio waveform`}>
        {[18, 30, 44, 26, 38, 22, 34, 18, 28].map((height, index) => (
          <span
            key={index}
            className={`w-1.5 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-sky-400' : isListening ? 'bg-emerald-400' : 'bg-violet-400/60'}`}
            style={{ height: isSpeaking || isListening ? height : 8 }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/80 px-3 py-1 shadow-sm">
        <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'bg-sky-400' : isListening ? 'bg-emerald-400' : 'bg-violet-400'}`} />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-300">Maya · {stateLabel}</span>
      </div>
    </div>
  );
}
