

export interface ReadinessBreakdown {
  skills: number;
  roadmap: number;
  resources: number;
  projects: number;
  resume: number;
  interview: number;
  total: number;
}

interface Props {
  breakdown: ReadinessBreakdown;
  onNext: () => void;
  goTo: (step: 'assessment' | 'roadmap' | 'resume' | 'interview') => void;
}

const SEGMENTS: { key: keyof Omit<ReadinessBreakdown, 'total'>; label: string; icon: string; weight: number; step: 'assessment' | 'roadmap' | 'resume' | 'interview' }[] = [
  { key: 'skills', label: 'Skill Coverage', icon: '🧠', weight: 20, step: 'assessment' },
  { key: 'roadmap', label: 'Roadmap Progress', icon: '🗺️', weight: 20, step: 'roadmap' },
  { key: 'resources', label: 'Resources Studied', icon: '📚', weight: 10, step: 'roadmap' },
  { key: 'projects', label: 'Projects & Certs', icon: '🛠️', weight: 20, step: 'roadmap' },
  { key: 'resume', label: 'Resume Quality', icon: '📄', weight: 15, step: 'resume' },
  { key: 'interview', label: 'Interview Score', icon: '🎤', weight: 15, step: 'interview' },
];

export default function Readiness({ breakdown, onNext, goTo }: Props) {
  const score = breakdown.total;
  const verdict = score >= 75
    ? { emoji: '🚀', title: 'Job-Ready!', color: 'var(--success)' }
    : score >= 50
    ? { emoji: '📈', title: 'Almost There', color: 'var(--warning)' }
    : { emoji: '🌱', title: 'Keep Going', color: 'var(--danger)' };

  const circumference = 2 * Math.PI * 70;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Step 6 · Readiness Score</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Are you job-ready?</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Weighted heuristic score computed from every stage of your preparation.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gauge */}
        <div className="card rounded-2xl p-8 text-center lg:col-span-2">
          <div className="relative mx-auto h-44 w-44">
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" strokeWidth="14" style={{ stroke: 'var(--border)' }} />
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#readinessGrad)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)}
                className="transition-all duration-1000" />
              <defs>
                <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold" style={{ color: 'var(--text)' }}>{score}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>/ 100</span>
            </div>
          </div>
          <div className="mt-4 text-4xl">{verdict.emoji}</div>
          <h2 className="mt-1 text-2xl font-extrabold" style={{ color: verdict.color }}>{verdict.title}</h2>
        </div>

        {/* Segments */}
        <div className="space-y-3 lg:col-span-3">
          {SEGMENTS.map((seg) => {
            const val = breakdown[seg.key];
            return (
              <button key={seg.key} onClick={() => goTo(seg.step)} className="card w-full p-4 text-left transition hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text)' }}>
                    <span>{seg.icon}</span> {seg.label}
                    <span className="badge badge-blue text-[9px]">{seg.weight}%</span>
                  </span>
                  <span className="text-lg font-extrabold" style={{ color: 'var(--primary)' }}>{val}%</span>
                </div>
                <div className="mt-2 progress-track">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${val}%`, background: val >= 70 ? 'var(--success)' : val >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
                {val < 70 && <p className="mt-1.5 text-[11px] font-medium" style={{ color: 'var(--muted)' }}>⚡ Click to improve</p>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onNext} className="btn btn-primary px-8 py-3">
          {score >= 55 ? 'Browse Jobs →' : 'Preview Jobs →'}
        </button>
      </div>
    </div>
  );
}
