export interface Skill {
  id: string;
  name: string;
  requiredLevel: number; // 1-3
  category: string;
}

export interface RoadmapResource {
  name: string;
  url: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  skillId: string;
  /** Human-readable resource description. */
  resource: string;
  /** Clickable curated resource for this task. */
  resourceLink: RoadmapResource;
  hours: number;
}


export interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  hint: string;
  type: 'Technical' | 'Behavioral' | 'System Design';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  match: number;
  tags: string[];
}

export interface Role {
  id: string;
  title: string;
  icon: string;
  tagline: string;
  demand: string;
  color: string;
  skills: Skill[];
  phases: RoadmapPhase[];
  projects: Project[];
  certifications: Certification[];
  questions: InterviewQuestion[];
  jobs: Job[];
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  experienceYears: string;
  format: 'chronological' | 'combination' | 'functional';
  summary: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
}

export type StepId =
  | 'landing'
  | 'role'
  | 'assessment'
  | 'roadmap'
  | 'resume'
  | 'interview'
  | 'readiness'
  | 'jobs';

// ─── Live Interview types ───
export type LiveInterviewPhase = 'welcome' | 'behavioral' | 'technical' | 'project' | 'scenario' | 'problem' | 'closing';

export interface LiveInterviewMessage {
  role: 'interviewer' | 'candidate';
  text: string;
}

export interface LiveInterviewContext {
  roleTitle: string;
  format: 'video' | 'voice';
  resumeSummary?: string;
  messages: LiveInterviewMessage[];
  phase: LiveInterviewPhase;
}

export interface NextQuestionResponse {
  text: string;
  phase: LiveInterviewPhase;
  isFinal: boolean;
  transitionalPhrase?: string;
}

export interface FinalFeedbackResponse {
  overallScore: number;
  communication: number;
  technicalKnowledge: number;
  confidence: number;
  problemSolving: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

export interface VideoBehaviorMetrics {
  samples: number;
  faceVisiblePercent: number;
  centeredPercent: number;
  lookingForwardPercent: number;
  steadyPercent: number;
  status: 'measured' | 'unavailable';
}
