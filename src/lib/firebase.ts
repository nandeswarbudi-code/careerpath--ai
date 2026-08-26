// Firebase initialization for CareerPath AI
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, type Analytics } from 'firebase/analytics';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import type { ResumeData } from '../types';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBBftuCD-ZQ6J-vJ0xGZxVKSB68jf2sZuE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'ai-interview-practice-pl-98fed.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL ?? 'https://ai-interview-practice-pl-98fed-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'ai-interview-practice-pl-98fed',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'ai-interview-practice-pl-98fed.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '1063054204495',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:1063054204495:web:2688a503d48390afb1543a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-X3JBPH26ZE',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics — only in supported environments (guards SSR/older browsers/blockers)
let analytics: Analytics | null = null;
void isSupported()
  .then((ok) => {
    if (ok) analytics = getAnalytics(app);
  })
  .catch(() => {
    /* analytics unavailable — non-fatal */
  });

/** Safe analytics event logger — a no-op when analytics is unavailable. */
export function track(eventName: string, params?: Record<string, string | number | boolean>): void {
  try {
    if (analytics) logEvent(analytics, eventName, params);
  } catch {
    /* never let analytics break the app */
  }
}

// ── Auth helpers ──────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function signInWithGoogle(): Promise<User> {
  return signInWithPopup(auth, googleProvider).then((cred) => cred.user);
}

export function signInWithEmail(email: string, password: string): Promise<User> {
  return signInWithEmailAndPassword(auth, email, password).then((cred) => cred.user);
}

export function signUpWithEmail(email: string, password: string): Promise<User> {
  return createUserWithEmailAndPassword(auth, email, password).then((cred) => cred.user);
}

export function signOutUser(): Promise<void> {
  return signOut(auth);
}

export function watchAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/** Converts Firebase auth error codes into friendly messages. */
export function friendlyAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-email': return 'That email address looks invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    case 'auth/email-already-in-use': return 'An account with this email already exists — try signing in.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/popup-closed-by-user': return 'Sign-in popup was closed before completing.';
    case 'auth/popup-blocked': return 'Your browser blocked the sign-in popup. Allow popups and retry.';
    case 'auth/network-request-failed': return 'Network error — check your connection and try again.';
    case 'auth/unauthorized-domain': return 'This domain is not authorized for Google sign-in. Add localhost or your deployed domain in Firebase Authentication > Settings > Authorized domains.';
    case 'auth/operation-not-allowed': return 'Google sign-in is not enabled in Firebase Authentication.';
    case 'auth/configuration-not-found': return 'Firebase Auth is not configured for this project. Check your Firebase project settings.';
    case 'auth/invalid-api-key': return 'Firebase API key is invalid or missing. Check your environment variables.';
    case 'auth/missing-client-identifier': return 'Google sign-in is missing required client configuration. Check the Firebase console setup.';
    default: return 'Sign-in failed. Please try again.';
  }
}

// ── Firestore progress sync ───────────────────────────────────

export interface InterviewHistoryEntry {
  date: string;
  roleTitle: string;
  formatName: string;
  overall: number;
}

export interface CloudProgress {
  roleId: string | null;
  levels: Record<string, number>;
  completedTasks: string[];
  completedResources: string[];
  completedProjects: string[];
  completedCerts: string[];
  resume: ResumeData;
  interviewBest: number | null;
  maxReached: number;
  history: InterviewHistoryEntry[];
}

export async function saveProgress(uid: string, progress: CloudProgress): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { ...progress, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function loadProgress(uid: string): Promise<CloudProgress | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data() as Partial<CloudProgress>;
  return {
    roleId: d.roleId ?? null,
    levels: d.levels ?? {},
    completedTasks: d.completedTasks ?? [],
    completedResources: d.completedResources ?? [],
    completedProjects: d.completedProjects ?? [],
    completedCerts: d.completedCerts ?? [],
    resume: {
      name: d.resume?.name ?? '', email: d.resume?.email ?? '', phone: d.resume?.phone ?? '',
      summary: d.resume?.summary ?? '', education: d.resume?.education ?? '',
      experience: d.resume?.experience ?? '', skills: d.resume?.skills ?? '', projects: d.resume?.projects ?? '',
    },
    interviewBest: d.interviewBest ?? null,
    maxReached: d.maxReached ?? 0,
    history: Array.isArray(d.history) ? d.history.slice(0, 20) : [],
  };
}

// ── Admin: read all users' progress from Firestore (client-side) ──

export interface AdminUserData {
  uid: string;
  roleId: string | null;
  readiness: number;
  interviewBest: number | null;
  interviewCount: number;
  maxReached: number;
  resume: { name: string; email: string };
  updatedAt: string | null;
}

/**
 * Fetch all user documents from the Firestore `users` collection.
 *
 * IMPORTANT: This requires Firestore security rules that allow
 * authenticated users to read the entire `users` collection:
 *
 *   match /users/{uid} {
 *     allow read: if request.auth != null;
 *     allow write: if request.auth != null && request.auth.uid == uid;
 *   }
 *
 * If the collection-wide read fails (permission denied), it falls back
 * to reading only the current user's own document.
 */
export async function fetchAllUsersProgress(): Promise<AdminUserData[]> {
  // First try: read the entire users collection
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (snap.docs.length > 0) {
      console.info(`[Admin] Read ${snap.docs.length} user docs from Firestore.`);
      return snap.docs.map(parseUserDoc);
    }
  } catch (err) {
    console.warn('[Admin] Collection-wide read failed (likely Firestore rules). Error:', err);
    console.warn('[Admin] Update your Firestore rules to: match /users/{uid} { allow read: if request.auth != null; }');
  }

  // Fallback: read only the current user's document
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const myDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (myDoc.exists()) {
        console.info('[Admin] Loaded current user doc only (collection read blocked).');
        return [parseUserDoc(myDoc)];
      }
    } catch (err2) {
      console.error('[Admin] Even own document read failed:', err2);
    }
  }

  return [];
}

function parseUserDoc(docSnap: { id: string; data: () => Record<string, unknown> }): AdminUserData {
  const d = docSnap.data() as Record<string, unknown>;
  const levels = (d.levels ?? {}) as Record<string, number>;
  const tasks = (d.completedTasks ?? []) as string[];
  const projects = (d.completedProjects ?? []) as string[];
  const certs = (d.completedCerts ?? []) as string[];
  const history = Array.isArray(d.history) ? d.history : [];
  const resume = (d.resume ?? {}) as Record<string, string>;

  const readiness = Math.min(100, Math.round(
    Object.keys(levels).length * 3 + tasks.length * 4 + (projects.length + certs.length) * 8
    + ((d.interviewBest as number) ?? 0) * 0.15 + ((d.maxReached as number) ?? 0) * 5
  ));

  return {
    uid: docSnap.id,
    roleId: (d.roleId as string) ?? null,
    readiness,
    interviewBest: (d.interviewBest as number) ?? null,
    interviewCount: history.length,
    maxReached: (d.maxReached as number) ?? 0,
    resume: { name: resume.name ?? '', email: resume.email ?? '' },
    updatedAt: typeof d.updatedAt === 'object' && d.updatedAt !== null && 'toDate' in d.updatedAt
      ? (d.updatedAt as { toDate: () => Date }).toDate().toISOString()
      : null,
  };
}

export interface FeedbackEntry {
  user: string;
  message: string;
  rating: number;
  date: string;
}

/** Fetch feedback from Firestore `feedback` collection. */
export async function fetchFeedback(): Promise<FeedbackEntry[]> {
  try {
    const q2 = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'), limit(20));
    const snap = await getDocs(q2);
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        user: d.userName ?? d.userEmail ?? 'Anonymous',
        message: d.message ?? '',
        rating: d.rating ?? 0,
        date: d.createdAt?.toDate?.()?.toISOString?.() ?? '',
      };
    });
  } catch {
    return [];
  }
}
