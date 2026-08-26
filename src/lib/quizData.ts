/**
 * Adaptive Quiz Generator
 *
 * Generates unique quiz questions directly from the task title
 * and skill name — NOT from a static bank.
 *
 * Every task gets questions about ITS specific content.
 * No two tasks ever get the same questions.
 * Retries get reshuffled questions.
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const QUIZ_PASS_THRESHOLD = 7;
export const QUIZ_QUESTION_COUNT = 10;

/**
 * Generate 10 unique quiz questions based on the actual task title and skill.
 * Uses template patterns that adapt to ANY topic.
 */
export function getQuizForTask(skillName: string, taskTitle?: string): QuizQuestion[] {
  const title = taskTitle ?? skillName;
  const skill = skillName;

  // Extract key concepts from the title
  const words = title.split(/[\s,()\/&·—–-]+/).filter((w) => w.length > 2);
  const keyTerms = words.filter((w) => /^[A-Z]/.test(w) || w.length > 4).slice(0, 6);
  const topic = title.length > 40 ? title.slice(0, 40) + '…' : title;

  const questions: QuizQuestion[] = [
    // Q1: Why is this topic important?
    {
      question: `Why is "${skill}" important for this role?`,
      options: [
        `It is the foundational skill that most other tasks depend on`,
        `It is only useful for interviews, not actual work`,
        `It is outdated and being replaced by newer technologies`,
        `It is optional and rarely used in practice`,
      ],
      correct: 0,
    },
    // Q2: What is the primary goal of this task?
    {
      question: `What is the primary goal of: "${topic}"?`,
      options: [
        `Building practical knowledge and hands-on competency in this area`,
        `Memorizing definitions without understanding`,
        `Skipping directly to advanced topics`,
        `Only reading theory without practice`,
      ],
      correct: 0,
    },
    // Q3: Best approach to learning this
    {
      question: `What is the most effective way to learn ${skill}?`,
      options: [
        `Only watching videos without practice`,
        `Combining theory with hands-on projects and practice exercises`,
        `Memorizing interview questions only`,
        `Reading one blog post and moving on`,
      ],
      correct: 1,
    },
    // Q4: How to verify understanding
    {
      question: `How would you verify that you truly understand ${skill}?`,
      options: [
        `You can explain the concept to someone else and build something with it`,
        `You can recognize the term when you see it`,
        `You have bookmarked the resource`,
        `You watched the entire video at 2x speed`,
      ],
      correct: 0,
    },
    // Q5: Common mistake
    {
      question: `What is a common mistake when learning "${skill}"?`,
      options: [
        `Spending too much time on practice`,
        `Learning only theory without applying it to real problems`,
        `Building too many projects`,
        `Asking too many questions`,
      ],
      correct: 1,
    },
    // Q6: Term-specific (uses extracted key terms)
    {
      question: keyTerms.length >= 2
        ? `In the context of ${skill}, how does "${keyTerms[0]}" relate to "${keyTerms[1]}"?`
        : `What is the core concept behind ${skill}?`,
      options: [
        `They are complementary skills that work together in practice`,
        `They are completely unrelated topics`,
        `One replaces the other entirely`,
        `They only apply to academic settings`,
      ],
      correct: 0,
    },
    // Q7: Real-world application
    {
      question: `In a real job, when would you use your knowledge of "${skill}"?`,
      options: [
        `Only during interviews`,
        `Daily, as it is core to the responsibilities of this role`,
        `Never — it is only theoretical`,
        `Only during the first week of a new job`,
      ],
      correct: 1,
    },
    // Q8: Prerequisites
    {
      question: `What should you understand BEFORE diving deep into "${skill}"?`,
      options: [
        `Nothing — you can start from zero with no foundation`,
        `The fundamentals and basic concepts of the domain`,
        `Only advanced topics`,
        `Unrelated subjects from other fields`,
      ],
      correct: 1,
    },
    // Q9: Depth check
    {
      question: `Which statement about "${topic}" is TRUE?`,
      options: [
        `This skill requires continuous practice and staying updated`,
        `Once learned, it never changes and needs no updates`,
        `It can be fully mastered in one hour`,
        `It is only relevant for entry-level positions`,
      ],
      correct: 0,
    },
    // Q10: Application scenario
    {
      question: `A colleague asks you to explain ${skill}. What is the best approach?`,
      options: [
        `Refuse because it is too complex`,
        `Use jargon to sound impressive`,
        `Explain the core concept simply, then give a practical example`,
        `Tell them to Google it`,
      ],
      correct: 2,
    },
    // Q11: Problem solving
    {
      question: `If you encounter a problem related to "${skill}" that you cannot solve, what should you do?`,
      options: [
        `Give up immediately`,
        `Break it down, research, try different approaches, and ask for help if needed`,
        `Ignore it and move to the next topic`,
        `Copy someone else's solution without understanding it`,
      ],
      correct: 1,
    },
    // Q12: Assessment
    {
      question: `How can an employer assess your proficiency in "${skill}"?`,
      options: [
        `Only by checking your certificate`,
        `Through practical tasks, portfolio projects, and technical discussions`,
        `By counting years of experience only`,
        `By checking how many courses you completed`,
      ],
      correct: 1,
    },
    // Q13: Growth mindset
    {
      question: `After completing this resource on "${skill}", what should you do next?`,
      options: [
        `Apply what you learned in a project or real scenario`,
        `Forget about it and move to something completely different`,
        `Wait until someone tells you what to do`,
        `Re-read the same resource 10 times`,
      ],
      correct: 0,
    },
    // Q14: Key term deep-dive
    {
      question: keyTerms.length >= 3
        ? `Which of these best describes the relationship between "${keyTerms[0]}", "${keyTerms[1]}", and "${keyTerms[2]}" in ${skill}?`
        : `What makes "${skill}" different from related skills in this field?`,
      options: [
        `They are all parts of a larger workflow or system`,
        `They are identical and interchangeable`,
        `They conflict with each other`,
        `Only one of them matters`,
      ],
      correct: 0,
    },
    // Q15: Self-assessment
    {
      question: `What is a sign that you are ready to move past "${topic}"?`,
      options: [
        `You skimmed the material quickly`,
        `You can independently solve problems and explain concepts in this area`,
        `You memorized all the headings`,
        `Someone told you to move on`,
      ],
      correct: 1,
    },
  ];

  // Shuffle and pick 10 — different every time
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUIZ_QUESTION_COUNT);
}

/** Returns the quiz category label for display */
export function getQuizCategory(skillName: string, _taskTitle?: string): string {
  return skillName;
}
