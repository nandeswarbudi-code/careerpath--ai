import { useAppStore } from '../lib/store';

const FEATURES = [
  { icon: '🎯', title: '44 Career Roles', desc: 'Engineering, Data, HR, Finance, Healthcare, Government & more', color: 'from-blue-500 to-cyan-500' },
  { icon: '🧠', title: 'AI Skill Assessment', desc: 'Find your gaps with per-skill analysis vs employer expectations', color: 'from-violet-500 to-purple-500' },
  { icon: '🗺️', title: 'Personalized Roadmap', desc: 'Curated resources, time estimates & progress tracking', color: 'from-emerald-500 to-teal-500' },
  { icon: '🎤', title: 'Mock Interviews', desc: '6 formats + live video/voice practice with automated evaluation', color: 'from-orange-500 to-rose-500' },
  { icon: '📄', title: 'Resume & ATS', desc: 'Builder with keyword matching analysis and export options', color: 'from-pink-500 to-fuchsia-500' },
  { icon: '💼', title: 'Job Search Links', desc: 'Intelligent search links to LinkedIn, Indeed, Naukri, Glassdoor & more', color: 'from-amber-500 to-yellow-500' },
];

const STATS = [
  { value: '44+', label: 'Career Roles' },
  { value: '6', label: 'Interview Formats' },
  { value: '100%', label: 'Free Forever' },
  { value: '∞', label: 'Practice Sessions' },
];

const STEPS = [
  { n: '01', label: 'Choose Role', icon: '🎯' },
  { n: '02', label: 'Assessment', icon: '🧠' },
  { n: '03', label: 'Roadmap', icon: '🗺️' },
  { n: '04', label: 'Projects', icon: '🛠️' },
  { n: '05', label: 'Resume', icon: '📄' },
  { n: '06', label: 'Interview', icon: '🎤' },
  { n: '07', label: 'Readiness', icon: '📈' },
  { n: '08', label: 'Apply', icon: '💼' },
];

interface Props {
  onStart: () => void;
  onStudio: () => void;
  onSignIn: () => void;
  userLabel: string | null;
}

export default function Landing({ onStart, onStudio, onSignIn, userLabel }: Props) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)', borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-lg text-white shadow-lg shadow-blue-500/20">🚀</div>
            <span className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>CareerPath <span style={{ color: 'var(--primary)' }}>AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme" />
            {userLabel ? (
              <span className="badge badge-green text-xs">{userLabel}</span>
            ) : (
              <button onClick={onSignIn} className="btn btn-ghost text-sm">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(600px at 50% 0%, rgba(59,130,246,0.15), transparent)' }} />
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center relative fade-in">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold" style={{ background: 'var(--badge-blue-bg)', color: 'var(--badge-blue-text)' }}>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Intelligent career preparation platform
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Your path from
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              learner to hired
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
            Stop guessing what to learn. CareerPath AI builds your personalized roadmap, provides structured mock interviews with automated evaluation, and tracks your <strong style={{ color: 'var(--text)' }}>job-readiness score</strong>.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button onClick={onStart} className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]">
              Start Your Journey
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button onClick={onStudio} className="btn btn-ghost rounded-xl px-8 py-4 text-base">
              🎤 Try AI Interviewer
            </button>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="card rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{s.value}</div>
              <div className="mt-1 text-xs font-bold" style={{ color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Everything you need to <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">get hired</span></h2>
          <p className="mt-3 text-base" style={{ color: 'var(--muted)' }}>One platform, zero confusion.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card rounded-2xl p-6 transition-all hover:-translate-y-1">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-xl text-white shadow-lg`}>
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Journey Steps ─── */}
      <section className="py-16" style={{ background: 'var(--bg-alt)' }}>
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold">8-step guided journey</h2>
            <p className="mt-2" style={{ color: 'var(--muted)' }}>From dream role to job offer — every step connected.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card rounded-2xl p-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-2xl" />
                <div className="text-[10px] font-extrabold tracking-widest mt-1" style={{ color: 'var(--primary)' }}>STEP {s.n}</div>
                <div className="text-3xl mt-2">{s.icon}</div>
                <div className="mt-2 text-sm font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-violet-600 to-purple-600 p-10 sm:p-14 text-center text-white shadow-2xl">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Ready to launch your career?</h2>
          <p className="relative mt-4 text-lg text-blue-100">Get your personalized roadmap in minutes. No credit card. No strings.</p>
          <button onClick={onStart} className="relative mt-8 rounded-xl bg-white px-10 py-4 font-bold text-blue-700 shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
        🚀 CareerPath AI — Free for every job seeker · {theme === 'dark' ? '🌙' : '☀️'} {theme} mode
      </footer>
    </div>
  );
}
