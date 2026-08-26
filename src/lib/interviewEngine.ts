import type { FormatId, InterviewRole } from '../data/interviewRoles';
import { countFillers } from './speech';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface Interviewer {
  name: string;
  title: string;
  avatar: string;
}

export interface EngineQuestion {
  id: string;
  text: string;
  interviewer: Interviewer;
  /** Extra context, e.g. simulated GD peer statements. */
  peers?: { name: string; avatar: string; statement: string }[];
  isFollowUp: boolean;
  difficulty: 1 | 2 | 3;
  expectsCode: boolean;
}

export interface DimensionScores {
  relevance: number | null;
  structure: number | null;
  depth: number | null;
  clarity: number | null;
  delivery: number | null; // voice-only
  roleFit: number | null;
}

export const DIMENSION_META: { key: keyof DimensionScores; label: string; icon: string; desc: string }[] = [
  { key: 'relevance', label: 'Relevance', icon: '🎯', desc: 'Does the answer address the question and the role\u2019s domain?' },
  { key: 'structure', label: 'Structure (STAR)', icon: '🧱', desc: 'Situation → Task → Action → Result framing and logical flow.' },
  { key: 'depth', label: 'Depth & Specificity', icon: '🔬', desc: 'Concrete examples, numbers, named tools, and measurable outcomes.' },
  { key: 'clarity', label: 'Clarity', icon: '💡', desc: 'Concise sentences, low filler ratio, readable phrasing.' },
  { key: 'delivery', label: 'Vocal Delivery', icon: '🎙️', desc: 'Pace (WPM) and filler frequency — measured only from spoken answers.' },
  { key: 'roleFit', label: 'Role Alignment', icon: '🧩', desc: 'Use of role-critical vocabulary and skills from your resume.' },
];

export interface AnswerRecord {
  question: EngineQuestion;
  answerText: string;
  mode: 'typed' | 'voice' | 'skipped';
  durationSec: number;
  fillerCount: number;
  scores: DimensionScores;
  feedback: string[];
  measuredNote: string | null;
}

export interface SessionConfig {
  role: InterviewRole;
  format: FormatId;
  resumeSkills: string[];
  resumeProjects: string;
}

// ────────────────────────────────────────────────────────────────
// Interviewer personas
// ────────────────────────────────────────────────────────────────

const HR: Interviewer = { name: 'Priya Nair', title: 'HR Manager', avatar: '👩‍💼' };
const DOMAIN: Interviewer = { name: 'Marcus Chen', title: 'Domain Expert', avatar: '👨‍💻' };
const DIRECTOR: Interviewer = { name: 'Sofia Alvarez', title: 'Senior Director', avatar: '👩‍✈️' };
const STRESSOR: Interviewer = { name: 'Victor Kane', title: 'Lead Interviewer', avatar: '🕴️' };
const BOARD_CHAIR: Interviewer = { name: 'Dr. R. Mehta', title: 'Board Chairperson', avatar: '🧑‍⚖️' };
const MODERATOR: Interviewer = { name: 'Moderator', title: 'GD Moderator', avatar: '🎙️' };

export function panelistsFor(format: FormatId): Interviewer[] {
  switch (format) {
    case 'panel': return [DOMAIN, HR, DIRECTOR];
    case 'stress': return [STRESSOR];
    case 'upsc': return [BOARD_CHAIR, DIRECTOR, HR];
    case 'gd': return [MODERATOR];
    case 'coding': return [DOMAIN];
    default: return [HR];
  }
}

// ────────────────────────────────────────────────────────────────
// Question banks (template-interpolated per role)
// ────────────────────────────────────────────────────────────────

interface Template { text: string; d: 1 | 2 | 3; code?: boolean }

const T = (text: string, d: 1 | 2 | 3 = 1, code = false): Template => ({ text, d, code });

function fill(tpl: string, role: InterviewRole): string {
  const topic = role.topics[Math.floor(Math.random() * role.topics.length)];
  const kw = role.keywords[Math.floor(Math.random() * role.keywords.length)];
  return tpl
    .replace(/\{role\}/g, role.title)
    .replace(/\{topic\}/g, topic)
    .replace(/\{keyword\}/g, kw)
    .replace(/\{industry\}/g, role.industry);
}

const BANKS: Record<FormatId, Template[]> = {
  behavioural: [
    T('Tell me about yourself and why you chose a career as a {role}.'),
    T('Describe a time you faced a significant challenge related to {topic}. How did you handle it?', 2),
    T('Tell me about a conflict with a teammate or stakeholder. What did you do, and what was the outcome?', 2),
    T('Give an example of a time you failed at something important. What did you learn?', 2),
    T('Describe a situation where you had to learn something completely new under a tight deadline.', 1),
    T('Tell me about a time you disagreed with your manager\u2019s decision. How did you respond?', 3),
    T('What accomplishment as a {role} (or in your studies) are you most proud of, and why?', 1),
    T('Describe a time you had to persuade others to adopt your approach to {topic}.', 3),
  ],
  panel: [
    T('Walk this panel through your background and what draws you to the {role} position.'),
    T('From a domain perspective: how would you approach a problem involving {topic}?', 2),
    T('How do you handle competing priorities when multiple stakeholders demand your time?', 2),
    T('Where do you see the {industry} field heading in the next five years, and how are you preparing?', 2),
    T('Describe your ideal team culture. What role do you naturally play in a team?', 1),
    T('If we hired you, what would your first 90 days as a {role} look like?', 3),
    T('What is the most sophisticated piece of work involving {keyword} you have delivered?', 3),
  ],
  gd: [
    T('Round 1 — Opening statements. Share your initial position on the topic with one supporting argument.'),
    T('Round 2 — The discussion is heating up. Counter or build upon the arguments made so far with evidence or examples.', 2),
    T('Round 3 — The moderator asks the group to consider the opposing view. Steel-man the other side, then defend your stance.', 3),
    T('Final round — Summarize the discussion and propose a balanced, actionable conclusion for the group.', 2),
  ],
  stress: [
    T('Your resume looks average for a {role}. Why should we not end this interview right now?', 2),
    T('You claim to know {keyword} — but so does every candidate. Prove you are different, in under a minute.', 2),
    T('That sounds rehearsed. Forget the script — tell me about a real mistake that cost your team something.', 3),
    T('If your last manager were here, what is the harshest honest criticism they would give about you?', 2),
    T('You have 30 seconds: convince me you can handle {topic} when everything is on fire and everyone is blaming you.', 3),
    T('Why are you not applying to better-known companies? Or did they reject you?', 2),
  ],
  upsc: [
    T('Introduce yourself to the board. Tell us about your background, education, and home district.'),
    T('Why do you want to join public service instead of a lucrative private-sector career?', 2),
    T('A senior officer asks you to overlook a procedural irregularity that benefits a powerful local figure. What do you do?', 3),
    T('What are the two biggest development challenges facing your home state, and how would you address one as an administrator?', 2),
    T('How should technology be used to improve last-mile delivery of government schemes?', 2),
    T('You are posted as a young officer in a district facing communal tension. Walk the board through your first 48 hours.', 3),
    T('What does integrity in public life mean to you? Give an example where you demonstrated it personally.', 2),
  ],
  coding: [
    T('Given an array of integers, find the two numbers that sum to a target value. Explain your approach, its time complexity, and write pseudo-code.', 1, true),
    T('Design a function to detect if a string is a valid sequence of balanced brackets. Discuss edge cases, then write pseudo-code.', 1, true),
    T('You must design a rate limiter for an API used in {topic}. Compare two algorithms and sketch the core logic in pseudo-code.', 3, true),
    T('Given a stream of events too large for memory, how would you find the top 10 most frequent items? Explain the data structures and write pseudo-code.', 2, true),
    T('Explain how you would debug a production issue where {keyword} performance degraded 10x overnight. What do you check, in order?', 2),
    T('Design the core data model for a system handling {topic}. Explain your entities, relationships, and one key trade-off.', 3, true),
  ],
};

const GD_TOPICS = [
  'Should artificial intelligence tools be allowed in job interviews and university exams?',
  'Remote work is doing more harm than good to early-career professionals.',
  'Should social media platforms be held legally responsible for misinformation?',
  'Is a four-day work week practical for {industry}?',
  'Degrees are becoming irrelevant — skills matter more than credentials.',
];

// ────────────────────────────────────────────────────────────────
// Session builder
// ────────────────────────────────────────────────────────────────

let uid = 0;
const nextId = (): string => `q${++uid}`;

const GD_PEERS = [
  { name: 'Ananya', avatar: '🧕' },
  { name: 'Rahul', avatar: '👨🏽' },
  { name: 'Wei', avatar: '👩🏻' },
];

const GD_PEER_LINES: string[][] = [
  [
    'I strongly support the motion — efficiency gains are undeniable and we should embrace them.',
    'I disagree. We are trading long-term fundamentals for short-term convenience.',
  ],
  [
    'Building on that — the data from recent industry surveys actually supports both sides partially.',
    'We keep talking in abstractions. Can anyone give a concrete real-world example?',
  ],
  [
    'Playing devil\u2019s advocate: even the strongest argument so far ignores the cost dimension entirely.',
    'I think the group is converging too quickly. The minority view deserves more weight.',
  ],
  [
    'To summarize my position: the benefits outweigh the risks, but only with strong safeguards.',
    'My closing point — implementation matters more than the principle itself.',
  ],
];

export function buildInitialQuestions(config: SessionConfig, count: number): EngineQuestion[] {
  const { role, format } = config;
  const bank = [...BANKS[format]];
  const panel = panelistsFor(format);
  const questions: EngineQuestion[] = [];

  // Shuffle bank deterministically enough
  bank.sort(() => Math.random() - 0.5);

  const gdTopic = fill(GD_TOPICS[Math.floor(Math.random() * GD_TOPICS.length)], role);

  const pool = format === 'gd' ? BANKS.gd : bank; // GD keeps round order
  const selected = format === 'gd' ? pool : pool.slice(0, count);

  selected.slice(0, count).forEach((tpl, i) => {
    const interviewer = panel[i % panel.length];
    const text =
      format === 'gd' && i === 0
        ? `Today's topic: “${gdTopic}”\n\n${fill(tpl.text, role)}`
        : fill(tpl.text, role);
    questions.push({
      id: nextId(),
      text,
      interviewer,
      peers:
        format === 'gd'
          ? GD_PEER_LINES[Math.min(i, GD_PEER_LINES.length - 1)].map((line, j) => ({
              ...GD_PEERS[j % GD_PEERS.length],
              statement: line,
            }))
          : undefined,
      isFollowUp: false,
      difficulty: tpl.d,
      expectsCode: tpl.code ?? false,
    });
  });

  // Resume-aware injection (not for GD/UPSC round order)
  if (format !== 'gd' && config.resumeSkills.length > 0) {
    const skill = config.resumeSkills[0];
    questions.splice(1, 0, {
      id: nextId(),
      text: `I see “${skill}” on your resume. Describe the most difficult real problem you solved using it — and be specific about your exact contribution.`,
      interviewer: panel[0],
      isFollowUp: false,
      difficulty: 2,
      expectsCode: false,
    });
    questions.length = Math.min(questions.length, count + 1);
  }

  return questions;
}

/**
 * Adaptive follow-up: reacts to the weakest dimension of the previous answer.
 * Returns null when the answer was strong enough (or skipped) — the interview simply moves on.
 */
export function generateFollowUp(record: AnswerRecord, config: SessionConfig, followUpsSoFar: number): EngineQuestion | null {
  if (record.mode === 'skipped' || followUpsSoFar >= 2) return null;
  const s = record.scores;
  const panel = panelistsFor(config.format);
  const interviewer = config.format === 'stress' ? STRESSOR : panel[0];

  const measured = [s.relevance, s.structure, s.depth, s.clarity].filter((v): v is number => v !== null);
  if (measured.length === 0) return null;
  const avg = measured.reduce((a, b) => a + b, 0) / measured.length;

  let text: string | null = null;

  if (avg >= 75) {
    // Strong answer → escalate difficulty
    if (config.format === 'stress') {
      text = 'Fine. But strong candidates crack eventually. Same scenario — now your budget is halved and your deadline moved up a week. What do you cut?';
    } else if (config.format === 'coding') {
      text = 'Good. Now suppose the input is 100× larger and must run on a memory-constrained machine. How does your approach change?';
    } else {
      text = `That was solid. Let's go deeper: what was the hardest trade-off you made in that situation, and would you decide differently today?`;
    }
  } else if (s.depth !== null && s.depth < 45) {
    text = 'That was quite general. Can you give me one concrete example — with real numbers or a specific outcome?';
  } else if (s.structure !== null && s.structure < 40) {
    text = 'Let me stop you there. Walk me through that again using a clear structure: the Situation, your Task, the Actions you took, and the Result.';
  } else if (s.relevance !== null && s.relevance < 40) {
    text = `I'm not sure that answered my question. How does this relate specifically to the work of a ${config.role.title}?`;
  }

  if (!text) return null;
  return {
    id: nextId(),
    text,
    interviewer,
    isFollowUp: true,
    difficulty: 3,
    expectsCode: false,
  };
}

// ────────────────────────────────────────────────────────────────
// Rule-based answer analysis — six dimensions
//
// NOTE: This is NOT AI/LLM analysis. It uses deterministic rules:
//   - Word count and sentence length
//   - STAR keyword detection (pattern matching)
//   - Filler word ratio (regex counting)
//   - Role keyword overlap (string matching)
//   - WPM calculation (voice only)
//
// It CANNOT understand semantic meaning, evaluate technical
// correctness, or provide contextual feedback like an LLM would.
// ────────────────────────────────────────────────────────────────

const STAR_SIGNALS = {
  situation: ['when i', 'situation', 'at my', 'during', 'while working', 'last year', 'in my previous', 'context', 'we had', 'in college', 'my team'],
  task: ['my task', 'my role', 'responsible', 'i needed to', 'i had to', 'the goal', 'objective', 'my job was'],
  action: ['i decided', 'i built', 'i created', 'i led', 'i implemented', 'i organized', 'i analyzed', 'i wrote', 'i designed', 'i proposed', 'i approached', 'so i', 'i started', 'i worked'],
  result: ['result', 'outcome', 'increased', 'decreased', 'reduced', 'improved', 'saved', 'achieved', 'delivered', 'learned', 'in the end', 'eventually', 'success', '%'],
};

const HEDGES = ['maybe', 'i guess', 'i think probably', 'not sure', 'kind of', 'sort of', 'i suppose', 'possibly'];

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

export function analyzeAnswer(
  question: EngineQuestion,
  answerText: string,
  mode: 'typed' | 'voice' | 'skipped',
  durationSec: number,
  config: SessionConfig,
): AnswerRecord {
  const text = answerText.trim();
  const lower = text.toLowerCase();
  const words = text.length > 0 ? text.split(/\s+/).length : 0;
  const fillerCount = countFillers(text);

  // Skipped or empty: honest zeros, nothing fabricated.
  if (mode === 'skipped' || words === 0) {
    return {
      question,
      answerText: '',
      mode: 'skipped',
      durationSec,
      fillerCount: 0,
      scores: { relevance: 0, structure: 0, depth: 0, clarity: 0, delivery: null, roleFit: 0 },
      feedback: ['No answer was provided, so content scores are 0. Skipping questions in real interviews leaves a strong negative impression — always attempt a structured answer.'],
      measuredNote: 'Delivery not measured — no spoken answer.',
    };
  }

  const feedback: string[] = [];

  // 1) Relevance — overlap with question words + role keywords
  const qWords = question.text.toLowerCase().match(/[a-z]{5,}/g) ?? [];
  const qHits = new Set(qWords.filter((w) => lower.includes(w))).size;
  const kwHits = config.role.keywords.filter((k) => lower.includes(k.toLowerCase())).length;
  let relevance = clamp(25 + qHits * 9 + kwHits * 12 + Math.min(words, 60) * 0.3);
  if (words < 15) relevance = Math.min(relevance, 35);
  if (relevance < 50) feedback.push('Tie your answer more explicitly to the question — echo its key terms and connect them to the role.');

  // 2) Structure — STAR signals + paragraph flow
  const starParts = (Object.keys(STAR_SIGNALS) as (keyof typeof STAR_SIGNALS)[]).filter((part) =>
    STAR_SIGNALS[part].some((sig) => lower.includes(sig)),
  );
  let structure = clamp(15 + starParts.length * 20 + (words > 50 ? 10 : 0));
  if (question.expectsCode && /\b(function|def |for |while |if |return|=>|loop|array|map|hash)\b/i.test(text)) {
    structure = clamp(structure + 20);
  }
  if (starParts.length < 3) feedback.push(`Your answer showed ${starParts.length}/4 STAR components (${starParts.join(', ') || 'none'}). Add the missing parts — especially a measurable Result.`);

  // 3) Depth — specifics: numbers, examples, named tools
  const numbers = (text.match(/\d+/g) ?? []).length;
  const exampleSignals = ['for example', 'for instance', 'specifically', 'in particular', 'e.g', 'such as'].filter((s) => lower.includes(s)).length;
  const depth = clamp(10 + Math.min(words, 140) * 0.35 + numbers * 8 + exampleSignals * 10 + kwHits * 6);
  if (numbers === 0) feedback.push('No numbers detected. Quantify impact — “reduced load time 40%”, “handled 200 tickets/month” — to make answers memorable.');

  // 4) Clarity — sentence length + filler ratio + hedging
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgLen = sentences.length ? words / sentences.length : words;
  const fillerRatio = words > 0 ? fillerCount / words : 0;
  const hedgeCount = HEDGES.filter((h) => lower.includes(h)).length;
  let clarity = 85;
  if (avgLen > 32) { clarity -= 20; feedback.push('Sentences are running long — break ideas into shorter, punchier statements.'); }
  if (fillerRatio > 0.04) { clarity -= 25; feedback.push(`High filler-word ratio (${(fillerRatio * 100).toFixed(1)}%). Pause silently instead of saying “um/like/basically”.`); }
  if (hedgeCount >= 2) { clarity -= 15; feedback.push('Hedging language (“I guess”, “maybe”) weakens authority. State positions directly.'); }
  if (words < 25) { clarity -= 15; }
  clarity = clamp(clarity);

  // 5) Delivery — ONLY measurable for voice answers. Never faked.
  let delivery: number | null = null;
  let measuredNote: string | null = null;
  if (mode === 'voice' && durationSec >= 5) {
    const wpm = (words / durationSec) * 60;
    let d = 90;
    if (wpm < 90) { d -= 25; feedback.push(`Pace was slow (~${Math.round(wpm)} WPM). Aim for 110–160 WPM to sound engaged.`); }
    else if (wpm > 185) { d -= 25; feedback.push(`Pace was rushed (~${Math.round(wpm)} WPM). Slow down — interviewers need time to absorb your points.`); }
    d -= Math.min(30, fillerCount * 4);
    delivery = clamp(d);
  } else if (mode === 'voice') {
    measuredNote = 'Spoken answer was too short (<5s) to measure pace reliably — delivery not scored.';
  } else {
    measuredNote = 'Typed answer — vocal delivery not measured. Use the microphone to get pace & filler analytics.';
  }

  // 6) Role fit — role keywords + resume skill overlap
  const resumeHits = config.resumeSkills.filter((s) => s.length > 2 && lower.includes(s.toLowerCase())).length;
  const roleFit = clamp(20 + kwHits * 15 + resumeHits * 12 + (lower.includes(config.role.title.toLowerCase().split(' ')[0]) ? 10 : 0));
  if (kwHits === 0) feedback.push(`No role-specific vocabulary detected. A strong ${config.role.title} candidate naturally uses terms like “${config.role.keywords.slice(0, 3).join('”, “')}”.`);

  if (feedback.length === 0) feedback.push('Strong answer — relevant, structured, specific, and clearly delivered. Keep this quality consistent.');

  return {
    question,
    answerText: text,
    mode,
    durationSec,
    fillerCount,
    scores: { relevance, structure, depth, clarity, delivery, roleFit },
    feedback,
    measuredNote,
  };
}

// ────────────────────────────────────────────────────────────────
// Aggregation for reports — averages ignore unmeasured (null) values
// ────────────────────────────────────────────────────────────────

export interface ReportSummary {
  overall: number;
  dimensionAverages: { key: keyof DimensionScores; label: string; icon: string; value: number | null; measuredCount: number }[];
  answered: number;
  skipped: number;
  voiceAnswers: number;
  totalQuestions: number;
}

export function summarize(records: AnswerRecord[]): ReportSummary {
  const dims = DIMENSION_META.map(({ key, label, icon }) => {
    const vals = records.map((r) => r.scores[key]).filter((v): v is number => v !== null);
    return {
      key,
      label,
      icon,
      value: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null,
      measuredCount: vals.length,
    };
  });
  const measured = dims.filter((d) => d.value !== null) as { value: number }[];
  const overall = measured.length ? Math.round(measured.reduce((a, d) => a + d.value, 0) / measured.length) : 0;
  return {
    overall,
    dimensionAverages: dims,
    answered: records.filter((r) => r.mode !== 'skipped').length,
    skipped: records.filter((r) => r.mode === 'skipped').length,
    voiceAnswers: records.filter((r) => r.mode === 'voice').length,
    totalQuestions: records.length,
  };
}
