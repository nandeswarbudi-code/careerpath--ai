import { useState } from 'react';
import type { ResumeData, Role } from '../types';

interface Props {
  role: Role;
  resume: ResumeData;
  setResume: (r: ResumeData) => void;
  onNext: () => void;
}

const FIELDS: { key: keyof ResumeData; label: string; placeholder: string; textarea?: boolean }[] = [
  { key: 'name', label: 'Full Name', placeholder: 'Aarav Sharma' },
  { key: 'email', label: 'Email', placeholder: 'aarav@example.com' },
  { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/your-name' },
  { key: 'portfolio', label: 'Portfolio / GitHub URL', placeholder: 'github.com/your-name or yourportfolio.com' },
  { key: 'experienceYears', label: 'Years of Experience', placeholder: 'e.g. 3 or 0 for entry-level' },
  { key: 'summary', label: 'Professional Summary', placeholder: 'Motivated developer with 2 years of experience building scalable web apps…', textarea: true },
  { key: 'education', label: 'Education', placeholder: 'B.Tech Computer Science, XYZ University — 2025\nCGPA: 8.5/10', textarea: true },
  { key: 'experience', label: 'Experience / Internships', placeholder: 'Frontend Intern @ TechCorp (Jun–Aug 2024)\n• Built dashboard used by 500+ daily users\n• Reduced page load time by 40%', textarea: true },
  { key: 'skills', label: 'Skills (comma separated)', placeholder: 'React, TypeScript, Node.js, Git, REST APIs, SQL' },
  { key: 'projects', label: 'Key Projects', placeholder: 'Task Manager SPA — React + TypeScript\n• Full CRUD with drag-and-drop\n• 95 Lighthouse performance score', textarea: true },
];

/** Counts fields with meaningful content (>3 chars, not just spaces) */
export function resumeCompleteness(r: ResumeData): number {
  const filled = Object.values(r).filter((v) => v.trim().length > 3).length;
  return Math.round((filled / Object.keys(r).length) * 100);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);
}

function resumeSection(title: string, value: string): string {
  if (!value.trim()) return '';
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const bullets = lines.filter((line) => /^[-*•▪]\s*/.test(line));
  const content = bullets.length === lines.length
    ? `<ul>${bullets.map((line) => `<li>${escapeHtml(line.replace(/^[-*•▪]\s*/, ''))}</li>`).join('')}</ul>`
    : escapeHtml(value).replace(/\r?\n/g, '<br>');
  return `<section><h2>${title}</h2><div class="content">${content}</div></section>`;
}

function cleanBullets(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[-*•▪]\s*/, ''))
    .filter(Boolean)
    .map((line) => `• ${line.charAt(0).toUpperCase()}${line.slice(1)}`)
    .join('\n');
}

function contactLink(value: string, kind: 'email' | 'phone' | 'url'): string {
  const text = escapeHtml(value.trim());
  if (kind === 'email') return `<a href="mailto:${encodeURIComponent(value.trim())}">${text}</a>`;
  if (kind === 'phone') return `<a href="tel:${value.replace(/[^+\d]/g, '')}">${text}</a>`;
  if (/^[a-z][a-z\d+.-]*:/i.test(value.trim()) && !/^https?:\/\//i.test(value.trim())) return text;
  const href = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
  return `<a href="${escapeHtml(href)}">${text}</a>`;
}

function polishResume(resume: ResumeData, role: Role): ResumeData {
  const skills = resume.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
  const uniqueSkills = [...new Set(skills.map((skill) => skill.replace(/\s+/g, ' ')))];
  const projectName = resume.projects.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  const summary = resume.summary.trim() || (uniqueSkills.length > 0
    ? `Aspiring ${role.title} with a foundation in ${uniqueSkills.slice(0, 5).join(', ')}${projectName ? ` and hands-on project work including ${projectName.replace(/^[-*•]\s*/, '')}` : ''}. Brings a practical, detail-oriented approach to building reliable solutions and learning from real user needs.`
    : `Aspiring ${role.title} focused on building practical skills and creating reliable solutions. Add your strongest tools, project work, and the outcomes you achieved to make this summary more specific.`);

  return {
    ...resume,
    summary,
    skills: uniqueSkills.join(', '),
    experience: resume.experience.trim() ? cleanBullets(resume.experience) : '',
    projects: resume.projects.trim() ? cleanBullets(resume.projects) : '',
    education: resume.education.trim(),
  };
}

function downloadResume(r: ResumeData, roleTitle: string): void {
  const contact = [
    r.email ? contactLink(r.email, 'email') : '',
    r.phone ? contactLink(r.phone, 'phone') : '',
    r.linkedin ? contactLink(r.linkedin, 'url') : '',
    r.portfolio ? contactLink(r.portfolio, 'url') : '',
  ].filter(Boolean).join(' | ');
  const formatLabel = r.format === 'combination' ? 'Combination' : r.format === 'functional' ? 'Functional' : 'Reverse-Chronological';
  const experienceHeading = r.format === 'functional' ? 'Selected Achievements' : 'Professional Experience';
  const experienceSection = resumeSection(experienceHeading, r.experience);
  const skillsSection = resumeSection('Core Skills', r.skills);
  const sections = r.format === 'functional'
    ? `${skillsSection}${experienceSection}${resumeSection('Education', r.education)}`
    : r.format === 'combination'
      ? `${skillsSection}${resumeSection('Selected Achievements', r.projects)}${experienceSection}${resumeSection('Education', r.education)}`
      : `${resumeSection('Professional Summary', r.summary)}${skillsSection}${experienceSection}${resumeSection('Selected Projects', r.projects)}${resumeSection('Education', r.education)}`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(r.name || 'Resume')} - ${escapeHtml(roleTitle)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #263238; font: 10.5pt Arial, Helvetica, sans-serif; line-height: 1.42; }
  main { max-width: 820px; margin: 0 auto; border: 1px solid #d7dfdf; }
  header { background: #174b4c; color: white; padding: 30px 34px 25px; border-top: 12px solid #0e3539; }
  h1 { color: white; font-size: 27pt; letter-spacing: .5px; margin: 0 0 4px; text-transform: uppercase; }
  .role { color: #cde4df; font-size: 11pt; font-weight: bold; letter-spacing: 1.1px; margin-bottom: 15px; text-transform: uppercase; }
  .contact { color: #f1f8f6; font-size: 9.5pt; }
  a { color: inherit; text-decoration: none; }
  section { display: grid; grid-template-columns: 142px 1fr; gap: 24px; margin: 0 28px; padding: 17px 0; border-bottom: 1px solid #b8c5c5; page-break-inside: avoid; }
  section:last-child { border-bottom: 0; }
  h2 { color: #174b4c; border-top: 3px solid #174b4c; font-size: 10.5pt; letter-spacing: 1px; line-height: 1.15; margin: 0; padding-top: 7px; text-transform: uppercase; }
  .content { min-width: 0; white-space: normal; }
  ul { margin: 0; padding-left: 18px; }
  li { margin: 0 0 4px; }
  .content br + br { display: block; content: ''; margin-top: 5px; }
  @media print { main { max-width: none; border: 0; } }
  @media (max-width: 600px) { section { grid-template-columns: 1fr; gap: 8px; } }
</style></head><body><main>
<header><h1>${escapeHtml(r.name || 'Your Name')}</h1><div class="role">${escapeHtml(roleTitle)}${r.experienceYears.trim() ? ` · ${escapeHtml(r.experienceYears)} years` : ''}</div><div class="contact">${contact || 'Add your contact details'}</div></header>
${sections}
</main></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(r.name || 'resume').trim().replace(/[^a-z0-9]+/gi, '-')}-${formatLabel}-Resume.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ResumeBuilder({ role, resume, setResume, onNext }: Props) {
  const pct = resumeCompleteness(resume);
  const [polished, setPolished] = useState(false);

  // Smart tips based on actual resume content
  const tips: string[] = [];
  if (!resume.name.trim()) tips.push('Add your full name — it is the first thing recruiters see.');
  if (!resume.email.trim()) tips.push('Add your email address for contact.');
  if (!resume.experienceYears.trim()) tips.push('Add your years of experience so recruiters can understand your level immediately.');
  if (!resume.linkedin.trim() && !resume.portfolio.trim()) tips.push('Add LinkedIn or a portfolio/GitHub link if relevant to your target role.');
  if (resume.summary.trim().length > 0 && resume.summary.trim().length < 60) tips.push('Your summary is too short. Expand to 2–3 sentences highlighting your value proposition.');
  if (resume.summary.trim().length === 0) tips.push('Add a professional summary — a 2–3 sentence elevator pitch about your background.');
  if (resume.skills.trim().length > 0 && !resume.skills.toLowerCase().includes(role.skills[0]?.name.split(' ')[0].toLowerCase())) {
    tips.push(`Add "${role.skills[0]?.name}" to your skills — it is critical for ${role.title} applications.`);
  }
  if (!resume.experience.trim()) tips.push('No experience listed. Add internships, freelance work, or list your roadmap projects as hands-on experience.');
  if (resume.experience.trim().length > 0 && !/\d/.test(resume.experience)) tips.push('Quantify your experience: "increased revenue by 20%", "served 500+ users".');
  if (!resume.projects.trim()) tips.push('Add at least 1–2 portfolio projects with measurable outcomes.');
  if (resume.projects.trim().length > 0 && !/\d/.test(resume.projects)) tips.push('Add numbers to your projects: "reduced load time by 40%", "95 Lighthouse score".');
  if (!resume.education.trim()) tips.push('Add your education — degree, institution, and year.');
  if (resume.experience.trim() && !/\b(19|20)\d{2}\b/.test(resume.experience)) tips.push('Add employer, job title, and dates to each experience entry for chronological ATS parsing.');

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Step 4 · Resume Builder</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Build your {role.title} resume</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Fill in each section. Tips update in real-time based on your content.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          {/* Completeness bar */}
          <div className="card p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span style={{ color: 'var(--text)' }}>Completeness</span>
              <span style={{ color: pct === 100 ? 'var(--success)' : 'var(--primary)' }}>{pct}%</span>
            </div>
            <div className="mt-2 progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text)' }}>Resume format</span>
              <select value={resume.format} onChange={(e) => setResume({ ...resume, format: e.target.value as ResumeData['format'] })} className="input w-full">
                <option value="chronological">Reverse-chronological (recommended)</option>
                <option value="combination">Combination (skills + timeline)</option>
                <option value="functional">Functional (skills-first, use sparingly)</option>
              </select>
              <span className="mt-1 block text-xs" style={{ color: 'var(--muted)' }}>Use reverse-chronological unless you have a strong reason to highlight transferable skills first.</span>
            </label>
            <button
              type="button"
              onClick={() => { setResume(polishResume(resume, role)); setPolished(true); }}
              className="btn btn-primary mt-4 w-full text-sm"
            >
              ✨ Polish resume structure
            </button>
            {polished && <p className="mt-2 text-xs" style={{ color: 'var(--success)' }}>Structure improved. Review every line and replace placeholders with your real results.</p>}
          </div>

          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-sm font-semibold" style={{ color: 'var(--text)' }}>{f.label}</span>
              {f.textarea ? (
                <textarea
                  rows={3}
                  value={resume[f.key]}
                  onChange={(e) => setResume({ ...resume, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="input w-full"
                />
              ) : (
                <input
                  value={resume[f.key]}
                  onChange={(e) => setResume({ ...resume, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="input w-full"
                />
              )}
            </label>
          ))}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="card p-4" style={{ borderColor: 'var(--warning)' }}>
              <h4 className="text-sm font-bold" style={{ color: 'var(--warning)' }}>💡 Resume Tips ({tips.length})</h4>
              <ul className="mt-2 space-y-1.5 text-xs" style={{ color: 'var(--text)' }}>
                {tips.map((t) => (
                  <li key={t} className="flex gap-2"><span style={{ color: 'var(--warning)' }}>→</span>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {tips.length === 0 && pct === 100 && (
            <div className="card p-4" style={{ borderColor: 'var(--success)' }}>
              <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>✅ Your resume looks complete! Review the preview and continue.</span>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start" id="resume-preview">
          <div className="card overflow-hidden shadow-lg print:shadow-none">
            <div className="px-8 py-6 text-white" style={{ background: 'var(--primary)' }}>
              <h2 className="text-2xl font-extrabold">{resume.name || 'Your Name'}</h2>
              <p className="mt-1 text-sm opacity-80">
                {[resume.email, resume.phone, resume.linkedin, resume.portfolio].filter(Boolean).join('  ·  ') || 'email · phone · LinkedIn · portfolio'}
              </p>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                {role.title}{resume.experienceYears.trim() ? ` · ${resume.experienceYears} years` : ''}
              </span>
            </div>
            <div className="space-y-4 px-8 py-6">
              <PreviewSection title="Summary" body={resume.summary} empty="Write a professional summary above…" />
              <PreviewSection title="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {(resume.skills || 'Your skills').split(',').map((s, i) => (
                    <span key={i} className="badge badge-blue">{s.trim()}</span>
                  ))}
                </div>
              </PreviewSection>
              <PreviewSection title="Experience" body={resume.experience} empty="Add your experience above…" />
              <PreviewSection title="Projects" body={resume.projects} empty="Add your projects above…" />
              <PreviewSection title="Education" body={resume.education} empty="Add your education above…" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onClick={() => downloadResume(resume, role.title)} className="btn btn-ghost text-sm">
            ⬇️ Download formatted resume
          </button>
          <button onClick={() => window.print()} className="btn btn-ghost text-sm">
            🖨️ Print / PDF
          </button>
        </div>
        <button onClick={onNext} className="btn btn-primary px-8 py-3">
          Continue to Interview →
        </button>
      </div>
    </div>
  );
}

function PreviewSection({ title, body, empty, children }: { title: string; body?: string; empty?: string; children?: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 pb-1 text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children ?? (
        <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: body?.trim() ? 'var(--text)' : 'var(--muted)' }}>
          {body?.trim() || empty || '—'}
        </p>
      )}
    </div>
  );
}
