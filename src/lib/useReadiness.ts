import { useMemo } from 'react';
import { resumeCompleteness } from '../components/ResumeBuilder';
import { useAppStore } from './store';

export interface ReadinessBreakdown {
  skills: number;
  roadmap: number;
  resources: number;
  projects: number;
  resume: number;
  interview: number;
  total: number;
}

export function useReadiness(): ReadinessBreakdown {
  const role = useAppStore((s) => s.role);
  const levels = useAppStore((s) => s.levels);
  const completedTasks = useAppStore((s) => s.completedTasks);
  const completedResources = useAppStore((s) => s.completedResources);
  const completedProjects = useAppStore((s) => s.completedProjects);
  const completedCerts = useAppStore((s) => s.completedCerts);
  const resume = useAppStore((s) => s.resume);
  const interviewBest = useAppStore((s) => s.interviewBest);

  return useMemo(() => {
    if (!role) {
      return { skills: 0, roadmap: 0, resources: 0, projects: 0, resume: 0, interview: 0, total: 0 };
    }

    const skillPct = Math.round(
      (role.skills.reduce((sum, s) => sum + Math.min(levels[s.id] ?? 0, s.requiredLevel) / s.requiredLevel, 0) /
        role.skills.length) *
        100,
    );

    const allTasks = role.phases.flatMap((p) => p.tasks);
    const fastTrack = (skillId: string): boolean => {
      const sk = role.skills.find((s) => s.id === skillId);
      return sk ? (levels[skillId] ?? 0) >= sk.requiredLevel : false;
    };

    const roadmapDone = allTasks.filter((t) => completedTasks.has(t.id) || fastTrack(t.skillId)).length;
    const roadmapPct = Math.round((roadmapDone / allTasks.length) * 100);

    const resourcesDone = allTasks.filter((t) => completedResources.has(t.id)).length;
    const resourcesPct = Math.round((resourcesDone / allTasks.length) * 100);

    const totalItems = role.projects.length + role.certifications.length;
    const projectsPct = Math.round(((completedProjects.size + completedCerts.size) / totalItems) * 100);

    const resumePct = resumeCompleteness(resume);
    const interviewPct = interviewBest ?? 0;

    const total = Math.round(
      skillPct * 0.2 + roadmapPct * 0.2 + resourcesPct * 0.1 + projectsPct * 0.2 + resumePct * 0.15 + interviewPct * 0.15,
    );

    return {
      skills: skillPct,
      roadmap: roadmapPct,
      resources: resourcesPct,
      projects: projectsPct,
      resume: resumePct,
      interview: interviewPct,
      total,
    };
  }, [role, levels, completedTasks, completedResources, completedProjects, completedCerts, resume, interviewBest]);
}
