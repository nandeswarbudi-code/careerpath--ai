import { useState } from 'react';
import type { Role } from '../types';

import { getQuizForTask, getQuizCategory, QUIZ_PASS_THRESHOLD, type QuizQuestion } from '../lib/quizData';

const DIFF_COLORS: Record<string, string> = { Beginner: 'badge-green', Intermediate: 'badge-amber', Advanced: 'badge-red' };

interface Props {
  role: Role;
  levels: Record<string, number>;
  completedTasks: Set<string>;
  completedResources: Set<string>;
  completedProjects: Set<string>;
  completedCerts: Set<string>;
  toggleTask: (id: string) => void;
  toggleResource: (id: string) => void;
  toggleProject: (id: string) => void;
  toggleCert: (id: string) => void;
  onNext: () => void;
}

export default function Roadmap({ role, levels, completedTasks, completedResources, completedProjects, completedCerts, toggleTask, toggleResource, toggleProject, toggleCert, onNext }: Props) {
  const allTasks = role.phases.flatMap((p) => p.tasks);
  const [quizOpen, setQuizOpen] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizCategory, setQuizCategory] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [verifiedTasks, setVerifiedTasks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`cp-verified:${role.id}`) ?? '[]')); } catch { return new Set(); }
  });
  const [openedAt, setOpenedAt] = useState<Record<string, number>>({});

  const saveVerified = (s: Set<string>) => {
    setVerifiedTasks(s);
    try { localStorage.setItem(`cp-verified:${role.id}`, JSON.stringify([...s])); } catch { /* verification is best effort */ }
  };

  const isFastTrack = (skillId: string) => {
    const skill = role.skills.find((s) => s.id === skillId);
    return skill ? (levels[skillId] ?? 0) >= skill.requiredLevel : false;
  };

  const remainingHours = allTasks.filter((t) => !completedTasks.has(t.id) && !isFastTrack(t.skillId)).reduce((sum, t) => sum + t.hours, 0);
  const doneCount = allTasks.filter((t) => completedTasks.has(t.id) || isFastTrack(t.skillId)).length;
  const resourcesDone = allTasks.filter((t) => completedResources.has(t.id)).length;
  const pct = Math.round((doneCount / allTasks.length) * 100);
  const resourcePct = Math.round((resourcesDone / allTasks.length) * 100);

  // Quiz logic — generate questions ONCE when opening, not on every render
  const openQuiz = (taskId: string, skillName: string, taskTitle: string) => {
    setQuizOpen(taskId);
    setQuizQuestions(getQuizForTask(skillName, taskTitle));
    setQuizCategory(getQuizCategory(skillName, taskTitle));
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const submitQuiz = (taskId: string, questions: QuizQuestion[]) => {
    setQuizSubmitted(true);
    const correctCount = questions.filter((q, i) => quizAnswers[i] === q.correct).length;
    if (correctCount >= QUIZ_PASS_THRESHOLD) { // Pass: 7 out of 10
      const next = new Set(verifiedTasks);
      next.add(taskId);
      saveVerified(next);
      if (!completedResources.has(taskId)) toggleResource(taskId);
      setTimeout(() => setQuizOpen(null), 1500);
    }
  };

  // Track when user opens a resource link
  const trackOpen = (taskId: string) => {
    setOpenedAt((prev) => ({ ...prev, [taskId]: Date.now() }));
  };

  const getTimeSpent = (taskId: string): number => {
    const opened = openedAt[taskId];
    if (!opened) return 0;
    return Math.floor((Date.now() - opened) / 60000); // minutes
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Step 3 · Learning Roadmap</div>
        <h1 className="mt-1 text-3xl font-extrabold" style={{ color: 'var(--text)' }}>Your {role.title} Roadmap</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          Complete resources, pass the mini-quiz to get <span className="badge badge-green">✓ Quiz Verified</span>, then mark tasks done.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SC label="Tasks done" value={`${pct}%`} color="var(--primary)" />
        <SC label="Hours left" value={`~${remainingHours}h`} color="var(--warning)" />
        <SC label="Resources" value={`${resourcePct}%`} color="var(--accent)" />
        <SC label="Quiz verified" value={String(verifiedTasks.size)} color="var(--success)" />
      </div>

      {/* Phases */}
      <div className="space-y-8">
        {role.phases && role.phases.length > 0 ? (
          role.phases.map((phase, pi) => (
            <div key={phase.id} className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: 'var(--primary)' }}>
                  {pi + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{phase.title}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>⏱ {phase.duration}</p>
                </div>
              </div>

              <div className="space-y-3">
                {phase.tasks.map((task) => {
                  const fast = isFastTrack(task.skillId);
                  const done = completedTasks.has(task.id) || fast;
                  const resDone = completedResources.has(task.id);
                  const verified = verifiedTasks.has(task.id);
                  const timeSpent = getTimeSpent(task.id);
                  const skillName = role.skills.find((s) => s.id === task.skillId)?.name ?? '';

                  return (
                  <div key={task.id} className="card p-4">
                    {/* Task header */}
                    <button onClick={() => !fast && toggleTask(task.id)} disabled={fast} className="flex w-full items-start gap-3 text-left">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ background: done ? 'var(--success)' : 'var(--bg-alt)', color: done ? 'white' : 'var(--border)' }}>
                        {done ? '✓' : ''}
                      </span>
                      <span className="flex-1">
                        <span className={`block text-sm font-semibold ${done ? 'line-through opacity-60' : ''}`} style={{ color: 'var(--text)' }}>{task.title}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                          <span>⏱ ~{task.hours}h</span>
                          {fast && <span className="badge badge-green">⚡ Fast-tracked</span>}
                          {verified && <span className="badge badge-green">✓ Quiz Verified</span>}
                          {resDone && !verified && <span className="badge badge-amber">Self-marked</span>}
                          {timeSpent > 0 && <span className="badge badge-blue">📖 {timeSpent}m spent</span>}
                        </span>
                      </span>
                    </button>

                    {/* Resource + verification */}
                    <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--bg-alt)' }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>📚</span>
                        <a href={task.resourceLink.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => trackOpen(task.id)}
                          className="text-sm font-bold hover:underline" style={{ color: 'var(--primary)' }}>
                          {task.resourceLink.name} ↗
                        </a>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {!verified && (
                          <button onClick={() => openQuiz(task.id, skillName, task.title)}
                            className="btn text-[11px] py-1.5 px-3" style={{ background: 'var(--primary)', color: 'white' }}>
                            📝 Take Verification Quiz
                          </button>
                        )}
                        {!resDone && !verified && (
                          <button onClick={() => toggleResource(task.id)}
                            className="btn btn-ghost text-[11px] py-1.5 px-3">
                            Self-mark as studied
                          </button>
                        )}
                        {(resDone || verified) && (
                          <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>
                            {verified ? '✅ Verified via quiz' : '📌 Self-marked (not verified)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quiz modal (inline) */}
                    {quizOpen === task.id && (
                      <QuizPanel
                        category={quizCategory}
                        questions={quizQuestions}
                        answers={quizAnswers}
                        setAnswer={(i, v) => setQuizAnswers({ ...quizAnswers, [i]: v })}
                        submitted={quizSubmitted}
                        onSubmit={(qs) => submitQuiz(task.id, qs)}
                        onClose={() => setQuizOpen(null)}
                      />
                    )}
                  </div>
                );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg p-6 text-center" style={{ background: 'var(--bg-alt)' }}>
            <p style={{ color: 'var(--muted)' }}>No phases available for this role.</p>
          </div>
        )}
      </div>

      {/* Projects */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>🛠️ Recommended Projects</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {role.projects.map((p) => {
            const done = completedProjects.has(p.id);
            return (
              <div key={p.id} className="card p-5 flex flex-col" style={{ borderColor: done ? 'var(--success)' : 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className={`badge ${DIFF_COLORS[p.difficulty]}`}>{p.difficulty}</span>
                  {done && <span>✅</span>}
                </div>
                <h3 className="mt-2 text-base font-bold" style={{ color: 'var(--text)' }}>{p.title}</h3>
                <p className="mt-1 text-xs flex-1" style={{ color: 'var(--muted)' }}>{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.skills.map((s) => <span key={s} className="badge badge-blue text-[10px]">{s}</span>)}
                </div>
                <button onClick={() => toggleProject(p.id)}
                  className={`mt-3 btn text-xs w-full py-2 ${done ? 'btn-ghost' : 'btn-primary'}`}>
                  {done ? '✓ Done — undo' : 'Mark Completed'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Certifications */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>🎓 Recommended Certifications</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {role.certifications.map((c) => {
            const done = completedCerts.has(c.id);
            return (
              <button key={c.id} onClick={() => toggleCert(c.id)}
                className="card flex items-center gap-4 p-4 text-left"
                style={{ borderColor: done ? 'var(--success)' : 'var(--border)' }}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ background: done ? 'var(--success)' : 'var(--bg-alt)', color: done ? 'white' : 'var(--text)' }}>
                  {done ? '✓' : '🏅'}
                </span>
                <span>
                  <span className="block text-sm font-bold" style={{ color: 'var(--text)' }}>{c.name}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{c.provider}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Completion banner */}
      {pct === 100 && (
        <div className="mt-8 card p-6 text-center" style={{ borderColor: 'var(--success)' }}>
          <span className="text-4xl">🏆</span>
          <h3 className="mt-2 text-lg font-bold" style={{ color: 'var(--success)' }}>Roadmap Complete!</h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>All tasks done. Continue to build your resume.</p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button onClick={onNext} className="btn btn-primary px-8 py-3">Continue to Resume →</button>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function SC({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-xs font-bold" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

function QuizPanel({ category, questions, answers, setAnswer, submitted, onSubmit, onClose }: {
  category: string;
  questions: QuizQuestion[];
  answers: Record<number, number>;
  setAnswer: (i: number, v: number) => void;
  submitted: boolean;
  onSubmit: (qs: QuizQuestion[]) => void;
  onClose: () => void;
}) {
  const correctCount = submitted ? questions.filter((q, i) => answers[i] === q.correct).length : 0;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="mt-3 card p-5" style={{ borderColor: 'var(--primary)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--text)' }}>📝 Verification Quiz — score {QUIZ_PASS_THRESHOLD}/10 to verify</h4>
          <span className="badge badge-blue text-[9px] mt-1">{category}</span>
        </div>
        <button onClick={onClose} className="text-xs font-bold" style={{ color: 'var(--muted)' }}>✕ Close</button>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          return (
            <div key={qi}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{qi + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => !submitted && setAnswer(qi, oi)}
                    disabled={submitted}
                    className="flex w-full items-center gap-2 rounded-lg p-2.5 text-left text-xs font-semibold transition"
                    style={{
                      background: submitted && oi === q.correct ? 'var(--badge-green-bg)'
                        : selected === oi && !submitted ? 'var(--badge-blue-bg)'
                        : 'var(--bg-alt)',
                      color: submitted && oi === q.correct ? 'var(--success)'
                        : submitted && selected === oi && oi !== q.correct ? 'var(--danger)'
                        : selected === oi ? 'var(--primary)'
                        : 'var(--text)',
                      border: `1px solid ${selected === oi ? 'var(--primary)' : 'var(--border)'}`,
                    }}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: selected === oi ? 'var(--primary)' : 'var(--bg)', color: selected === oi ? 'white' : 'var(--muted)', border: '1px solid var(--border)' }}>
                      {submitted && oi === q.correct ? '✓' : submitted && selected === oi && oi !== q.correct ? '✗' : String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button onClick={() => onSubmit(questions)} disabled={!allAnswered}
          className="btn btn-primary w-full mt-4 py-2.5 text-sm" style={{ opacity: allAnswered ? 1 : 0.5 }}>
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-4 rounded-lg p-3 text-center text-sm font-bold"
          style={{ background: correctCount >= QUIZ_PASS_THRESHOLD ? 'var(--badge-green-bg)' : 'var(--badge-red-bg)', color: correctCount >= QUIZ_PASS_THRESHOLD ? 'var(--success)' : 'var(--danger)' }}>
          {correctCount >= QUIZ_PASS_THRESHOLD
            ? `✅ Passed! ${correctCount}/10 correct — resource verified!`
            : `❌ ${correctCount}/10 correct — need ${QUIZ_PASS_THRESHOLD} to pass. Review the material and retake with fresh questions.`}
        </div>
      )}
    </div>
  );
}
