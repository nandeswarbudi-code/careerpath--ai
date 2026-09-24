import { useMemo, useState } from 'react';
import { INDUSTRIES, INTERVIEW_ROLES, type InterviewRole } from '../../data/interviewRoles';
import type { InterviewHistoryEntry } from '../../lib/storage';

interface Props {
  defaultRoleId?: string;
  hasResume: boolean;
  history?: InterviewHistoryEntry[];
  onStartLive: (role: InterviewRole, mode: 'video' | 'voice') => void;
  onBack: () => void;
}

export default function InterviewSetup({ defaultRoleId, hasResume, history, onStartLive, onBack }: Props) {
  const [industry, setIndustry] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState<string | null>(defaultRoleId ?? null);

  const role = INTERVIEW_ROLES.find((r) => r.id === roleId) ?? null;

  const filtered = useMemo(
    () =>
      INTERVIEW_ROLES.filter(
        (r) =>
          (industry === 'All' || r.industry === industry) &&
          (search === '' || r.title.toLowerCase().includes(search.toLowerCase())),
      ),
    [industry, search],
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Step 5 · Interview Prep</div>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Set up your mock interview</h1>
          <p className="mt-2 text-slate-500">
            {INTERVIEW_ROLES.length}+ real-world roles · live AI video or voice interview · speak naturally with adaptive follow-ups.
            <span className="ml-2 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">100% free — forever</span>
          </p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          ← Back
        </button>
      </div>

      {hasResume && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
          <span className="text-xl" aria-hidden="true">📄</span>
          <p><span className="font-bold">Resume detected.</span> The interviewer will ask questions about the skills and projects on your resume.</p>
        </div>
      )}

      {history && history.length > 0 && (
        <section aria-labelledby="past-sessions" className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="past-sessions" className="text-sm font-extrabold text-slate-900">📈 Your recent sessions</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
            {history.slice(0, 6).map((h) => (
              <div key={h.date} className="min-w-44 shrink-0 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-extrabold ${h.overall >= 70 ? 'text-emerald-600' : h.overall >= 45 ? 'text-amber-600' : 'text-rose-500'}`}>{h.overall}</span>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(h.date).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 truncate text-xs font-bold text-slate-700">{h.roleTitle}</div>
                <div className="truncate text-[11px] text-slate-400">{h.formatName}</div>
              </div>
            ))}
          </div>
          {history.length >= 2 && (
            <p className="mt-2 text-xs font-medium text-slate-400" aria-live="polite">
              {history[0].overall > history[1].overall
                ? `📊 Trending up: +${history[0].overall - history[1].overall} points vs your previous session. Keep going!`
                : history[0].overall < history[1].overall
                ? `📊 Last session dipped ${history[1].overall - history[0].overall} points — review the per-answer feedback and retry.`
                : '📊 Consistent scores across your last two sessions.'}
            </p>
          )}
        </section>
      )}

      {/* Step A: role */}
      <section aria-labelledby="pick-role">
        <h2 id="pick-role" className="mb-3 text-lg font-bold text-slate-900">1 · Choose the job role</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 44 roles…"
            aria-label="Search job roles"
            className="w-full max-w-xs rounded-full border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          />
          {['All', ...INDUSTRIES].map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              aria-pressed={industry === ind}
              className={`rounded-full px-4 py-2 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                industry === ind ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3 lg:grid-cols-4" role="listbox" aria-label="Job roles">
          {filtered.map((r) => (
            <button
              key={r.id}
              role="option"
              aria-selected={roleId === r.id}
              onClick={() => setRoleId(r.id)}
              className={`rounded-xl border-2 p-3 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                roleId === r.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <span className="block font-bold text-slate-800">{r.title}</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">{r.industry}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full p-4 text-sm text-slate-400">No roles match your search.</p>}
        </div>
      </section>

      <section aria-labelledby="pick-live" className="mt-8">
        <h2 id="pick-live" className="mb-3 text-lg font-bold text-slate-900">2 · Choose your live interview mode</h2>
        <p className="mb-3 text-sm text-slate-500">
          A real-time, human-like AI interviewer powered by Gemini. It adapts to your answers, speaks naturally, and provides detailed ratings at the end.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { id: 'live-video' as const, icon: '🎥', name: 'Live AI Video Interview', desc: 'CSS-animated AI avatar + your camera + voice answers. 20–30 min realistic session.' },
            { id: 'live-voice' as const, icon: '🎙️', name: 'Live AI Voice Interview', desc: 'Voice-only natural conversation with the AI interviewer. No camera needed.' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => role && onStartLive(role, opt.id === 'live-video' ? 'video' : 'voice')}
              disabled={!role}
              className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-4 text-left transition enabled:hover:border-indigo-500 enabled:hover:bg-indigo-50 disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
            >
              <div className="text-2xl" aria-hidden="true">{opt.icon}</div>
              <div className="mt-1 font-bold text-slate-900">{opt.name}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-slate-500">{opt.desc}</div>
              <div className="mt-2 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">POWERED BY GEMINI</div>
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          🔒 Free forever · Your mic audio and camera never leave this device — only text answers are analyzed.
        </p>
      </div>
    </div>
  );
}
