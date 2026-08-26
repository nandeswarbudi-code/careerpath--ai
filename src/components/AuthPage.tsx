import { useState, type FormEvent } from 'react';
import { friendlyAuthError, signInWithEmail, signInWithGoogle, signUpWithEmail } from '../lib/firebase';

interface Props { destinationLabel: string; onBack: () => void; }

export default function AuthPage({ destinationLabel, onBack }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>, method: string) => {
    setBusy(true); setError(null);
    try {
      await fn();
      import('../lib/firebase').then(({ track }) => track('login', { method }));
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void run(() => (mode === 'signin' ? signInWithEmail(email, password) : signUpWithEmail(email, password)), 'password');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--bg-alt)' }}>
      <div className="w-full max-w-md fade-in">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm" style={{ background: 'var(--primary)' }}>🚀</div>
            <span className="font-extrabold" style={{ color: 'var(--text)' }}>CareerPath <span style={{ color: 'var(--primary)' }}>AI</span></span>
          </div>
          <button onClick={onBack} className="btn btn-ghost text-xs">← Home</button>
        </div>

        <div className="card p-7">
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--text)' }}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Continue to {destinationLabel}</p>

          <button onClick={() => void run(signInWithGoogle, 'google')} disabled={busy}
            className="mt-5 btn btn-ghost w-full justify-center gap-2 py-3">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
            <div className="divider flex-1" /> OR <div className="divider flex-1" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" />
            </div>
            {error && <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">⚠️ {error}</p>}
            <button type="submit" disabled={busy} className="btn btn-primary w-full py-3">
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {mode === 'signin' ? 'New here? ' : 'Have an account? '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="font-bold text-blue-600 hover:underline">
              {mode === 'signin' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
