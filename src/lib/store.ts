/**
 * Central state store (Zustand + Immer).
 * Replaces scattered useState in App.tsx so auth, local persistence,
 * cloud sync and derived readiness are predictable, fast, and easy to debug.
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ResumeData, Role, StepId } from '../types';
import { ROLE_CATALOG } from '../data/roleFactory';
import { loadProgress, saveProgress, type CloudProgress, type InterviewHistoryEntry } from './firebase';
import { loadLocal } from './storage';

export interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // View
  view: 'landing' | 'auth' | 'journey' | 'studio' | 'ats' | 'coding' | 'profile' | 'settings';
  setView: (view: AppState['view']) => void;
  pendingView: 'journey' | 'studio';
  setPendingView: (v: 'journey' | 'studio') => void;

  // Journey
  step: StepId;
  setStep: (step: StepId) => void;
  maxReached: number;
  role: Role | null;
  setRole: (role: Role | null) => void;
  levels: Record<string, number>;
  setSkillLevel: (skillId: string, level: number) => void;
  completedTasks: Set<string>;
  toggleTask: (id: string) => void;
  completedResources: Set<string>;
  toggleResource: (id: string) => void;
  completedProjects: Set<string>;
  toggleProject: (id: string) => void;
  completedCerts: Set<string>;
  toggleCert: (id: string) => void;
  resume: ResumeData;
  setResume: (resume: ResumeData) => void;
  interviewBest: number | null;
  setInterviewBest: (score: number) => void;
  history: InterviewHistoryEntry[];
  addHistory: (entry: InterviewHistoryEntry) => void;

  // Auth & sync
  user: { uid: string; displayName: string | null; email: string | null } | null;
  setUser: (user: AppState['user']) => void;
  authReady: boolean;
  setAuthReady: (ready: boolean) => void;
  syncState: 'idle' | 'loading' | 'saving' | 'synced' | 'error';
  setSyncState: (s: AppState['syncState']) => void;
  cloudRestoreInFlight: boolean;
  setCloudRestoreInFlight: (inFlight: boolean) => void;

  // Actions
  resetJourney: () => void;
  restoreLocal: () => void;
  restoreCloud: (uid: string) => Promise<void>;
  saveCloud: (uid: string) => Promise<void>;
}

const EMPTY_RESUME: ResumeData = {
  name: '', email: '', phone: '', linkedin: '', portfolio: '', experienceYears: '', format: 'chronological',
  summary: '', education: '', experience: '', skills: '', projects: '',
};

function readStoredTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('cp-theme');
    return saved === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    theme: readStoredTheme(),
    toggleTheme: () => set((s) => {
      s.theme = s.theme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('cp-theme', s.theme);
      } catch {
        /* ignore storage write failures */
      }
      document.documentElement.setAttribute('data-theme', s.theme);
    }),

    view: 'landing',
    setView: (view) => set({ view }),
    pendingView: 'journey',
    setPendingView: (pendingView) => set({ pendingView }),

    step: 'role',
    setStep: (step) => {
      const idx = ['role', 'assessment', 'roadmap', 'resume', 'interview', 'readiness', 'jobs'].indexOf(step);
      set((s) => {
        s.step = step;
        if (idx > s.maxReached) s.maxReached = idx;
      });
    },
    maxReached: 0,
    role: null,
    setRole: (role) =>
      set((s) => {
        // Reset progress when switching roles
        if (role?.id !== s.role?.id) {
          s.levels = {};
          s.completedTasks = new Set();
          s.completedResources = new Set();
          s.completedProjects = new Set();
          s.completedCerts = new Set();
          s.interviewBest = null;
          s.maxReached = 0;
          s.step = 'role';
        }
        s.role = role;
      }),
    levels: {},
    setSkillLevel: (skillId, level) =>
      set((s) => {
        s.levels[skillId] = level;
      }),
    completedTasks: new Set(),
    toggleTask: (id) =>
      set((s) => {
        if (s.completedTasks.has(id)) s.completedTasks.delete(id);
        else s.completedTasks.add(id);
      }),
    completedResources: new Set(),
    toggleResource: (id) =>
      set((s) => {
        if (s.completedResources.has(id)) s.completedResources.delete(id);
        else s.completedResources.add(id);
      }),
    completedProjects: new Set(),
    toggleProject: (id) =>
      set((s) => {
        if (s.completedProjects.has(id)) s.completedProjects.delete(id);
        else s.completedProjects.add(id);
      }),
    completedCerts: new Set(),
    toggleCert: (id) =>
      set((s) => {
        if (s.completedCerts.has(id)) s.completedCerts.delete(id);
        else s.completedCerts.add(id);
      }),
    resume: EMPTY_RESUME,
    setResume: (resume) => set({ resume }),
    interviewBest: null,
    setInterviewBest: (score) =>
      set((s) => {
        s.interviewBest = Math.max(s.interviewBest ?? 0, score);
      }),
    history: [],
    addHistory: (entry) =>
      set((s) => {
        const seen = new Set<string>();
        s.history = [entry, ...s.history]
          .filter((e) => {
            if (seen.has(e.date)) return false;
            seen.add(e.date);
            return true;
          })
          .slice(0, 20);
      }),

    user: null,
    setUser: (user) => set({ user }),
    authReady: false,
    setAuthReady: (authReady) => set({ authReady }),
    syncState: 'idle',
    setSyncState: (syncState) => set({ syncState }),
    cloudRestoreInFlight: false,
    setCloudRestoreInFlight: (cloudRestoreInFlight) => set({ cloudRestoreInFlight }),

    resetJourney: () =>
      set((s) => {
        s.role = null;
        s.levels = {};
        s.completedTasks = new Set();
        s.completedResources = new Set();
        s.completedProjects = new Set();
        s.completedCerts = new Set();
        s.interviewBest = null;
        s.maxReached = 0;
        s.step = 'role';
        s.resume = { ...EMPTY_RESUME };
        s.history = [];
      }),

    restoreLocal: () => {
      const local = loadLocal();
      if (!local) return;
      const catalogRole = local.roleId ? ROLE_CATALOG.find((c) => c.role.id === local.roleId)?.role ?? null : null;
      set((s) => {
        s.role = catalogRole;
        s.levels = local.levels;
        s.completedTasks = new Set(local.completedTasks);
        s.completedResources = new Set(local.completedResources);
        s.completedProjects = new Set(local.completedProjects);
        s.completedCerts = new Set(local.completedCerts);
        s.resume = local.resume;
        s.interviewBest = local.interviewBest;
        s.maxReached = local.maxReached;
        s.step = local.step;
        s.history = local.history;
      });
    },

    restoreCloud: async (uid) => {
      set({ syncState: 'loading', cloudRestoreInFlight: true });
      try {
        const p = await loadProgress(uid);
        if (!p) {
          // A missing cloud record is a new account, not permission to upload
          // another account's cached local state.
          set((s) => {
            s.role = null;
            s.levels = {};
            s.completedTasks = new Set();
            s.completedResources = new Set();
            s.completedProjects = new Set();
            s.completedCerts = new Set();
            s.resume = { ...EMPTY_RESUME };
            s.interviewBest = null;
            s.maxReached = 0;
            s.history = [];
            s.step = 'role';
          });
          set({ syncState: 'idle', cloudRestoreInFlight: false });
          return;
        }
        const catalogRole = p.roleId ? ROLE_CATALOG.find((c) => c.role.id === p.roleId)?.role ?? null : null;
        set((s) => {
          s.role = catalogRole;
          s.levels = p.levels ?? {};
          s.completedTasks = new Set(p.completedTasks ?? []);
          s.completedResources = new Set(p.completedResources ?? []);
          s.completedProjects = new Set(p.completedProjects ?? []);
          s.completedCerts = new Set(p.completedCerts ?? []);
          s.resume = { ...EMPTY_RESUME, ...p.resume };
          s.interviewBest = p.interviewBest ?? null;
          s.maxReached = p.maxReached ?? 0;
          s.history = [...(p.history ?? [])].slice(0, 20);
          s.step = catalogRole ? (p.step ?? 'role') : 'role';
          s.syncState = 'synced';
          s.cloudRestoreInFlight = false;
        });
      } catch (err) {
        console.error('[Auth] Cloud restore failed:', err);
        set({ syncState: 'error', cloudRestoreInFlight: false });
      }
    },

    saveCloud: async (uid) => {
      const s = get();
      if (s.cloudRestoreInFlight) return;
      set({ syncState: 'saving' });
      const progress: CloudProgress = {
        roleId: s.role?.id ?? null,
        levels: s.levels,
        completedTasks: [...s.completedTasks],
        completedResources: [...s.completedResources],
        completedProjects: [...s.completedProjects],
        completedCerts: [...s.completedCerts],
        resume: s.resume,
        interviewBest: s.interviewBest,
        maxReached: s.maxReached,
        history: s.history,
        step: s.step,
      };
      try {
        await saveProgress(uid, progress);
        set({ syncState: 'synced' });
      } catch (err) {
        console.error('[Auth] Cloud save failed:', err);
        set({ syncState: 'error' });
      }
    },
  })),
);

