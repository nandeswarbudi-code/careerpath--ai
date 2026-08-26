import { useState } from 'react';
import type { Role } from '../types';
import { LEVEL_LABELS } from '../data/roles';

interface Props {
  role: Role;
  levels: Record<string, number>;
  setLevels: (skillId: string, level: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Assessment({ role, levels, setLevels, onNext, onBack }: Props) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(Object.keys(levels).length === role.skills.length);

  const skill = role.skills[index];
  const answered = Object.keys(levels).length;
  const progress = Math.round((answered / role.skills.length) * 100);

  const pick = (level: number) => {
    setLevels(skill.id, level);
    if (index < role.skills.length - 1) {
      setTimeout(() => setIndex(index + 1), 200);
    } else {
      setTimeout(() => setDone(true), 300);
    }
  };

  const gaps = role.skills.filter((s) => (levels[s.id] ?? 0) < s.requiredLevel);
  const strengths = role.skills.filter((s) => (levels[s.id] ?? 0) >= s.requiredLevel);

  if (done) {
    return (
      <div>
        <div className="mb-8">
          <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Step 2 · AI Skill Assessment</div>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Your Skill Gap Analysis</h1>
          <p className="mt-2 text-slate-500">The AI compared your levels against what employers expect from a {role.title}.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-rose-800">
              <span>🎯</span> Gaps to Close ({gaps.length})
            </h3>
            <div className="mt-4 space-y-3">
              {gaps.length === 0 && <p className="text-sm text-rose-700">No gaps — you already meet the bar on every skill! 🎉</p>}
              {gaps.map((s) => {
                const cur = levels[s.id] ?? 0;
                return (
                  <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>{s.name}</span>
                      <span className="text-xs font-bold text-rose-600">Gap: {s.requiredLevel - cur} level{s.requiredLevel - cur > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3].map((l) => (
                        <div key={l} className={`h-2 flex-1 rounded-full ${l <= cur ? 'bg-indigo-500' : l <= s.requiredLevel ? 'bg-rose-200' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
                      <span>You: {LEVEL_LABELS[cur]}</span>
                      <span>Required: {LEVEL_LABELS[s.requiredLevel]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-800">
              <span>💪</span> Your Strengths ({strengths.length})
            </h3>
            <div className="mt-4 space-y-3">
              {strengths.length === 0 && <p className="text-sm text-emerald-700">Everyone starts somewhere — your roadmap will build these strengths.</p>}
              {strengths.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <span className="text-sm font-semibold text-slate-800">{s.name}</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    ✓ {LEVEL_LABELS[levels[s.id] ?? 0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => { setDone(false); setIndex(0); }} className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50">
            ↺ Retake Assessment
          </button>
          <button onClick={onNext} className="rounded-full bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:scale-105 hover:bg-indigo-700">
            Generate My Roadmap →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Step 2 · AI Skill Assessment</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Rate your current skills</h1>
        <p className="mt-2 text-slate-500">Be honest — the AI uses this to find your knowledge gaps for the {role.title} role.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm font-medium text-slate-500">
          <span>Skill {index + 1} of {role.skills.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-100">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">{skill.category}</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">How strong are you at {skill.name}?</h2>
          <p className="mt-1 text-sm text-slate-400">Employers typically expect: <span className="font-semibold text-slate-600">{LEVEL_LABELS[skill.requiredLevel]}</span></p>

          <div className="mt-6 grid gap-3">
            {LEVEL_LABELS.map((label, level) => (
              <button
                key={label}
                onClick={() => pick(level)}
                className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left font-semibold transition-all hover:border-indigo-400 hover:bg-indigo-50 ${
                  levels[skill.id] === level ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-700'
                }`}
              >
                <span>{label}</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map((d) => (
                    <span key={d} className={`h-2.5 w-2.5 rounded-full ${d <= level ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => (index > 0 ? setIndex(index - 1) : onBack())}
            className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← Back
          </button>
          {levels[skill.id] !== undefined && index < role.skills.length - 1 && (
            <button onClick={() => setIndex(index + 1)} className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
              Next →
            </button>
          )}
          {levels[skill.id] !== undefined && index === role.skills.length - 1 && (
            <button onClick={() => setDone(true)} className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
              See Gap Analysis →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
