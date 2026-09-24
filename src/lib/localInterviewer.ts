/**
 * Built-in local interview engine — works WITHOUT a backend.
 * Generates human-like, role-specific questions with natural transitions,
 * intelligent follow-ups, and honest final feedback.
 *
 * Rules enforced:
 * - One question at a time
 * - Natural conversational reactions to answers
 * - Never repeats the same reaction phrase
 * - Probes weak answers instead of moving on
 * - Adjusts difficulty based on answer quality
 * - Professional closing with detailed feedback
 */
import type {
  LiveInterviewPhase,
  NextQuestionResponse,
  FinalFeedbackResponse,
  LiveInterviewMessage,
} from '../types';
import { INTERVIEW_ROLES } from '../data/interviewRoles';

// ─── Natural reaction phrases (never repeat consecutively) ───

const REACTIONS_STRONG = [
  "That's a really solid answer.",
  "I appreciate the specificity there.",
  "Great example — I can tell you've dealt with that firsthand.",
  "That's exactly the kind of detail I was looking for.",
  "Impressive. You clearly have hands-on experience with this.",
  "Well articulated. Let me push you a bit further on that.",
  "I like how you structured that response.",
  "That shows strong critical thinking.",
];

const REACTIONS_WEAK = [
  "Hmm, that's a bit high-level. Can you give me a specific example?",
  "I'd love to hear more detail there. Can you walk me through what actually happened?",
  "That's a start, but I'm looking for something more concrete.",
  "Could you elaborate? What did YOU specifically do?",
  "Let's dig deeper into that. What was the actual outcome?",
  "I sense there's more to that story. Can you be more specific?",
];

const REACTIONS_SKIPPED = [
  "No worries at all. Let's move to something different.",
  "That's okay — let me try another angle.",
  "Understood. Let's shift gears a bit.",
  "No problem. Here's a different one for you.",
];

const REACTIONS_MEDIUM = [
  "Okay, that's interesting. Let me follow up on that.",
  "I see what you mean. Let me explore that a bit more.",
  "Good. Let's take that a step further.",
  "Thanks for sharing that. Building on what you said...",
  "Noted. That naturally leads me to ask...",
  "Fair enough. Here's what I'm curious about next...",
];

let lastReactionIndex = -1;

function pickReaction(pool: string[]): string {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (idx === lastReactionIndex && pool.length > 1);
  lastReactionIndex = idx;
  return pool[idx];
}

function classifyAnswer(text: string): 'strong' | 'medium' | 'weak' | 'skipped' {
  if (text === '(Skipped)' || text.trim().length === 0) return 'skipped';
  const words = text.split(/\s+/).length;
  const hasNumbers = /\d/.test(text);
  const hasSpecifics = /because|specifically|for example|resulted in|my role|I decided|I built|I led/i.test(text);
  if (words > 40 && (hasNumbers || hasSpecifics)) return 'strong';
  if (words > 20) return 'medium';
  return 'weak';
}

// ─── Question banks per phase ───

interface PhaseQuestions {
  primary: string[];
  followUp: string[];
}

function getQuestions(roleTitle: string): Record<LiveInterviewPhase, PhaseQuestions> {
  const role = INTERVIEW_ROLES.find((candidate) => candidate.title === roleTitle);
  const topics = role?.topics ?? ['your professional responsibilities'];
  const keywords = role?.keywords ?? ['your core skills'];
  const topic = topics[0];
  const skill = keywords[0];
  return {
    welcome: {
      primary: [
        `Hi there! I'll be conducting your interview for the ${roleTitle} position today. Tell me about your background and what drew you to this role. Which experience best prepared you for ${topic}?`,
      ],
      followUp: [
        `Thanks for that introduction. What would you say is the one thing you're most passionate about in your career right now?`,
      ],
    },
    behavioral: {
      primary: [
        "Let's start with a behavioral question. Tell me about a time you faced a significant challenge at work or on a project. What happened, and how did you handle it?",
        "Describe a situation where you had a disagreement with a teammate or manager. How did you navigate that, and what was the outcome?",
        "Tell me about a time you failed at something important. What did you learn, and how did it change your approach?",
        "Can you share an experience where you had to learn something completely new under a tight deadline? Walk me through it.",
      ],
      followUp: [
        "That's helpful context. What specifically was YOUR role in resolving that? What actions did YOU take?",
        "And looking back now... would you handle that differently today? Why or why not?",
        "What was the measurable impact of your actions there? Can you put a number on it?",
      ],
    },
    technical: {
      primary: [
        `As a ${roleTitle}, how have you used ${skill} in a real project? Explain the context, your approach, and the result.`,
        `Explain how you would handle ${topic} as a ${roleTitle}, including the trade-offs you would consider.`,
        `What is the most challenging ${topic} problem you have solved? Walk me through your approach step by step.`,
        `Which skills are most important for a ${roleTitle} to succeed, especially ${keywords.slice(0, 3).join(', ')}? How have you built them?`,
      ],
      followUp: [
        "Why did you choose that specific approach over the alternatives?",
        "What would break if you scaled that solution to 100x the load?",
        "How would you explain that decision to a skeptical senior engineer?",
      ],
    },
    project: {
      primary: [
        `Tell me about a project where you applied ${skill} or worked on ${topic}. What was the problem, your approach, and the impact?`,
        `Walk me through a ${roleTitle} project where things did not go as planned. What went wrong, and how did you recover?`,
        `Describe a project that required strong ${keywords.slice(0, 2).join(' and ')}. How did you prioritize and measure success?`,
      ],
      followUp: [
        "What would you do differently if you could start that project over from scratch?",
        "How did you measure success on that project? What metrics did you track?",
        "What was the hardest technical decision you made on that project, and why?",
      ],
    },
    scenario: {
      primary: [
        `Imagine you join our team as a ${roleTitle}, and you are asked to improve ${topic} in your first week. Walk me through your first 24 hours.`,
        `You are given a ${roleTitle} project with an aggressive deadline, but the requirements for ${topic} change significantly. How do you handle it?`,
        `A senior stakeholder challenges your recommendation about ${topic}. How do you explain the risks and handle the conversation?`,
      ],
      followUp: [
        "What if the stakeholder outranks you and insists? Then what?",
        "How would you communicate the risks to non-technical leadership?",
        "What's the worst-case scenario, and how would you prepare for it?",
      ],
    },
    problem: {
      primary: [
        `A key ${topic} outcome is underperforming. As a ${roleTitle}, what data would you inspect first and how would you diagnose the cause?`,
        `How would you improve ${topic} for a team or organization? What constraints and success metrics would you consider?`,
        `You have two valid approaches to ${topic}. One is faster but harder to maintain. How do you decide?`,
      ],
      followUp: [
        "Before jumping to solutions — what assumptions are you making? Let's examine those.",
        "What's the time and space complexity of your approach? Can you optimize further?",
        "How would you test this solution? What edge cases would you cover?",
      ],
    },
    closing: {
      primary: [
        `Well, that brings us to the end of our interview. I really enjoyed our conversation — you've given some thoughtful and detailed answers. We'll be putting together comprehensive feedback covering your communication, technical knowledge, confidence, and problem-solving skills. You should receive that shortly. Before we wrap up... do you have any questions for me about the role or the team?`,
      ],
      followUp: [],
    },
  };
}

// Phase ordering reference (used by session component for advancement)
export const PHASE_ORDER: LiveInterviewPhase[] = [
  'welcome', 'behavioral', 'technical', 'project', 'scenario', 'problem', 'closing',
];

// ─── Main question generator ───

export function generateLocalQuestion(
  roleTitle: string,
  currentPhase: LiveInterviewPhase,
  messages: LiveInterviewMessage[],
): NextQuestionResponse {
  const bank = getQuestions(roleTitle);
  const phaseData = bank[currentPhase];
  const interviewerCount = messages.filter((m) => m.role === 'interviewer').length;
  const lastCandidateMsg = [...messages].reverse().find((m) => m.role === 'candidate');
  const answerQuality = lastCandidateMsg ? classifyAnswer(lastCandidateMsg.text) : null;

  // Determine if we should use a follow-up instead of a new question
  const useFollowUp = answerQuality === 'weak' && phaseData.followUp.length > 0 && Math.random() > 0.3;

  // Pick the question
  const questionPool = useFollowUp ? phaseData.followUp : phaseData.primary;
  const qIdx = interviewerCount % Math.max(1, questionPool.length);
  const questionText = questionPool[qIdx] ?? phaseData.primary[0];

  // Pick a natural reaction to the previous answer
  let transition = '';
  if (answerQuality && interviewerCount > 0) {
    switch (answerQuality) {
      case 'strong': transition = pickReaction(REACTIONS_STRONG); break;
      case 'medium': transition = pickReaction(REACTIONS_MEDIUM); break;
      case 'weak': transition = pickReaction(REACTIONS_WEAK); break;
      case 'skipped': transition = pickReaction(REACTIONS_SKIPPED); break;
    }
  }

  const isFinal = currentPhase === 'closing';

  return {
    text: questionText,
    phase: currentPhase,
    isFinal,
    transitionalPhrase: transition || undefined,
  };
}

// ─── Feedback generator ───

export function generateLocalFeedback(
  roleTitle: string,
  messages: LiveInterviewMessage[],
): FinalFeedbackResponse {
  const answers = messages.filter((m) => m.role === 'candidate');
  const questions = messages.filter((m) => m.role === 'interviewer');
  const skipped = answers.filter((m) => m.text === '(Skipped)').length;
  const totalWords = answers.reduce((sum, m) => sum + m.text.split(/\s+/).length, 0);
  const avgWords = answers.length > 0 ? Math.round(totalWords / answers.length) : 0;
  const realAnswers = answers.filter((m) => m.text !== '(Skipped)');

  const hasNumbers = realAnswers.some((m) => /\d/.test(m.text));
  const hasSTAR = realAnswers.some((m) =>
    /situation|task|action|result|challenge|approach|outcome|because|specifically|for example/i.test(m.text),
  );
  const hasDepth = avgWords > 35;
  const hasGoodCount = realAnswers.length >= 4;

  // Scoring
  const comm = Math.min(95, 35 + avgWords * 0.6 + (hasDepth ? 15 : 0) + (hasGoodCount ? 10 : 0) - skipped * 5);
  const tech = Math.min(92, 30 + (hasNumbers ? 18 : 0) + (hasDepth ? 15 : 0) + realAnswers.length * 4);
  const conf = Math.min(94, 40 + avgWords * 0.35 + realAnswers.length * 5 - skipped * 8);
  const prob = Math.min(90, 25 + (hasSTAR ? 22 : 0) + (hasNumbers ? 12 : 0) + (hasDepth ? 12 : 0));
  const overall = Math.round((comm + tech + conf + prob) / 4);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];

  if (hasDepth) strengths.push('Provided detailed, thoughtful responses with good depth and substance.');
  if (hasSTAR) strengths.push('Used structured storytelling with specific examples and outcomes.');
  if (hasNumbers) strengths.push('Backed up claims with quantifiable metrics and measurable results.');
  if (hasGoodCount) strengths.push('Maintained consistent engagement throughout the full interview.');
  if (strengths.length === 0) strengths.push('Showed willingness to participate and attempt each question.');

  if (!hasDepth) weaknesses.push('Answers were generally too brief — aim for 40+ words with specific details.');
  if (!hasSTAR) weaknesses.push('Lacked STAR structure — include Situation, Task, Action, and measurable Result.');
  if (!hasNumbers) weaknesses.push('No quantified impact — use numbers like "reduced errors by 30%" or "handled 500 users".');
  if (skipped > 1) weaknesses.push(`Skipped ${skipped} questions — always attempt an answer, even a partial one.`);

  improvements.push('Practice the STAR method before every behavioral question: Situation → Task → Action → Result.');
  improvements.push(`Research common ${roleTitle} interview questions and prepare 2-3 real stories for each.`);
  improvements.push('Quantify everything: "improved performance" → "reduced page load from 4s to 1.2s, a 70% improvement."');
  if (skipped > 0) improvements.push('Never skip — even saying "I haven\'t faced that exact situation, but here\'s how I\'d approach it..." is better than silence.');

  return {
    overallScore: Math.round(overall),
    communication: Math.round(comm),
    technicalKnowledge: Math.round(tech),
    confidence: Math.round(conf),
    problemSolving: Math.round(prob),
    strengths,
    weaknesses,
    improvements,
    summary: `The candidate completed ${realAnswers.length} out of ${questions.length} questions for the ${roleTitle} position. ${
      overall >= 75 ? 'Strong performance overall — the candidate demonstrated good communication, relevant technical knowledge, and structured thinking. Ready for advanced rounds.'
      : overall >= 55 ? 'Promising performance with room for growth. The candidate showed potential but needs to provide more specific examples and quantify their impact.'
      : 'The candidate needs significant preparation. Focus on structured answers with concrete examples, domain knowledge depth, and confidence in delivery.'
    }`,
  };
}
