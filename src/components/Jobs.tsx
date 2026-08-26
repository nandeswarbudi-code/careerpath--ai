import { useState } from 'react';
import type { Role } from '../types';
import { googleJobsUrl, linkedInJobsUrl, indeedJobsUrl, naukriSearchUrl, glassdoorJobsUrl, wellfoundJobsUrl } from '../lib/jobUrls';

interface Props {
  role: Role;
  readiness: number;
  onRestart: () => void;
}

export default function Jobs({ role, readiness, onRestart }: Props) {
  const [applied, setApplied] = useState<Set<string>>(new Set());

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Step 7 · Job Applications</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Find {role.title} Jobs</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Readiness: <span className="font-bold" style={{ color: 'var(--primary)' }}>{readiness}/100</span>
        </p>
      </div>

      {readiness < 55 && (
        <div className="card mb-6 p-4 text-sm" style={{ borderColor: 'var(--warning)' }}>
          ⚠️ Your readiness is below 55. Consider completing more of your roadmap first.
        </div>
      )}

      {/* Sample job listings — these use Google search to find real openings */}
      <div className="space-y-4">
        {role.jobs.map((job) => {
          const isApplied = applied.has(job.id);
          // Search for real job postings matching this title + location (not fictional company)
          const searchUrl = googleJobsUrl(job.title, job.location);

          return (
            <div key={job.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} text-lg font-bold text-white`}>
                {job.company[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold" style={{ color: 'var(--text)' }}>{job.title}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{job.location}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.tags.map((t) => <span key={t} className="badge badge-blue">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-lg font-extrabold" style={{ color: job.match >= 85 ? 'var(--success)' : 'var(--warning)' }}>{job.match}%</div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>match</div>
                </div>
                {isApplied ? (
                  <span className="badge badge-green px-4 py-2">✓ Searched</span>
                ) : (
                  <a href={searchUrl} target="_blank" rel="noopener noreferrer"
                    onClick={() => setApplied((p) => new Set(p).add(job.id))}
                    className="btn btn-primary text-xs">
                    🔍 Find Jobs →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real job portal links */}
      <div className="mt-8 card p-6">
        <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>🔎 Search {role.title} jobs on real portals</h3>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Every link opens real search results on the actual job platform.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'LinkedIn', icon: '💼', url: linkedInJobsUrl(role.title) },
            { label: 'Google Jobs', icon: '🔍', url: googleJobsUrl(role.title) },
            { label: 'Indeed', icon: '🌐', url: indeedJobsUrl(role.title) },
            { label: 'Naukri', icon: '🇮🇳', url: naukriSearchUrl(role.title) },
            { label: 'Glassdoor', icon: '🚪', url: glassdoorJobsUrl(role.title) },
            { label: 'Wellfound', icon: '🚀', url: wellfoundJobsUrl(role.title) },
          ].map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              className="card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-1">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{l.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Completion */}
      <div className="mt-10 rounded-2xl p-8 text-center text-white" style={{ background: 'var(--primary)' }}>
        <h2 className="text-2xl font-extrabold">🎉 Journey complete!</h2>
        <p className="mt-2 opacity-80">Keep improving your readiness score and applying to real jobs.</p>
        <button onClick={onRestart} className="mt-5 btn bg-white font-bold px-8 py-3 hover:opacity-90" style={{ color: 'var(--primary)' }}>
          Explore Another Path
        </button>
      </div>
    </div>
  );
}
