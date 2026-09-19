import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechToText } from '../../lib/speech';
import { speak, stopSpeaking, ttsSupported, warmUpTTS, isTTSSpeaking } from '../../lib/tts';
import { fetchLiveInterviewQuestion, fetchLiveInterviewFeedback } from '../../lib/api';
import type { InterviewRole } from '../../data/interviewRoles';
import type { FinalFeedbackResponse, LiveInterviewMessage, LiveInterviewPhase, VideoBehaviorMetrics } from '../../types';
import { VideoBehaviorAnalyzer } from '../../lib/videoAnalysis';
import AIAvatar from './AIAvatar';

interface Props {
  role: InterviewRole;
  mode: 'video' | 'voice';
  resumeSkills: string[];
  resumeProjects: string;
  onFinish: (messages: LiveInterviewMessage[], feedback: FinalFeedbackResponse | null, videoMetrics: VideoBehaviorMetrics | null) => void;
  onAbort: () => void;
}

const PHASE_LABELS: Record<LiveInterviewPhase, string> = {
  welcome: 'Welcome', behavioral: 'Behavioral', technical: 'Technical',
  project: 'Project', scenario: 'Scenario', problem: 'Problem-Solving', closing: 'Closing',
};

export default function LiveInterviewSession({ role, mode, resumeSkills, resumeProjects, onFinish, onAbort }: Props) {
  const [messages, setMessages] = useState<LiveInterviewMessage[]>([]);
  const [phase, setPhase] = useState<LiveInterviewPhase>('welcome');
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<FinalFeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [started, setStarted] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [answerMode, setAnswerMode] = useState<'voice' | 'type'>('voice');
  const [avatarStyle, setAvatarStyle] = useState<'maya' | 'daniel' | 'nova'>('nova');
  const [cameraConsent, setCameraConsent] = useState(false);
  const [calibrated, setCalibrated] = useState(mode !== 'video');
  const [analysisEnabled, setAnalysisEnabled] = useState(mode === 'video');
  const finishRef = useRef(false);

  // Real-time lip-sync state driven by actual TTS engine
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const avatarTimerRef = useRef<number>(0);

  const speech = useSpeechToText();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const videoAnalyzerRef = useRef<VideoBehaviorAnalyzer | null>(null);
  const [videoMetrics, setVideoMetrics] = useState<VideoBehaviorMetrics | null>(null);

  const attachVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      void element.play().catch(() => undefined);
    }
  }, []);

  // Poll speechSynthesis.speaking at 60fps for real lip-sync
  useEffect(() => {
    const tick = () => {
      setAvatarSpeaking(isTTSSpeaking());
      avatarTimerRef.current = requestAnimationFrame(tick);
    };
    avatarTimerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(avatarTimerRef.current);
  }, []);

  // Camera setup (video mode)
  useEffect(() => {
    if (mode !== 'video' || !cameraConsent) return;
    let cancelled = false;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => undefined);
        }
      })
      .catch(() => setError('Camera access denied. Continuing without self-view.'));
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [mode, cameraConsent]);

  useEffect(() => {
    if (mode !== 'video' || !cameraConsent || !analysisEnabled) return;
    const analyzer = new VideoBehaviorAnalyzer();
    videoAnalyzerRef.current = analyzer;
    let interval = 0;
    let cancelled = false;
    void analyzer.initialize().then(() => {
      if (cancelled) return;
      interval = window.setInterval(() => {
        if (videoRef.current) analyzer.analyze(videoRef.current);
        setVideoMetrics(analyzer.metrics());
      }, 250);
    }).catch(() => setError('Camera is available, but local behavior analysis could not load. The interview will continue without visual scoring.'));
    return () => { cancelled = true; window.clearInterval(interval); analyzer.close(); videoAnalyzerRef.current = null; };
  }, [mode, cameraConsent, analysisEnabled]);

  // Auto-scroll transcript
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Core: ask the AI for the next question
  const askNext = useCallback(
    async (prevMessages: LiveInterviewMessage[], nextPhase: LiveInterviewPhase) => {
      setBusy(true);
      setError(null);
      try {
        const summary = [resumeSkills.join(', '), resumeProjects].filter(Boolean).join(' | ');
        const next = await fetchLiveInterviewQuestion({ roleTitle: role.title, format: mode, resumeSummary: summary || undefined, messages: prevMessages, phase: nextPhase });
        const fullText = [next.transitionalPhrase, next.text].filter(Boolean).join(' ');
        const interviewerMsg: LiveInterviewMessage = { role: 'interviewer', text: fullText };
        const updated = [...prevMessages, interviewerMsg];
        setMessages(updated);
        setPhase(next.phase);
        if (ttsEnabled) await speak(fullText);
        if (next.isFinal && !finishRef.current) {
          finishRef.current = true;
          setFinished(true);
          const fb = await fetchLiveInterviewFeedback(role.title, updated);
          setFeedback(fb);
          onFinish(updated, fb, videoMetrics);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'The interviewer could not respond. Please retry.');
      } finally { setBusy(false); }
    },
    [role.title, mode, resumeSkills, resumeProjects, ttsEnabled, onFinish, videoMetrics],
  );

  // Start interview on user click (unlocks TTS)
  useEffect(() => {
    if (started && messages.length === 0 && !busy) {
      void askNext([], 'welcome');
    }
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = () => {
    warmUpTTS();
    setStarted(true);
  };

  // Get current answer text from either voice or typed input
  const getCurrentAnswer = (): string => {
    return answerMode === 'voice' ? speech.transcript.trim() : typedAnswer.trim();
  };

  // Submit the candidate's answer and ask the next question
  const submitAnswer = async () => {
    const text = getCurrentAnswer();
    if (!text || busy) return;

    stopSpeaking(); // Stop any ongoing TTS
    const candidateMsg: LiveInterviewMessage = { role: 'candidate', text };
    const updated = [...messages, candidateMsg];
    setMessages(updated);

    // Reset inputs
    speech.stop();
    speech.reset();
    setTypedAnswer('');

    // Advance phase
    const phaseOrder: LiveInterviewPhase[] = ['welcome', 'behavioral', 'technical', 'project', 'scenario', 'problem'];
    const currentIdx = phaseOrder.indexOf(phase);
    const nextPhase = currentIdx >= 0 && currentIdx < phaseOrder.length - 1 ? phaseOrder[currentIdx + 1] : 'closing';
    await askNext(updated, nextPhase);
  };

  // Skip the current question
  const skipQuestion = async () => {
    if (busy) return;
    stopSpeaking();
    speech.stop();
    speech.reset();
    setTypedAnswer('');

    const candidateMsg: LiveInterviewMessage = { role: 'candidate', text: '(Skipped)' };
    const updated = [...messages, candidateMsg];
    setMessages(updated);

    const phaseOrder: LiveInterviewPhase[] = ['welcome', 'behavioral', 'technical', 'project', 'scenario', 'problem'];
    const currentIdx = phaseOrder.indexOf(phase);
    const nextPhase = currentIdx >= 0 && currentIdx < phaseOrder.length - 1 ? phaseOrder[currentIdx + 1] : 'closing';
    await askNext(updated, nextPhase);
  };

  // End the interview early with feedback
  const endEarly = async () => {
    if (finishRef.current || busy) return;
    finishRef.current = true;
    stopSpeaking();
    speech.stop();
    setFinished(true);
    try {
      const fb = await fetchLiveInterviewFeedback(role.title, messages);
      setFeedback(fb);
      onFinish(messages, fb, videoMetrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not finish the interview.');
      finishRef.current = false;
      setFinished(false);
    }
  };

  // Repeat the last interviewer question
  const repeatLastQuestion = () => {
    const last = [...messages].reverse().find((m) => m.role === 'interviewer');
    if (last) speak(last.text);
  };

  // Toggle microphone
  const toggleMic = () => {
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start();
    }
  };

  const currentAnswer = getCurrentAnswer();
  const wordCount = currentAnswer ? currentAnswer.split(/\s+/).length : 0;

  // ─── PRE-START SCREEN ─────────────────────────────────
  if (!started) {
    if (mode === 'video' && !cameraConsent) {
      return (
        <div className="mx-auto max-w-lg text-center page-enter">
          <AIAvatar isListening={false} isSpeaking={false} style={avatarStyle} />
          <h2 className="mt-6 text-2xl font-extrabold font-display text-slate-100">Before your video interview</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">Your camera is used only on this device for the self-view and optional behavior signals. No video is recorded, uploaded, or used to analyze identity, age, race, attractiveness, or emotion.</p>
          <p className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-200">🔒 Free forever · Your mic audio and camera never leave this device — only text answers are sent for AI analysis.</p>
          <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-200">
            <input type="checkbox" checked={cameraConsent} onChange={(e) => setCameraConsent(e.target.checked)} className="mt-1" />
            <span>I consent to local camera use for this interview.</span>
          </label>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {([
              ['maya', 'Maya Chen', 'Behavioral'],
              ['daniel', 'Daniel Brooks', 'Technical'],
              ['nova', 'Nova AI', 'Systems'],
            ] as const).map(([id, name, specialty]) => (
              <button key={id} onClick={() => setAvatarStyle(id)} className={`rounded-xl px-2 py-2 text-xs font-bold transition ${avatarStyle === id ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'}`}>
                <span className="block">{name}</span>
                <span className="mt-0.5 block text-[10px] font-medium opacity-70">{specialty}</span>
              </button>
            ))}
          </div>
          <button onClick={handleStart} disabled={!cameraConsent} className="btn-primary mt-8 !px-10 !py-4 text-base disabled:cursor-not-allowed disabled:opacity-40">Continue to camera setup</button>
          <button onClick={onAbort} className="mt-3 block mx-auto text-sm font-semibold text-slate-500 hover:text-slate-300 transition">← Go back</button>
        </div>
      );
    }
    if (mode === 'video' && !calibrated) {
      return (
        <div className="mx-auto max-w-lg text-center page-enter">
          <h2 className="text-2xl font-extrabold font-display text-slate-100">Camera setup</h2>
          <p className="mt-3 text-sm text-slate-400">Center your face, keep your shoulders visible, and use even lighting. This calibrates framing only.</p>
          <video ref={attachVideo} autoPlay muted playsInline className="mt-6 aspect-video w-full rounded-3xl border border-emerald-400/40 bg-slate-900 object-cover" aria-label="Camera calibration preview" />
          <button onClick={() => setCalibrated(true)} className="btn-primary mt-6 !px-10 !py-4">Camera looks good — continue</button>
          <button onClick={onAbort} className="mt-3 block mx-auto text-sm font-semibold text-slate-500 hover:text-slate-300 transition">← Go back</button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-lg text-center page-enter">
        <AIAvatar isListening={false} isSpeaking={false} style={avatarStyle} />
        <h2 className="mt-6 text-2xl font-extrabold font-display text-slate-100">
          {mode === 'video' ? '🎥' : '🎙️'} {role.title} Interview
        </h2>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          Your AI interviewer will ask role-specific questions, speak them aloud,
          and adapt based on your answers. Use your microphone or type to respond.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="badge badge-blue">Behavioral</span>
          <span className="badge badge-violet">Technical</span>
          <span className="badge badge-green">Projects</span>
          <span className="badge badge-amber">Problem-Solving</span>
        </div>
        <button onClick={handleStart} className="btn-primary mt-8 !px-10 !py-4 text-base">
          <span>🎤 Start Interview</span>
        </button>
        <button onClick={onAbort} className="mt-3 block mx-auto text-sm font-semibold text-slate-500 hover:text-slate-300 transition">
          ← Go back
        </button>
      </div>
    );
  }

  // ─── FINISHED SCREEN ──────────────────────────────────
  if (finished) {
    return (
      <div className="mx-auto max-w-3xl page-enter">
        <FeedbackCard feedback={feedback} roleTitle={role.title} />
        <div className="mt-6 flex justify-end">
          <button onClick={onAbort} className="btn-primary"><span>Continue →</span></button>
        </div>
      </div>
    );
  }

  // ─── MAIN INTERVIEW UI ────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl page-enter">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-blue-400">
            {mode === 'video' ? '🎥 Live AI Video Interview' : '🎙️ Live AI Voice Interview'}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 font-display">{role.title} Interview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-blue">{PHASE_LABELS[phase]}</span>
          <button onClick={endEarly} disabled={busy} className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50">
            End Early
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl badge-amber p-4 text-sm font-medium">⚠️ {error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Avatar + Camera + Controls */}
        <div className="space-y-4">
          {mode === 'video' ? (
            <div className="space-y-4">
              <AIAvatar isListening={speech.listening} isSpeaking={avatarSpeaking} style={avatarStyle} />
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
                <video ref={attachVideo} autoPlay muted playsInline className="aspect-video w-full object-cover" />
                <p className="bg-slate-950 px-3 py-2 text-[11px] text-slate-500">You — local only, not recorded.</p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
                {!analysisEnabled ? 'Visual behavior analysis is off · Camera remains local and is not recorded.' : videoMetrics?.status === 'measured'
                  ? `Local behavior analysis active · Face visible ${videoMetrics.faceVisiblePercent}% · Framing ${videoMetrics.centeredPercent}%`
                  : 'Loading local behavior analysis… Camera data stays on this device.'}
              </div>
            </div>
          ) : (
            <div className="premium-card rounded-3xl p-8 text-center">
              <AIAvatar isListening={speech.listening} isSpeaking={avatarSpeaking} style={avatarStyle} />
              <p className="mt-4 text-sm text-slate-500">Voice-only mode. Speak or type your answers.</p>
            </div>
          )}

          {/* Controls */}
          <div className="premium-card rounded-3xl p-5">
            <h3 className="text-sm font-bold text-slate-200">Controls</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {ttsSupported() && (
                <button
                  onClick={() => setTtsEnabled((v) => !v)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    ttsEnabled ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {ttsEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
                </button>
              )}
              <button onClick={() => setShowTranscript((v) => !v)} className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/10">
                {showTranscript ? '📝 Hide transcript' : '📝 Show transcript'}
              </button>
              <button onClick={repeatLastQuestion} disabled={busy || messages.length === 0} className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/10 disabled:opacity-30">
                🔁 Repeat question
              </button>
              <button onClick={skipQuestion} disabled={busy} className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-30">
                ⏭️ Skip question
              </button>
              {mode === 'video' && (
                <button
                  onClick={() => setAnalysisEnabled((enabled) => !enabled)}
                  className="rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/10"
                  aria-pressed={analysisEnabled}
                >
                  {analysisEnabled ? '📹 Analysis ON' : '📹 Analysis OFF'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Transcript + Answer input */}
        <div className="flex flex-col glass rounded-3xl p-5">
          {/* Transcript */}
          {showTranscript && (
            <div className="mb-4 max-h-72 flex-1 space-y-3 overflow-y-auto rounded-2xl bg-black/20 p-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-slate-600 italic">Interview will begin shortly…</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] text-sm ${
                    m.role === 'interviewer' ? 'chat-bubble-interviewer' : 'chat-bubble-candidate'
                  }`}>
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {m.role === 'interviewer' ? '👔 Interviewer' : '🎤 You'}
                    </span>
                    <span className={m.role === 'interviewer' ? 'font-semibold text-white' : 'text-slate-200'}>{m.text}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Thinking indicator */}
          {busy && (
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-800 border-t-blue-400" />
              Interviewer is {avatarSpeaking ? 'speaking…' : 'thinking…'}
            </div>
          )}

          {/* Answer mode toggle */}
          <div className="mb-3 flex gap-1 rounded-xl glass-light p-1">
            <button
              onClick={() => setAnswerMode('voice')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                answerMode === 'voice' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              🎙️ Voice Answer
            </button>
            <button
              onClick={() => setAnswerMode('type')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                answerMode === 'type' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              ⌨️ Type Answer
            </button>
          </div>

          {/* Answer input area */}
          <div className="rounded-2xl glass-light p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-500">
                {answerMode === 'voice'
                  ? speech.listening ? `🎙️ Listening… ${speech.elapsedSec}s` : 'TAP MIC TO ANSWER'
                  : 'TYPE YOUR ANSWER'}
              </span>
              <span className="text-xs text-slate-500">{wordCount} words</span>
            </div>

            {answerMode === 'voice' ? (
              <div className="min-h-[4rem] rounded-xl bg-black/30 px-3 py-2 text-sm text-slate-300">
                {speech.transcript || speech.interim ? (
                  <>
                    {speech.transcript}
                    {speech.interim && <span className="text-slate-500"> {speech.interim}</span>}
                  </>
                ) : (
                  <span className="italic text-slate-600">
                    {speech.listening ? 'Speak now… your words appear here in real time' : 'Click "Start Answering" then speak'}
                  </span>
                )}
              </div>
            ) : (
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here…"
                rows={4}
                className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-slate-300 outline-none resize-none placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/30"
              />
            )}

            {speech.error && <p className="mt-2 text-xs text-rose-400">⚠️ {speech.error}</p>}

            <div className="mt-3 flex gap-2">
              {answerMode === 'voice' && (
                <button
                  onClick={toggleMic}
                  disabled={busy}
                  className={`flex-1 rounded-full py-3 text-sm font-bold text-white transition ${
                    speech.listening ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {speech.listening ? '⏹ Stop Recording' : '🎙️ Start Answering'}
                </button>
              )}
              <button
                onClick={() => void submitAnswer()}
                disabled={!currentAnswer || busy}
                className="btn-primary flex-1 !py-3 text-sm disabled:opacity-40"
              >
                <span>Submit Answer →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEEDBACK CARD ────────────────────────────────────────

function FeedbackCard({ feedback, roleTitle }: { feedback: FinalFeedbackResponse | null; roleTitle: string }) {
  if (!feedback) {
    return (
      <div className="premium-card rounded-3xl p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-800 border-t-blue-400" />
        <p className="mt-4 text-slate-400">Generating your detailed interview feedback…</p>
      </div>
    );
  }

  const dims = [
    { label: 'Overall', value: feedback.overallScore, color: 'bg-blue-500' },
    { label: 'Communication', value: feedback.communication, color: 'bg-emerald-500' },
    { label: 'Technical', value: feedback.technicalKnowledge, color: 'bg-cyan-500' },
    { label: 'Confidence', value: feedback.confidence, color: 'bg-violet-500' },
    { label: 'Problem-Solving', value: feedback.problemSolving, color: 'bg-amber-500' },
  ];

  return (
    <div className="premium-card rounded-3xl p-8">
      <div className="text-center">
        <div className="text-5xl font-extrabold text-gradient font-display">{feedback.overallScore}</div>
        <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">Overall Score / 100</div>
        <h2 className="mt-2 text-xl font-bold text-slate-100 font-display">{roleTitle} Interview Feedback</h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dims.map((d) => (
          <div key={d.label} className="rounded-2xl glass-light p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{d.label}</span>
              <span className="text-lg font-extrabold text-slate-100">{d.value}</span>
            </div>
            <div className="progress-track mt-2">
              <div className={`progress-fill h-full rounded-full ${d.color}`} style={{ width: `${d.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-2xl glass-colored p-4 text-sm text-blue-200">{feedback.summary}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-bold text-emerald-400">💪 Strengths</h3>
          <ul className="mt-2 space-y-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300"><span className="text-emerald-400">✓</span>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-rose-400">⚠️ Areas to Improve</h3>
          <ul className="mt-2 space-y-1.5">
            {feedback.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300"><span className="text-rose-400">•</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold text-blue-400">🎯 Actionable Improvements</h3>
        <ul className="mt-2 space-y-1.5">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300"><span className="text-blue-400">→</span>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
