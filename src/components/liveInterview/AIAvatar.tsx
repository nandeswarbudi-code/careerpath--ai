import { useEffect, useState, useRef } from 'react';

interface Props {
  isListening: boolean;
  isSpeaking: boolean;
}

/**
 * Alex — Senior AI Interviewer Avatar.
 *
 * THREE distinct states with rich visual feedback:
 *
 * 1. SPEAKING  → speaking image + LED mouth bars + jaw glow + eye glow
 * 2. LISTENING → idle image + nodding + thinking expressions + reaction emojis
 * 3. READY     → idle image + still + subtle breathing
 *
 * When the candidate is answering (isListening=true), Alex shows:
 * - Head nodding animation
 * - Rotating "thinking" expressions (🤔 → 📝 → 💡 → 👍)
 * - A "taking notes" indicator
 * - Eye tracking simulation (slight image shifts)
 * - Green processing scan line
 * - Live reaction signals based on answer duration
 */
export default function AIAvatar({ isListening, isSpeaking }: Props) {
  const [amplitude, setAmplitude] = useState(0);
  const [mouthBars, setMouthBars] = useState<number[]>(Array(16).fill(1));

  // Listening state: expressions, reactions, note-taking
  const [listenSec, setListenSec] = useState(0);
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0, rotate: 0 });
  const [currentReaction, setCurrentReaction] = useState('');
  const [isNodding, setIsNodding] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);

  const frameRef = useRef<number>(0);
  const listenTimerRef = useRef<number>(0);
  const reactionTimerRef = useRef<number>(0);

  // Speaking: 60fps amplitude engine
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const speaking = typeof window !== 'undefined' && window.speechSynthesis?.speaking;
      if (speaking) {
        const t = Date.now() * 0.008;
        const raw = 0.3 + Math.sin(t * 2.3) * 0.18 + Math.sin(t * 5.9) * 0.15
          + Math.sin(t * 9.7) * 0.1 + Math.random() * 0.27;
        const amp = Math.min(1, Math.max(0, raw));
        setAmplitude(amp);
        setMouthBars(Array.from({ length: 16 }, (_, i) =>
          1 + Math.abs(Math.sin(t * 3.2 + i * 0.5)) * amp * 20 + Math.random() * amp * 6
        ));
      } else {
        setAmplitude(0);
        setMouthBars(Array(16).fill(1));
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, []);

  // Listening: head movement, nodding, eye tracking
  useEffect(() => {
    if (!isListening || isSpeaking) {
      setHeadTilt({ x: 0, y: 0, rotate: 0 });
      setIsNodding(false);
      return;
    }

    const moveHead = () => {
      const t = Date.now() * 0.001;
      setHeadTilt({
        x: Math.sin(t * 0.7) * 3,
        y: Math.sin(t * 0.5) * 2 + Math.sin(t * 1.3) * 1.5,
        rotate: Math.sin(t * 0.4) * 1.5,
      });
    };

    const headInterval = setInterval(moveHead, 80);

    // Periodic nodding (every 3-6 seconds while listening)
    const scheduleNod = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        setIsNodding(true);
        setTimeout(() => setIsNodding(false), 800);
        listenTimerRef.current = scheduleNod() as unknown as number;
      }, delay);
    };
    listenTimerRef.current = scheduleNod() as unknown as number;

    return () => {
      clearInterval(headInterval);
      clearTimeout(listenTimerRef.current);
    };
  }, [isListening, isSpeaking]);

  // Listening: timer + dynamic reactions
  useEffect(() => {
    if (!isListening || isSpeaking) {
      setListenSec(0);
      setCurrentReaction('');
      setShowNotepad(false);
      return;
    }

    // Count seconds listening
    const secTimer = setInterval(() => {
      setListenSec((s) => s + 1);
    }, 1000);

    // Show notepad after 2 seconds of listening
    const notepadTimer = setTimeout(() => setShowNotepad(true), 2000);

    // Rotate through reaction expressions
    const reactions = [
      { emoji: '🤔', text: 'Analyzing...' },
      { emoji: '📝', text: 'Taking notes...' },
      { emoji: '💡', text: 'Interesting point...' },
      { emoji: '👍', text: 'Good detail...' },
      { emoji: '🧐', text: 'Processing...' },
      { emoji: '✍️', text: 'Noting that...' },
      { emoji: '💭', text: 'Considering...' },
      { emoji: '📊', text: 'Evaluating...' },
    ];

    let reactionIdx = 0;
    const showReaction = () => {
      const r = reactions[reactionIdx % reactions.length];
      setCurrentReaction(`${r.emoji} ${r.text}`);
      reactionIdx++;
      reactionTimerRef.current = window.setTimeout(showReaction, 3000 + Math.random() * 2000);
    };
    reactionTimerRef.current = window.setTimeout(showReaction, 1500);

    return () => {
      clearInterval(secTimer);
      clearTimeout(notepadTimer);
      clearTimeout(reactionTimerRef.current);
    };
  }, [isListening, isSpeaking]);

  const nodTransform = isNodding
    ? 'translateY(4px)'
    : `translateX(${headTilt.x}px) translateY(${headTilt.y}px) rotate(${headTilt.rotate}deg)`;

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Ambient glow */}
      <div className={`absolute -inset-2 rounded-[28px] transition-all duration-700 ${
        isSpeaking
          ? 'bg-gradient-to-br from-cyan-500/25 via-blue-500/20 to-indigo-500/15 blur-2xl'
          : isListening
          ? 'bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/10 blur-xl'
          : 'bg-slate-700/5 blur-lg'
      }`} />

      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#050a15] shadow-2xl shadow-black/60">
        {/* Robot image area */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
          {/* Idle image */}
          <img
            src="/robot-idle.jpg"
            alt="AI Interviewer (idle)"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isSpeaking ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              transform: isListening ? nodTransform : 'none',
              transition: isNodding ? 'transform 0.4s ease' : 'transform 0.3s ease-out',
            }}
          />
          {/* Speaking image */}
          <img
            src="/robot-speaking.jpg"
            alt="AI Interviewer (speaking)"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isSpeaking ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* ═══ SPEAKING OVERLAYS ═══ */}
          {isSpeaking && amplitude > 0 && (
            <>
              <div
                className="absolute pointer-events-none flex items-end justify-center gap-[2px]"
                style={{ left: '50%', bottom: '20%', transform: 'translateX(-50%)', width: '100px', height: '36px' }}
              >
                {mouthBars.map((h, i) => (
                  <div key={i} className="rounded-sm" style={{
                    width: '4px', height: `${h}px`,
                    background: `linear-gradient(to top, rgba(0, 220, 255, ${0.6 + amplitude * 0.4}), rgba(100, 160, 255, ${0.4 + amplitude * 0.3}))`,
                    boxShadow: `0 0 ${2 + amplitude * 8}px rgba(0, 220, 255, ${0.2 + amplitude * 0.5})`,
                    transition: 'height 0.05s linear',
                  }} />
                ))}
              </div>
              <div className="absolute pointer-events-none rounded-full" style={{
                left: '50%', bottom: '16%', transform: 'translateX(-50%)',
                width: `${50 + amplitude * 40}px`, height: `${8 + amplitude * 10}px`,
                background: `radial-gradient(ellipse, rgba(0, 220, 255, ${0.1 + amplitude * 0.18}) 0%, transparent 70%)`,
                filter: `blur(${5 + amplitude * 5}px)`,
              }} />
            </>
          )}

          {/* ═══ LISTENING OVERLAYS — interviewer reactions while candidate speaks ═══ */}
          {isListening && !isSpeaking && (
            <>
              {/* Green scan line */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-x-4 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.4), transparent)',
                    animation: 'avatarScan 2.5s linear infinite',
                  }}
                />
              </div>

              {/* Reaction emoji bubble — floats near the robot's head */}
              {currentReaction && (
                <div
                  className="absolute top-4 left-4 rounded-2xl glass px-3 py-2 text-xs font-bold text-emerald-300 slide-up"
                  key={currentReaction}
                >
                  {currentReaction}
                </div>
              )}

              {/* Notepad indicator — appears after 2s of listening */}
              {showNotepad && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl glass px-3 py-2 fade-in">
                  <span className="text-sm">📋</span>
                  <div>
                    <div className="text-[10px] font-bold text-slate-300">Taking notes</div>
                    <div className="mt-0.5 flex gap-1">
                      {Array.from({ length: Math.min(5, Math.floor(listenSec / 3)) }).map((_, i) => (
                        <div key={i} className="h-[3px] rounded-full bg-emerald-400/50"
                          style={{ width: `${12 + Math.random() * 20}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement meter — grows as candidate speaks longer */}
              <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 fade-in">
                <div className="flex flex-col-reverse gap-[2px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-[3px] rounded-full transition-all duration-500"
                      style={{
                        background: i < Math.min(5, Math.floor(listenSec / 4) + 1)
                          ? `rgba(52, 211, 153, ${0.4 + i * 0.12})`
                          : 'rgba(100, 116, 139, 0.15)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[8px] font-bold text-slate-500 tracking-wider">ENGAGED</span>
              </div>
            </>
          )}

          {/* Status badge */}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider backdrop-blur-sm transition-all duration-300 ${
            isSpeaking
              ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
              : isListening
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-black/50 text-slate-400 border border-white/10'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              isSpeaking ? 'bg-cyan-400 animate-pulse' : isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`} />
            {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : 'READY'}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#060a14] border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all duration-300 ${
              isSpeaking ? 'bg-cyan-500/15 shadow-lg shadow-cyan-500/10'
              : isListening ? 'bg-emerald-500/10'
              : 'bg-slate-800/80'
            }`}>
              🤖
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-100">
                Alex — Senior AI Interviewer
                {isListening && !isSpeaking && <span className="ml-2 text-[10px] text-emerald-400 font-normal">is listening...</span>}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.12em]">CAREERPATH AI</p>
            </div>
          </div>
          <div className="flex items-end gap-[2px] h-5">
            {[0.3, 0.5, 0.8, 1, 0.8, 0.5, 0.3].map((scale, i) => (
              <div key={i} className="w-[2.5px] rounded-full transition-all duration-100" style={{
                height: isSpeaking ? `${3 + amplitude * scale * 14}px`
                  : isListening ? `${3 + Math.abs(Math.sin(Date.now() * 0.003 + i)) * 4}px`
                  : '3px',
                background: isSpeaking ? `rgba(0, 220, 255, ${0.4 + amplitude * 0.6})`
                  : isListening ? 'rgba(52, 211, 153, 0.35)'
                  : 'rgba(100, 116, 139, 0.2)',
              }} />
            ))}
          </div>
        </div>

        {/* Waveform */}
        <div className="flex h-6 items-end gap-[1px] px-3 pb-1.5 bg-[#060a14]">
          {Array.from({ length: 40 }).map((_, i) => {
            const h = isSpeaking
              ? Math.abs(Math.sin((Date.now() * 0.005) + i * 0.32)) * amplitude * 16 + 1
              : isListening
              ? Math.abs(Math.sin(i * 0.5 + Date.now() * 0.002)) * 4 + 1
              : 1;
            return (
              <div key={i} className="flex-1 rounded-full" style={{
                height: `${h}px`,
                background: isSpeaking ? `rgba(0, 220, 255, ${0.25 + amplitude * 0.75})`
                  : isListening ? 'rgba(52, 211, 153, 0.2)'
                  : 'rgba(51, 65, 85, 0.12)',
                transition: 'height 0.07s linear',
              }} />
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes avatarScan {
          0% { top: 8%; }
          50% { top: 88%; }
          100% { top: 8%; }
        }
      `}</style>
    </div>
  );
}
