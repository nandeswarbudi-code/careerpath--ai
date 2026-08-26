import type { StepId } from '../types';
import { useAppStore } from '../lib/store';

export const STEPS: { id: StepId; label: string; icon: string }[] = [
  { id: 'role', label: 'Dream Role', icon: '🎯' },
  { id: 'assessment', label: 'Assessment', icon: '🧠' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
  { id: 'resume', label: 'Resume', icon: '📄' },
  { id: 'interview', label: 'Interview', icon: '🎤' },
  { id: 'readiness', label: 'Readiness', icon: '📈' },
  { id: 'jobs', label: 'Jobs', icon: '💼' },
];

const WORKSPACE = [
  { id: 'ats', label: 'ATS Checker', icon: '📋' },
  { id: 'coding', label: 'Coding', icon: '💻' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface Props {
  current: StepId;
  maxReached: number;
  onNavigate: (step: StepId) => void;
  roleTitle?: string;
  readiness: number;
}

export default function Stepper({ current, maxReached, onNavigate, roleTitle, readiness }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);

  return (
    <aside className="flex w-full shrink-0 flex-col lg:h-screen lg:w-56 lg:sticky lg:top-0 overflow-y-auto" style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
      <button onClick={() => setView('landing')} className="flex items-center gap-2 px-4 py-4 hover:opacity-80 transition" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-sm" style={{ background: 'var(--primary)' }}>🚀</div>
        <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>CareerPath <span style={{ color: 'var(--primary)' }}>AI</span></span>
      </button>

      {roleTitle && (
        <div className="mx-3 mt-3 rounded-lg px-3 py-2 text-[10px]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)' }}>
          <div className="font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Role</div>
          <div className="mt-0.5 text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{roleTitle}</div>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Journey</div>
        {STEPS.map((step, i) => {
          const reachable = i <= maxReached;
          const active = view === 'journey' && step.id === current;
          const done = i < currentIndex && reachable;
          return (
            <button
              key={step.id}
              onClick={() => { if (view !== 'journey') setView('journey'); if (reachable) onNavigate(step.id); }}
              disabled={!reachable}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                active ? 'text-white' : ''
              }`}
              style={{
                background: active ? 'var(--primary)' : 'transparent',
                color: active ? 'white' : reachable ? 'var(--text-secondary)' : 'var(--border)',
              }}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                active ? 'bg-white/20' : done ? 'bg-green-100 text-green-600' : 'bg-slate-100'
              }`}>{done ? '✓' : step.icon}</span>
              {step.label}
            </button>
          );
        })}

        <div className="px-2 pt-3 pb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Workspace</div>
        {WORKSPACE.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ReturnType<typeof useAppStore.getState>['view'])}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition"
            style={{
              background: view === item.id ? 'var(--primary)' : 'transparent',
              color: view === item.id ? 'white' : 'var(--text-secondary)',
            }}
          >
            <span className="text-sm">{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>

      {/* Theme toggle + readiness */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">{useAppStore((s) => s.theme) === 'dark' ? '🌙' : '☀️'}</span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
              {useAppStore((s) => s.theme) === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>
          <button onClick={useAppStore((s) => s.toggleTheme)} className="theme-toggle" aria-label="Toggle theme" />
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span style={{ color: 'var(--muted)' }}>Readiness</span>
            <span style={{ color: 'var(--primary)' }}>{readiness}%</span>
          </div>
          <div className="mt-1.5 progress-track">
            <div className="progress-fill" style={{ width: `${readiness}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
