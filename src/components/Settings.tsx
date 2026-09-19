import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { clearLocal } from '../lib/storage';
import { deleteProgress, signOutUser } from '../lib/firebase';

function ThemeSection() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  return (
    <div className="card p-6 space-y-3">
      <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>🎨 Appearance</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Theme</div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Switch between light and dark mode.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme" />
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const resetJourney = useAppStore((s) => s.resetJourney);
  const user = useAppStore((s) => s.user);
  const setSyncState = useAppStore((s) => s.setSyncState);
  const [tone, setTone] = useState<'friendly' | 'strict' | 'challenging'>('friendly');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notif, setNotif] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const handleClearData = async () => {
    if (confirm('Are you sure? This cannot be undone.')) {
      if (user) {
        try { await deleteProgress(user.uid); } catch { setSyncState('error'); return; }
      }
      resetJourney(); clearLocal(); window.location.reload();
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOutUser(); setSyncState('idle'); } catch { /* */ }
    setSigningOut(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">Preferences</div>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-5">
        <ThemeSection />

        <div className="card p-6 space-y-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>👤 Account</h3>
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {(user.displayName ?? user.email ?? 'U').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.displayName ?? 'User'}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>
              <button onClick={handleSignOut} disabled={signingOut} className="btn btn-danger w-full py-2.5">
                {signingOut ? 'Signing out…' : '🚪 Sign Out'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not signed in.</p>
          )}
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900">🤖 Coach Tone</h3>
          <div className="flex gap-2">
            {(['friendly', 'strict', 'challenging'] as const).map((t) => (
              <button key={t} onClick={() => setTone(t)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                  tone === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900">🔊 Voice</h3>
          <div className="flex items-center justify-between">
            <div><div className="text-sm font-bold text-slate-700">Auto-speak questions</div><p className="text-xs text-slate-500">Browser TTS reads questions aloud.</p></div>
            <button onClick={() => setVoiceEnabled(!voiceEnabled)} role="switch" aria-checked={voiceEnabled}
              className={`relative h-6 w-11 rounded-full transition ${voiceEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${voiceEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900">🔔 Notifications</h3>
          <div className="flex items-center justify-between">
            <div><div className="text-sm font-bold text-slate-700">Learning reminders</div><p className="text-xs text-slate-500">Get notified to continue your roadmap.</p></div>
            <button onClick={() => setNotif(!notif)} role="switch" aria-checked={notif}
              className={`relative h-6 w-11 rounded-full transition ${notif ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${notif ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="card p-6 space-y-3 border-red-200">
          <h3 className="text-base font-bold text-red-600">🚨 Danger Zone</h3>
          <p className="text-xs text-slate-500">Irreversible. Clears all local data.</p>
          <button onClick={handleClearData} className="btn btn-danger">Reset All Data</button>
        </div>
      </div>
    </div>
  );
}
