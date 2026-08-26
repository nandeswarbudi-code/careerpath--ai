import { useState } from 'react';
import type { FormatId, InterviewRole } from '../../data/interviewRoles';
import { FORMATS as ALL_FORMATS } from '../../data/interviewRoles';
import type { AnswerRecord } from '../../lib/interviewEngine';
import { summarize } from '../../lib/interviewEngine';
import type { InterviewHistoryEntry } from '../../lib/storage';
import InterviewSetup from './InterviewSetup';
import InterviewSession from './InterviewSession';
import InterviewReport from './InterviewReport';
import LiveInterviewSession from '../liveInterview/LiveInterviewSession';
import LiveInterviewReport from '../liveInterview/LiveInterviewReport';
import type { LiveInterviewMessage, FinalFeedbackResponse } from '../../types';

interface Props {
  defaultRoleId?: string;
  resumeSkills: string[];
  resumeProjects: string;
  /** Past sessions, newest first (shown on the setup screen). */
  history?: InterviewHistoryEntry[];
  /** Called when a classic report is generated — overall 0-100 plus session metadata. */
  onResult: (overall: number, roleTitle: string, formatName: string) => void;
  onExit: () => void;
}

type Phase =
  | { name: 'setup' }
  | { name: 'session'; role: InterviewRole; format: FormatId; useVideo: boolean }
  | { name: 'live'; role: InterviewRole; mode: 'video' | 'voice' }
  | { name: 'report'; role: InterviewRole; format: FormatId; records: AnswerRecord[] }
  | { name: 'live-report'; role: InterviewRole; mode: 'video' | 'voice'; messages: LiveInterviewMessage[]; feedback: FinalFeedbackResponse | null };

export default function InterviewHub({ defaultRoleId, resumeSkills, resumeProjects, history, onResult, onExit }: Props) {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });

  if (phase.name === 'setup') {
    return (
      <InterviewSetup
        defaultRoleId={defaultRoleId}
        hasResume={resumeSkills.length > 0 || resumeProjects.trim().length > 0}
        history={history}
        onStart={(role, format, useVideo) => setPhase({ name: 'session', role, format, useVideo })}
        onStartLive={(role, mode) => setPhase({ name: 'live', role, mode })}
        onBack={onExit}
      />
    );
  }

  if (phase.name === 'session') {
    return (
      <InterviewSession
        role={phase.role}
        format={phase.format}
        useVideo={phase.useVideo}
        resumeSkills={resumeSkills}
        resumeProjects={resumeProjects}
        onFinish={(records) => {
          const formatName = ALL_FORMATS.find((f) => f.id === phase.format)?.name ?? phase.format;
          onResult(summarize(records).overall, phase.role.title, formatName);
          setPhase({ name: 'report', role: phase.role, format: phase.format, records });
        }}
        onAbort={() => setPhase({ name: 'setup' })}
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
        onFinish={(messages, feedback) => {
          onResult(feedback?.overallScore ?? 0, phase.role.title, `Live AI ${phase.mode} Interview`);
          setPhase({ name: 'live-report', role: phase.role, mode: phase.mode, messages, feedback });
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
        onRetry={() => setPhase({ name: 'setup' })}
        onDone={onExit}
      />
    );
  }

  return (
    <InterviewReport
      role={phase.role}
      format={phase.format}
      records={phase.records}
      onRetry={() => setPhase({ name: 'setup' })}
      onDone={onExit}
    />
  );
}
