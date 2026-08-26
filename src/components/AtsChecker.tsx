import { useState } from 'react';
import type { Role, ResumeData } from '../types';

interface Props { role: Role | null; resume: ResumeData; }

export default function AtsChecker({ role, resume }: Props) {
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState(0);
  const [matched, setMatched] = useState<string[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  const resumeContent = [resume.skills, resume.summary, resume.experience, resume.projects, resume.education].join('').trim();

  if (!role) {
    return (
      <div className="fade-in card rounded-2xl p-10 text-center">
        <span className="text-4xl">🎯</span>
        <h2 className="mt-4 text-xl font-bold" style={{ color: 'var(--text)' }}>Select a Dream Role first</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>The ATS checker compares your resume against role-specific keywords.</p>
      </div>
    );
  }

  if (!resumeContent) {
    return (
      <div className="fade-in card rounded-2xl p-10 text-center">
        <span className="text-4xl">📄</span>
        <h2 className="mt-4 text-xl font-bold" style={{ color: 'var(--text)' }}>Fill in your Resume first</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Go to the Resume Builder step and add your skills, experience, and projects before running the ATS scan.</p>
      </div>
    );
  }

  const analyze = () => {
    const keywords = role.skills.map((s) => s.name);
    const resumeText = [resume.skills, resume.summary, resume.experience, resume.projects].join(' ').toLowerCase();
    const m: string[] = [];
    const miss: string[] = [];
    keywords.forEach((kw) => {
      (resumeText.includes(kw.toLowerCase()) ? m : miss).push(kw);
    });
    setMatched(m);
    setMissing(miss);
    setScore(Math.round((m.length / Math.max(keywords.length, 1)) * 100));
    const t: string[] = [];
    if (miss.length > 0) t.push(`Add missing keywords: "${miss.slice(0, 3).join('", "')}".`);
    if (resume.summary.length < 50) t.push('Expand your summary to 2-3 sentences highlighting achievements.');
    if (!/\d/.test(resume.experience + resume.projects)) t.push('Quantify achievements: "reduced load time by 40%", "managed 500+ users".');
    if (!resume.education.trim()) t.push('Add your education details for completeness.');
    setTips(t);
    setAnalyzed(true);
  };

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>ATS Resume Checker</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Keyword Analysis — {role.title}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Compares your resume content against the {role.skills.length} key skills expected for this role.
          <br /><span className="text-xs italic">Note: This is rule-based keyword matching, not AI semantic analysis.</span>
        </p>
      </div>

      {!analyzed ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Make sure you've filled in your resume in the Resume Builder step.</p>
          <button onClick={analyze} className="btn btn-primary px-8 py-3">🔍 Analyze Resume</button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Score */}
          <div className="card rounded-2xl p-6 text-center">
            <div className="text-5xl font-extrabold" style={{ color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{score}%</div>
            <div className="text-sm font-bold mt-1" style={{ color: 'var(--muted)' }}>ATS Match Score</div>
            <div className="mt-3 progress-track"><div className="progress-fill" style={{ width: `${score}%` }} /></div>
            <button onClick={analyze} className="btn btn-ghost text-xs mt-4">↻ Re-analyze</button>
          </div>

          {/* Keywords */}
          <div className="card rounded-2xl p-6 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--success)' }}>✓ Matched ({matched.length})</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {matched.map((k) => <span key={k} className="badge badge-green">{k}</span>)}
                {matched.length === 0 && <span className="text-xs" style={{ color: 'var(--muted)' }}>None found</span>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--danger)' }}>✗ Missing ({missing.length})</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.map((k) => <span key={k} className="badge badge-red">{k}</span>)}
                {missing.length === 0 && <span className="text-xs" style={{ color: 'var(--muted)' }}>All matched!</span>}
              </div>
            </div>
            {tips.length > 0 && (
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>💡 Recommendations</h3>
                <ul className="mt-2 space-y-1.5">
                  {tips.map((t, i) => <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--text)' }}><span>→</span>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
