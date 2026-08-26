/**
 * Local persistence layer (localStorage).
 * Guarantees progress survives page refreshes even before cloud sync
 * completes, and acts as an instant-restore cache for returning users.
 */
import type { ResumeData, StepId } from '../types';

export interface InterviewHistoryEntry {
  date: string; // ISO
  roleTitle: string;
  formatName: string;
  overall: number;
}

export interface LocalState {
  v: 2;
  roleId: string | null;
  levels: Record<string, number>;
  completedTasks: string[];
  completedResources: string[];
  completedProjects: string[];
  completedCerts: string[];
  resume: ResumeData;
  interviewBest: number | null;
  maxReached: number;
  step: StepId;
  history: InterviewHistoryEntry[];
}

const KEY = 'careerpath-ai:v2';

export function loadLocal(): LocalState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    if (parsed.v !== 2) return null;
    return {
      v: 2,
      roleId: parsed.roleId ?? null,
      levels: parsed.levels ?? {},
      completedTasks: parsed.completedTasks ?? [],
      completedResources: parsed.completedResources ?? [],
      completedProjects: parsed.completedProjects ?? [],
      completedCerts: parsed.completedCerts ?? [],
      resume: {
        name: parsed.resume?.name ?? '', email: parsed.resume?.email ?? '', phone: parsed.resume?.phone ?? '',
        summary: parsed.resume?.summary ?? '', education: parsed.resume?.education ?? '',
        experience: parsed.resume?.experience ?? '', skills: parsed.resume?.skills ?? '', projects: parsed.resume?.projects ?? '',
      },
      interviewBest: parsed.interviewBest ?? null,
      maxReached: parsed.maxReached ?? 0,
      step: parsed.step ?? 'role',
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 20) : [],
    };
  } catch {
    return null;
  }
}

export function saveLocal(state: LocalState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full/blocked — non-fatal */
  }
}

export function clearLocal(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Merge two history lists (dedupe by date), newest first, capped at 20. */
export function mergeHistory(a: InterviewHistoryEntry[], b: InterviewHistoryEntry[]): InterviewHistoryEntry[] {
  const seen = new Set<string>();
  return [...a, ...b]
    .filter((e) => {
      if (seen.has(e.date)) return false;
      seen.add(e.date);
      return true;
    })
    .sort((x, y) => y.date.localeCompare(x.date))
    .slice(0, 20);
}
