import type { InterviewRole } from '../../data/interviewRoles';
import type { FinalFeedbackResponse, LiveInterviewMessage } from '../../types';

interface Props {
  role: InterviewRole;
  mode: 'video' | 'voice';
  messages: LiveInterviewMessage[];
  feedback: FinalFeedbackResponse | null;
  onRetry: () => void;
  onDone: () => void;
}

export default function LiveInterviewReport({ role, mode, messages, feedback, onRetry, onDone }: Props) {
  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          {mode === 'video' ? '🎥 Live AI Video Interview Report' : '🎙️ Live AI Voice Interview Report'}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">{role.title} — Interview Complete</h1>
        <p className="mt-2 text-slate-500">
          Below is the full transcript and the AI-generated feedback with ratings.
        </p>
      </div>

      {feedback ? (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Overall', value: feedback.overallScore, color: 'bg-indigo-500' },
              { label: 'Communication', value: feedback.communication, color: 'bg-emerald-500' },
              { label: 'Technical', value: feedback.technicalKnowledge, color: 'bg-blue-500' },
              { label: 'Confidence', value: feedback.confidence, color: 'bg-violet-500' },
              { label: 'Problem-Solving', value: feedback.problemSolving, color: 'bg-amber-500' },
            ].map((d) => (
              <div key={d.label} className="rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-2xl font-extrabold text-slate-900">{d.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{d.label}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-800">{feedback.summary}</p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-bold text-emerald-700">💪 Strengths</h3>
              <ul className="mt-2 space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700"><span>✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-rose-700">🎯 Weaknesses</h3>
              <ul className="mt-2 space-y-1">
                {feedback.weaknesses.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700"><span>•</span>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-indigo-700">📈 Suggested Improvements</h3>
            <ul className="mt-2 space-y-1">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700"><span>→</span>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No feedback was generated. The session may have ended early or the AI service was unavailable.</p>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-slate-900">📝 Interview Transcript</h3>
        <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'interviewer'
                    ? 'rounded-tl-none bg-indigo-100 text-indigo-900'
                    : 'rounded-tr-none bg-emerald-100 text-emerald-900'
                }`}
              >
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide opacity-70">
                  {m.role === 'interviewer' ? 'Interviewer' : 'You'}
                </span>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onRetry}
          className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          ↺ Practice Again
        </button>
        <button
          onClick={onDone}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 hover:bg-indigo-700"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
