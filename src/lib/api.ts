/**
 * CareerPath AI — Engine API Layer
 *
 * Two engines:
 *   1. Node.js backend + Gemini → genuine AI semantic evaluation
 *   2. Local browser engine → rule-based scoring (fallback)
 *
 * The frontend tries the backend first. If unreachable, it falls
 * back to the local engine automatically and labels it honestly.
 */
import {
  analyzeAnswer, buildInitialQuestions, generateFollowUp,
  type AnswerRecord, type EngineQuestion, type SessionConfig,
} from './interviewEngine';
import { generateLocalQuestion, generateLocalFeedback } from './localInterviewer';
import { getAuthToken } from './firebase';
import { boundedScore } from './scoreUtils';
import type { LiveInterviewContext, NextQuestionResponse, FinalFeedbackResponse, LiveInterviewMessage } from '../types';

export type EngineSource = 'local-rules' | 'ai-gemini';

const BASE = (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) || 'http://localhost:3001';
const PROBE_INTERVAL_MS = 30_000;

let backendAvailable: boolean | null = null;
let lastProbeAt = 0;

async function probe(): Promise<boolean> {
  const now = Date.now();
  if (backendAvailable !== null && now - lastProbeAt < PROBE_INTERVAL_MS) return backendAvailable;

  lastProbeAt = now;
  try {
    const r = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(2000) });
    const d = await r.json();
    backendAvailable = r.ok && d.ok;
  } catch { backendAvailable = false; }
  return backendAvailable ?? false;
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const token = await getAuthToken();
    const r = await fetch(`${BASE}${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { backendAvailable = false; return null; }
}

// ─── Interview engine ───────────────────────────────────

export interface StartResult { questions: EngineQuestion[]; source: EngineSource; }
export interface AnalyzeResult { record: AnswerRecord; followUp: EngineQuestion | null; source: EngineSource; }

export function engineStart(config: SessionConfig, count: number): StartResult {
  return { questions: buildInitialQuestions(config, count), source: 'local-rules' };
}

export async function engineAnalyze(
  config: SessionConfig, question: EngineQuestion, answerText: string,
  mode: 'typed' | 'voice' | 'skipped', durationSec: number, followUpsSoFar: number,
): Promise<AnalyzeResult> {
  // Always compute local scores first
  const record = analyzeAnswer(question, answerText, mode, durationSec, config);
  const followUp = generateFollowUp(record, config, followUpsSoFar);

  // Try Gemini for richer evaluation (non-blocking enhancement)
  if (mode !== 'skipped' && answerText.trim().length > 10 && await probe()) {
    const aiResult = await post<{ evaluation: Record<string, unknown> }>('/api/ai/evaluate', {
      roleTitle: config.role.title, question: question.text,
      answer: answerText, resumeSummary: config.resumeSkills.join(', '),
    });
    if (aiResult?.evaluation) {
      // Merge AI scores into the record (AI overrides where available)
      const e = aiResult.evaluation;
      const relevance = boundedScore(e.relevance);
      const depth = boundedScore(e.depth);
      const structure = boundedScore(e.structure);
      const clarity = boundedScore(e.clarity);
      const roleFit = boundedScore(e.roleFit);
      if (relevance !== null) record.scores.relevance = relevance;
      if (depth !== null) record.scores.depth = depth;
      if (structure !== null) record.scores.structure = structure;
      if (clarity !== null) record.scores.clarity = clarity;
      if (roleFit !== null) record.scores.roleFit = roleFit;
      if (Array.isArray(e.strengths)) record.feedback = e.strengths as string[];
      if (typeof e.overallHint === 'string') record.feedback.push(e.overallHint);
      return { record, followUp, source: 'ai-gemini' };
    }
  }

  return { record, followUp, source: 'local-rules' };
}

// ─── Live interview ─────────────────────────────────────

export async function fetchLiveInterviewQuestion(ctx: LiveInterviewContext): Promise<NextQuestionResponse> {
  if (await probe()) {
    const r = await post<{ next: NextQuestionResponse }>('/api/ai/interview-next', {
      roleTitle: ctx.roleTitle, phase: ctx.phase,
      messages: ctx.messages, resumeSummary: ctx.resumeSummary,
    });
    if (r?.next) return r.next;
  }
  return generateLocalQuestion(ctx.roleTitle, ctx.phase, ctx.messages);
}

export async function fetchLiveInterviewFeedback(
  roleTitle: string, messages: LiveInterviewMessage[],
): Promise<FinalFeedbackResponse> {
  if (await probe()) {
    const r = await post<{ feedback: FinalFeedbackResponse }>('/api/ai/interview-feedback', {
      roleTitle, messages,
    });
    if (r?.feedback) {
      return {
        ...r.feedback,
        overallScore: boundedScore(r.feedback.overallScore) ?? 0,
        communication: boundedScore(r.feedback.communication) ?? 0,
        technicalKnowledge: boundedScore(r.feedback.technicalKnowledge) ?? 0,
        confidence: boundedScore(r.feedback.confidence) ?? 0,
        problemSolving: boundedScore(r.feedback.problemSolving) ?? 0,
      };
    }
  }
  return generateLocalFeedback(roleTitle, messages);
}


