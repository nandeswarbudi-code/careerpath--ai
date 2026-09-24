import { useMemo, useState } from 'react';
import type { Role, ResumeData } from '../types';

interface Props {
  role: Role | null;
  resume: ResumeData;
  onOpenResume: () => void;
}

export interface AtsAnalysis {
  score: number;
  matched: string[];
  missing: string[];
  tips: string[];
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function getResumeText(resume: ResumeData): string {
  return [
    resume.name,
    resume.email,
    resume.phone,
    resume.linkedin,
    resume.portfolio,
    resume.experienceYears,
    resume.summary,
    resume.skills,
    resume.experience,
    resume.projects,
    resume.education,
  ].join(' ');
}

export function analyzeResume(resume: ResumeData, role: Role): AtsAnalysis {
  const keywords = [...new Map(role.skills.map((skill) => [skill.name.toLocaleLowerCase(), skill.name])).values()];
  const resumeText = ` ${normalizeText(getResumeText(resume))} `;
  const matched: string[] = [];
  const missing: string[] = [];

  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && resumeText.includes(` ${normalizedKeyword} `)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const textFields = [
    resume.name,
    resume.email,
    resume.phone,
    resume.linkedin,
    resume.portfolio,
    resume.experienceYears,
    resume.summary,
    resume.skills,
    resume.experience,
    resume.projects,
    resume.education,
  ];
  const completedFields = textFields.filter((value) => value.trim().length > 3).length;
  const keywordScore = (matched.length / Math.max(keywords.length, 1)) * 55;
  const completenessScore = (completedFields / textFields.length) * 20;
  const impactScore = /\d/.test(`${resume.experience} ${resume.projects}`) ? 15 : 0;
  const contactScore = (resume.email.includes('@') && resume.phone.trim() ? 7 : 0)
    + (resume.linkedin.trim() || resume.portfolio.trim() ? 3 : 0);

  const tips: string[] = [];
  if (missing.length > 0) tips.push(`Add missing keywords: "${missing.slice(0, 3).join('", "')}".`);
  if (resume.summary.trim().length < 50) tips.push('Expand your summary to 2–3 sentences highlighting achievements.');
  if (!/\d/.test(`${resume.experience} ${resume.projects}`)) {
    tips.push('Quantify achievements: "reduced load time by 40%", "managed 500+ users".');
  }
  if (!resume.education.trim()) tips.push('Add your education details for completeness.');
  if (!resume.email.includes('@') || !resume.phone.trim()) {
    tips.push('Add a professional email and phone number so recruiters can contact you.');
  }
  if (!resume.experienceYears.trim()) tips.push('Add years of experience so the recruiter can place your level quickly.');
  if (!resume.linkedin.trim() && !resume.portfolio.trim()) {
    tips.push('Add a LinkedIn, portfolio, or GitHub link when relevant.');
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(keywordScore + completenessScore + impactScore + contactScore))),
    matched,
    missing,
    tips,
  };
}

export default function AtsChecker({ role, resume, onOpenResume }: Props) {
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [lastAnalyzedSignature, setLastAnalyzedSignature] = useState('');
  const resumeContent = getResumeText(resume).trim();
  const currentSignature = useMemo(() => `${role?.id ?? ''}|${resumeContent}`, [role?.id, resumeContent]);
  const isStale = Boolean(analysis && lastAnalyzedSignature !== currentSignature);

  if (!role) {
    return (
      <div className="fade-in card rounded-2xl p-10 text-center">
        <span className="text-4xl">🎯</span>
        <h2 className="mt-4 text-xl font-bold" style={{ color: 'var(--text)' }}>Select a Dream Role first</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Choose a target role before running an ATS scan.</p>
        <button onClick={onOpenResume} className="btn btn-primary mt-5">Choose a role</button>
      </div>
    );
  }

  const runAnalysis = () => {
    if (!resumeContent) return;
    setAnalysis(analyzeResume(resume, role));
    setLastAnalyzedSignature(currentSignature);
  };

  if (!resumeContent) {
    return (
      <div className="fade-in card rounded-2xl p-10 text-center">
        <span className="text-4xl">📄</span>
        <h2 className="mt-4 text-xl font-bold" style={{ color: 'var(--text)' }}>Fill in your resume first</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Add your skills, experience, projects, and contact details before running the ATS scan.</p>
        <button onClick={onOpenResume} className="btn btn-primary mt-5">Open Resume Builder</button>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>ATS Resume Checker</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>ATS Resume Quality — {role.title}</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Checks keyword coverage, resume completeness, measurable impact, and contact details against the {role.skills.length} key skills expected for this role.
          <br /><span className="text-xs italic">This is a deterministic keyword and quality check, not AI semantic analysis.</span>
        </p>
      </div>

      {!analysis ? (
        <div className="card rounded-2xl p-8 text-center">
          <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>Your latest resume content is ready to scan.</p>
          <button onClick={runAnalysis} className="btn btn-primary px-8 py-3">🔍 Analyze Resume</button>
        </div>
      ) : (
        <>
          {isStale && (
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4" style={{ borderColor: 'var(--warning)' }}>
              <span className="text-sm" style={{ color: 'var(--text)' }}>Your resume changed since the last scan.</span>
              <button onClick={runAnalysis} className="btn btn-primary text-xs">↻ Re-analyze latest resume</button>
            </div>
          )}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card rounded-2xl p-6 text-center">
              <div className="text-5xl font-extrabold" style={{ color: analysis.score >= 70 ? 'var(--success)' : analysis.score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{analysis.score}%</div>
              <div className="mt-1 text-sm font-bold" style={{ color: 'var(--muted)' }}>ATS Quality Score</div>
              <div className="mt-3 progress-track"><div className="progress-fill" style={{ width: `${analysis.score}%` }} /></div>
              <button onClick={runAnalysis} className="btn btn-ghost mt-4 text-xs">↻ Re-analyze</button>
            </div>

            <div className="card rounded-2xl p-6 space-y-4 lg:col-span-2">
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--success)' }}>✓ Matched ({analysis.matched.length})</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.matched.map((keyword) => <span key={keyword} className="badge badge-green">{keyword}</span>)}
                  {analysis.matched.length === 0 && <span className="text-xs" style={{ color: 'var(--muted)' }}>None found</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--danger)' }}>✗ Missing ({analysis.missing.length})</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {analysis.missing.map((keyword) => <span key={keyword} className="badge badge-red">{keyword}</span>)}
                  {analysis.missing.length === 0 && <span className="text-xs" style={{ color: 'var(--muted)' }}>All matched!</span>}
                </div>
              </div>
              {analysis.tips.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--primary)' }}>💡 Recommendations</h3>
                  <ul className="mt-2 space-y-1.5">
                    {analysis.tips.map((tip) => <li key={tip} className="flex gap-2 text-xs" style={{ color: 'var(--text)' }}><span>→</span>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
