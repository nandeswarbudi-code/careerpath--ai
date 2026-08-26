/**
 * Bridges Zustand state with localStorage and Firestore.
 * Local persistence is synchronous; cloud sync debounced.
 */
import { useEffect, useRef } from 'react';
import { watchAuth, track } from './firebase';
import { saveLocal } from './storage';
import { useAppStore } from './store';



export function usePersistence() {
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  // Local restore on mount
  useEffect(() => {
    useAppStore.getState().restoreLocal();
    hydratedRef.current = true;
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (!hydratedRef.current) return;
    return useAppStore.subscribe((s) => {
      saveLocal({
        v: 2,
        roleId: s.role?.id ?? null,
        levels: s.levels,
        completedTasks: [...s.completedTasks],
        completedResources: [...s.completedResources],
        completedProjects: [...s.completedProjects],
        completedCerts: [...s.completedCerts],
        resume: s.resume,
        interviewBest: s.interviewBest,
        maxReached: s.maxReached,
        step: s.step,
        history: s.history,
      });
    });
  }, []);

  // Auth watcher + auto-forward from auth page
  useEffect(() => {
    const unsub = watchAuth((u) => {
      const store = useAppStore.getState();
      store.setUser(u ? { uid: u.uid, displayName: u.displayName, email: u.email } : null);
      store.setAuthReady(true);
    });
    return unsub;
  }, []);

  // Auto-forward after sign-in on auth page
  useEffect(() => {
    return useAppStore.subscribe((s, prev) => {
      if (s.user && !prev.user && s.view === 'auth') {
        s.setView(s.pendingView);
      }
      // Kick out to auth gate if signed out while in gated view
      if (s.authReady && !s.user && (s.view === 'journey' || s.view === 'studio')) {
        s.setPendingView(s.view);
        s.setView('auth');
      }
    });
  }, []);

  // Cloud restore on sign-in
  useEffect(() => {
    const store = useAppStore.getState();
    if (!store.user) return;
    void store.restoreCloud(store.user.uid);
  }, [useAppStore((s) => s.user?.uid)]);

  // Debounced cloud save
  useEffect(() => {
    const store = useAppStore.getState();
    if (!store.user) return;
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void store.saveCloud(store.user!.uid);
    }, 1200);
    return () => {
      if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    };
  }, [
    useAppStore((s) => s.user?.uid),
    useAppStore((s) => s.role?.id),
    useAppStore((s) => s.levels),
    useAppStore((s) => s.completedTasks),
    useAppStore((s) => s.completedResources),
    useAppStore((s) => s.completedProjects),
    useAppStore((s) => s.completedCerts),
    useAppStore((s) => s.resume),
    useAppStore((s) => s.interviewBest),
    useAppStore((s) => s.maxReached),
    useAppStore((s) => s.history),
  ]);

  // Analytics tracking
  useEffect(() => {
    return useAppStore.subscribe((s) => {
      track('screen_view', {
        screen: s.view === 'journey' ? `journey_${s.step}` : s.view,
      });
    });
  }, []);

}
