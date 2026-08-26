import { useAppStore } from '../lib/store';
import { useReadiness } from '../lib/useReadiness';

export default function Profile() {
  const user = useAppStore((s) => s.user);
  const role = useAppStore((s) => s.role);
  const history = useAppStore((s) => s.history);
  const breakdown = useReadiness();

  const badges = [
    { name: 'Roadmap Explorer', desc: 'Started a customized roadmap', unlocked: !!role },
    { name: 'Portfolio Master', desc: 'Completed at least one project', unlocked: breakdown.projects > 0 },
    { name: 'Interview Practitioner', desc: 'Completed an interview session', unlocked: history.length > 0 },
    { name: 'Cloud Synced', desc: 'Signed in with Google or Email', unlocked: !!user },
    { name: 'Resume Ready', desc: 'Resume completeness above 50%', unlocked: breakdown.resume > 50 },
    { name: 'High Scorer', desc: 'Readiness score above 70', unlocked: breakdown.total > 70 },
  ];

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Profile</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Your Dashboard</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* User card */}
        <div className="card rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 flex items-center justify-center rounded-full text-2xl font-extrabold text-white" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            {(user?.displayName ?? user?.email ?? 'CP').slice(0, 2).toUpperCase()}
          </div>
          <h2 className="mt-3 text-lg font-bold" style={{ color: 'var(--text)' }}>{user?.displayName ?? 'Anonymous'}</h2>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email ?? 'Not signed in'}</p>
          {role && <span className="mt-2 badge badge-blue">{role.title}</span>}
          <div className="mt-4 w-full">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span style={{ color: 'var(--muted)' }}>Readiness</span>
              <span style={{ color: 'var(--primary)' }}>{breakdown.total}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${breakdown.total}%` }} /></div>
          </div>
        </div>

        {/* Badges */}
        <div className="card rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>🏆 Badges ({badges.filter(b => b.unlocked).length}/{badges.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {badges.map((b) => (
              <div key={b.name} className={`card flex items-center gap-3 p-3 ${b.unlocked ? '' : 'opacity-40'}`}>
                <span className="text-2xl">{b.unlocked ? '🌟' : '🔒'}</span>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{b.name}</h4>
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Readiness breakdown */}
      <div className="card rounded-2xl p-6">
        <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>📊 Readiness Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Skills', value: breakdown.skills, color: 'var(--primary)' },
            { label: 'Roadmap', value: breakdown.roadmap, color: 'var(--accent)' },
            { label: 'Resources', value: breakdown.resources, color: '#06B6D4' },
            { label: 'Projects', value: breakdown.projects, color: 'var(--success)' },
            { label: 'Resume', value: breakdown.resume, color: 'var(--warning)' },
            { label: 'Interview', value: breakdown.interview, color: '#EC4899' },
          ].map((d) => (
            <div key={d.label} className="text-center">
              <div className="text-2xl font-extrabold" style={{ color: d.color }}>{d.value}%</div>
              <div className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{d.label}</div>
              <div className="mt-1 progress-track"><div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Interview history */}
      {history.length > 0 && (
        <div className="card rounded-2xl p-6">
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text)' }}>🎤 Interview History ({history.length})</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between card p-3">
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>{h.roleTitle}</div>
                  <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{h.formatName} · {new Date(h.date).toLocaleDateString()}</div>
                </div>
                <div className="text-lg font-extrabold" style={{ color: h.overall >= 70 ? 'var(--success)' : h.overall >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                  {h.overall}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
