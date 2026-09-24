import { useState } from 'react';
import type { InterviewRole } from '../../data/interviewRoles';
import type { InterviewHistoryEntry } from '../../lib/storage';
import InterviewSetup from './InterviewSetup';
import LiveInterviewSession from '../liveInterview/LiveInterviewSession';
import LiveInterviewReport from '../liveInterview/LiveInterviewReport';
import type { LiveInterviewMessage, FinalFeedbackResponse } from '../../types';
import type { VideoBehaviorMetrics } from '../../types';

interface Props {
  defaultRoleId?: string;
  resumeSkills: string[];
  resumeProjects: string;
  /** Past sessions, newest first (shown on the setup screen). */
  history?: InterviewHistoryEntry[];
  /** Called when a live report is generated — overall 0-100 plus session metadata. */
  onResult: (overall: number, roleTitle: string, formatName: string) => void;
  onExit: () => void;
}

type Phase =
  | { name: 'setup' }
  | { name: 'live'; role: InterviewRole; mode: 'video' | 'voice' }
  | { name: 'live-report'; role: InterviewRole; mode: 'video' | 'voice'; messages: LiveInterviewMessage[]; feedback: FinalFeedbackResponse | null; videoMetrics: VideoBehaviorMetrics | null };

export default function InterviewHub({ defaultRoleId, resumeSkills, resumeProjects, history, onResult, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });

  if (phase.name === 'setup') {
    return (
      <InterviewSetup
        defaultRoleId={defaultRoleId}
        hasResume={resumeSkills.length > 0 || resumeProjects.trim().length > 0}
        history={history}
        onStartLive={(role, mode) => setPhase({ name: 'live', role, mode })}
        onBack={onExit}
      />
    );
  }

  if (phase.name === 'live') {
    return (
      <LiveInterviewSession
        role={phase.role}
        mode={phase.mode}
        resumeSkills={resumeSkills}
        resumeProjects={resumeProjects}
        onFinish={(messages, feedback, videoMetrics) => {
          onResult(feedback?.overallScore ?? 0, phase.role.title, `Live AI ${phase.mode} Interview`);
          setPhase({ name: 'live-report', role: phase.role, mode: phase.mode, messages, feedback, videoMetrics });
        }}
        onAbort={() => setPhase({ name: 'setup' })}
      />
    );
  }

  if (phase.name === 'live-report') {
    return (
      <LiveInterviewReport
        role={phase.role}
        mode={phase.mode}
        messages={phase.messages}
        feedback={phase.feedback}
        videoMetrics={phase.videoMetrics}
        onRetry={() => setPhase({ name: 'setup' })}
        onDone={onExit}
      />
    );
  }

  return null;
}
