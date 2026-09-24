import { lazy, Suspense, useEffect } from 'react';
import { useAppStore } from './lib/store';
import { usePersistence } from './lib/usePersistence';
import { useReadiness } from './lib/useReadiness';
import { interviewRoleIdFor } from './data/roleFactory';
import Stepper from './components/Stepper';

const Landing = lazy(() => import('./components/Landing'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const RoleSelect = lazy(() => import('./components/RoleSelect'));
const Assessment = lazy(() => import('./components/Assessment'));
const Roadmap = lazy(() => import('./components/Roadmap'));

const ResumeBuilder = lazy(() => import('./components/ResumeBuilder'));
const Readiness = lazy(() => import('./components/Readiness'));
const Jobs = lazy(() => import('./components/Jobs'));
const InterviewHub = lazy(() => import('./components/interview/InterviewHub'));

const AtsChecker = lazy(() => import('./components/AtsChecker'));
const CodingPractice = lazy(() => import('./components/CodingPractice'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));


function Loader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

function useScrollTopOnViewChange() {
  const view = useAppStore((s) => s.view);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);
}

export default function App() {
  usePersistence();
  useScrollTopOnViewChange();

  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const pendingView = useAppStore((s) => s.pendingView);
  const setPendingView = useAppStore((s) => s.setPendingView);
  const user = useAppStore((s) => s.user);
  const authReady = useAppStore((s) => s.authReady);
  const syncState = useAppStore((s) => s.syncState);

  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);
  const maxReached = useAppStore((s) => s.maxReached);
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const levels = useAppStore((s) => s.levels);
  const setSkillLevel = useAppStore((s) => s.setSkillLevel);
  const completedTasks = useAppStore((s) => s.completedTasks);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const completedResources = useAppStore((s) => s.completedResources);
  const toggleResource = useAppStore((s) => s.toggleResource);
  const completedProjects = useAppStore((s) => s.completedProjects);
  const toggleProject = useAppStore((s) => s.toggleProject);
  const completedCerts = useAppStore((s) => s.completedCerts);
  const toggleCert = useAppStore((s) => s.toggleCert);
  const resume = useAppStore((s) => s.resume);
  const setResume = useAppStore((s) => s.setResume);
  const history = useAppStore((s) => s.history);
  const addHistory = useAppStore((s) => s.addHistory);
  const resetJourney = useAppStore((s) => s.resetJourney);

  const breakdown = useReadiness();
  const resumeSkills = resume.skills.split(',').map((s) => s.trim()).filter(Boolean);

  const enterGated = (dest: 'journey' | 'studio') => {
    if (dest === 'journey') setStep('role');
    if (user) {
      setView(dest);
    } else {
      setPendingView(dest);
      setView('auth');
    }
  };

  const accountWidget = (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {user ? (
        <div className="card flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3 text-xs shadow-sm">
          <span className={`h-2 w-2 rounded-full ${syncState === 'synced' ? 'bg-green-500' : syncState === 'error' ? 'bg-red-500' : 'bg-slate-300'}`} />
          <span className="font-bold text-slate-500">
            {syncState === 'saving' ? 'Saving…' : syncState === 'error' ? 'Error' : 'Synced'}
          </span>
        </div>
      ) : (
        authReady && (
          <button onClick={() => setView('auth')} className="btn btn-ghost text-xs shadow-sm">
            ☁️ Sign in
          </button>
        )
      )}
    </div>
  );

  if (view === 'landing') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg)' }} />}>
        <Landing
          onStart={() => enterGated('journey')}
          onStudio={() => enterGated('studio')}
          onSignIn={() => setView('auth')}
          userLabel={user ? user.displayName ?? user.email : null}
        />
        {accountWidget}
      </Suspense>
    );
  }

  if (view === 'auth') {
    return (
      <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg-alt)' }} />}>
        <AuthPage
          destinationLabel={pendingView === 'journey' ? 'your Career Journey' : 'the AI Interview Studio'}
          onBack={() => setView('landing')}
        />
        {accountWidget}
      </Suspense>
    );
  }





  if (view === 'studio') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-alt)' }}>
        <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
            <button onClick={() => setView('landing')} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-sm" style={{ background: 'var(--primary)' }}>🚀</div>
              <span className="text-sm font-extrabold" style={{ color: 'var(--text)' }}>CareerPath <span style={{ color: 'var(--primary)' }}>AI</span></span>
            </button>
            <span className="badge badge-blue">{user ? user.displayName ?? user.email : 'Interview Studio'}</span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 fade-in">
          <Suspense fallback={<Loader />}>
            <InterviewHub
              resumeSkills={resumeSkills}
              resumeProjects={resume.projects}
              history={history}
              onResult={(overall, roleTitle, formatName) => {
                useAppStore.getState().setInterviewBest(overall);
                addHistory({ date: new Date().toISOString(), roleTitle, formatName, overall });
                import('./lib/firebase').then(({ track }) => track('interview_completed', { overall, role: roleTitle, format: formatName }));
              }}
              onExit={() => setView('landing')}
            />
          </Suspense>
        </main>
        {accountWidget}
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex" style={{ background: 'var(--bg-alt)' }}>
      <Stepper
        current={step}
        maxReached={maxReached}
        onNavigate={setStep}
        roleTitle={role?.title}
        readiness={breakdown.total}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 lg:py-10 fade-in">
        <Suspense fallback={<Loader />}>
          {view === 'journey' && (
            <>
              {!role && step !== 'role' && (
                <RoleSelect
                  selected={null}
                  onSelect={setRole}
                  onNext={() => setStep('assessment')}
                />
              )}
              {step === 'role' && (
                <RoleSelect
                  selected={role}
                  onSelect={setRole}
                  onNext={() => setStep('assessment')}
                />
              )}
              {step === 'assessment' && role && (
                <Assessment
                  role={role}
                  levels={levels}
                  setLevels={setSkillLevel}
                  onNext={() => setStep('roadmap')}
                  onBack={() => setStep('role')}
                />
              )}
              {step === 'roadmap' && role && (
                <Roadmap
                  role={role}
                  levels={levels}
                  completedTasks={completedTasks}
                  completedResources={completedResources}
                  completedProjects={completedProjects}
                  completedCerts={completedCerts}
                  toggleTask={toggleTask}
                  toggleResource={toggleResource}
                  toggleProject={toggleProject}
                  toggleCert={toggleCert}
                  onNext={() => setStep('resume')}
                />
              )}
              {step === 'resume' && role && (
                <ResumeBuilder role={role} resume={resume} setResume={setResume} onNext={() => setStep('interview')} />
              )}
              {step === 'interview' && role && (
                <InterviewHub
                  defaultRoleId={interviewRoleIdFor(role.id)}
                  resumeSkills={resumeSkills}
                  resumeProjects={resume.projects}
                  history={history}
                  onResult={(overall, roleTitle, formatName) => {
                    useAppStore.getState().setInterviewBest(overall);
                    addHistory({ date: new Date().toISOString(), roleTitle, formatName, overall });
                    import('./lib/firebase').then(({ track }) => track('interview_completed', { overall, role: roleTitle, format: formatName }));
                  }}
                  onExit={() => setStep('readiness')}
                />
              )}
              {step === 'readiness' && role && (
                <Readiness breakdown={breakdown} onNext={() => setStep('jobs')} goTo={setStep} />
              )}
              {step === 'jobs' && role && (
                <Jobs role={role} readiness={breakdown.total} onRestart={resetJourney} />
              )}
            </>
          )}

          {view === 'ats' && (
            <AtsChecker
              role={role}
              resume={resume}
              onOpenResume={() => {
                setView('journey');
                setStep(role ? 'resume' : 'role');
              }}
            />
          )}

          {view === 'coding' && (
            <CodingPractice role={role} />
          )}

          {view === 'profile' && (
            <Profile />
          )}

          {view === 'settings' && (
            <Settings />
          )}


        </Suspense>
      </main>
      {accountWidget}
    </div>
  );
}
