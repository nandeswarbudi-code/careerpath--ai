import { useState } from 'react';
import type { AnswerRecord } from '../../lib/interviewEngine';
import { DIMENSION_META, summarize } from '../../lib/interviewEngine';
import type { FormatId, InterviewRole } from '../../data/interviewRoles';
import { FORMATS } from '../../data/interviewRoles';

interface Props {
  role: InterviewRole;
  format: FormatId;
  records: AnswerRecord[];
  onRetry: () => void;
  onDone: () => void;
}

function barColor(v: number): string {
  return v >= 70 ? 'bg-emerald-500' : v >= 45 ? 'bg-amber-400' : 'bg-rose-400';
}

export default function InterviewReport({ role, format, records, onRetry, onDone }: Props) {
  const summary = summarize(records);
  const formatMeta = FORMATS.find((f) => f.id === format);
  const [open, setOpen] = useState<number | null>(0);

  const verdict =
    summary.overall >= 75
      ? { emoji: '🏆', label: 'Interview-ready performance', color: 'text-emerald-600' }
      : summary.overall >= 50
      ? { emoji: '📈', label: 'Promising — focused practice needed', color: 'text-amber-600' }
      : { emoji: '📚', label: 'Early stage — build fundamentals first', color: 'text-rose-500' };

  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Interview Report</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          {formatMeta?.icon} {formatMeta?.name} · {role.title}
        </h1>
        <p className="mt-2 text-slate-500">
          Every score below is computed from your actual answers. Unmeasurable dimensions are marked honestly — never estimated.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="text-4xl font-extrabold text-indigo-600">{summary.overall}</div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Overall / 100</div>
          <div className={`mt-1 text-sm font-bold ${verdict.color}`}>{verdict.emoji} {verdict.label}</div>
        </div>
        <StatCard value={`${summary.answered}/${summary.totalQuestions}`} label="Questions answered" />
        <StatCard value={String(summary.voiceAnswers)} label="Voice answers (delivery measured)" />
        <StatCard value={String(summary.skipped)} label="Skipped (scored 0 — honestly)" />
      </div>

      {/* Dimensions */}
      <section aria-labelledby="dims" className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 id="dims" className="text-lg font-bold text-slate-900">Six-dimension breakdown</h2>
        <div className="mt-4 grid gap-x-8 gap-y-5 lg:grid-cols-2">
          {summary.dimensionAverages.map((d) => {
            const meta = DIMENSION_META.find((m) => m.key === d.key);
            return (
              <div key={d.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800">{d.icon} {d.label}</span>
                  {d.value === null ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">Not measured</span>
                  ) : (
                    <span className="font-extrabold text-slate-900">
                      {d.value}
                      <span className="ml-1 text-[10px] font-semibold text-slate-400">({d.measuredCount} answer{d.measuredCount !== 1 ? 's' : ''})</span>
                    </span>
                  )}
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  {d.value !== null ? (
                    <div className={`h-full rounded-full transition-all duration-700 ${barColor(d.value)}`} style={{ width: `${d.value}%` }} />
                  ) : (
                    <div className="h-full w-full bg-[repeating-linear-gradient(45deg,#e2e8f0_0px,#e2e8f0_6px,#f8fafc_6px,#f8fafc_12px)]" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {d.value === null && d.key === 'delivery'
                    ? 'Vocal delivery requires spoken answers via microphone. We never fabricate this score for typed answers.'
                    : meta?.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-answer breakdown */}
      <section aria-labelledby="answers" className="mt-8">
        <h2 id="answers" className="mb-3 text-lg font-bold text-slate-900">Per-answer analysis</h2>
        <div className="space-y-3">
          {records.map((r, i) => {
            const isOpen = open === i;
            const measured = Object.values(r.scores).filter((v): v is number => v !== null);
            const avg = measured.length ? Math.round(measured.reduce((a, b) => a + b, 0) / measured.length) : 0;
            return (
              <div key={r.question.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white ${avg >= 70 ? 'bg-emerald-500' : avg >= 45 ? 'bg-amber-400' : 'bg-rose-400'}`}>
                    {avg}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-slate-800 line-clamp-2">
                      Q{i + 1}{r.question.isFollowUp && <span className="ml-1 rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-700">ADAPTIVE FOLLOW-UP</span>} · {r.question.text}
                    </span>
                    <span className="text-xs text-slate-400">
                      {r.mode === 'voice' ? `🎙️ spoken · ${r.durationSec}s · ${r.fillerCount} fillers` : r.mode === 'typed' ? '⌨️ typed' : '⏭️ skipped'}
                    </span>
                  </span>
                  <span aria-hidden="true" className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-5">
                    {r.answerText && (
                      <blockquote className="rounded-xl bg-slate-50 p-3 text-sm italic text-slate-600">“{r.answerText.length > 400 ? r.answerText.slice(0, 400) + '…' : r.answerText}”</blockquote>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {DIMENSION_META.map((m) => {
                        const v = r.scores[m.key];
                        return (
                          <div key={m.key} className="rounded-xl bg-slate-50 p-3">
                            <div className="text-[11px] font-bold text-slate-500">{m.icon} {m.label}</div>
                            {v === null ? (
                              <div className="mt-1 text-xs font-bold text-slate-400">— Not measured</div>
                            ) : (
                              <>
                                <div className="mt-1 text-lg font-extrabold text-slate-800">{v}</div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                  <div className={`h-full rounded-full ${barColor(v)}`} style={{ width: `${v}%` }} />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {r.measuredNote && (
                      <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">ℹ️ {r.measuredNote}</p>
                    )}
                    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                      <div className="text-xs font-bold text-indigo-800">🤖 Coach feedback</div>
                      <ul className="mt-1 space-y-1 text-xs text-indigo-700">
                        {r.feedback.map((f, j) => (
                          <li key={j} className="flex gap-1.5"><span aria-hidden="true">•</span>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap justify-end gap-4">
        <button
          onClick={onRetry}
          className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          ↺ New Interview
        </button>
        <button
          onClick={onDone}
          className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div className="text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
