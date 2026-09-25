/**
 * CareerPath AI — Engine API Layer
 *
 * The live interview uses two paths:
 *   1. Node.js backend + Gemini → adaptive AI questions and feedback
 *   2. Local browser generator → deterministic fallback questions and feedback
 *
 * The frontend tries the backend first. If unreachable, it falls
 * back to the local engine automatically and labels it honestly.
 */
import { generateLocalQuestion, generateLocalFeedback } from './localInterviewer';
import { getAuthToken } from './firebase';
import { boundedScore } from './scoreUtils';
import type { LiveInterviewContext, NextQuestionResponse, FinalFeedbackResponse, LiveInterviewMessage } from '../types';

const configuredBase = typeof import.meta !== 'undefined'
  ? (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL?.trim()
  : undefined;
const BASE = (configuredBase || 'https://careerpath-ai-n4ak.onrender.com').replace(/\/$/, '');
const PROBE_INTERVAL_MS = 30_000;

let backendAvailable: boolean | null = null;
let lastProbeAt = 0;

export type CodingLanguage = 'javascript' | 'c' | 'cpp' | 'python' | 'java' | 'php' | 'ruby';

export interface CodeExecutionResult {
  compileOutput: string;
  runOutput: string;
  status: 'success' | 'compile-error' | 'runtime-error';
}

export async function executeCode(
  language: CodingLanguage,
  code: string,
  stdin = '',
): Promise<CodeExecutionResult> {
  const result = await post<CodeExecutionResult>('/api/code/execute', { language, code, stdin });
  if (!result) throw new Error('The online compiler is unavailable. Start the backend and try again.');
  return result;
}

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

// ─── Live interview ─────────────────────────────────────

export async function fetchLiveInterviewQuestion(ctx: LiveInterviewContext): Promise<NextQuestionResponse> {
  if (await probe()) {
    const r = await post<{ next: NextQuestionResponse }>('/api/ai/interview-next', {
      roleTitle: ctx.roleTitle, phase: ctx.phase,
      roleKeywords: ctx.roleKeywords, roleTopics: ctx.roleTopics,
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
