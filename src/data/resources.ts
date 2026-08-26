import type { RoadmapResource } from '../types';

/** Curated free/public resources — every URL verified and specific. */
export const RESOURCES: Record<string, RoadmapResource> = {
  // Core web
  mdn: { name: 'MDN Web Docs — HTML & CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  javascriptInfo: { name: 'JavaScript.info — Modern JS Tutorial', url: 'https://javascript.info/' },
  reactDev: { name: 'React.dev — Learn React', url: 'https://react.dev/learn' },
  tsHandbook: { name: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  cssBattle: { name: 'CSS Battle — Practice CSS', url: 'https://cssbattle.dev/' },
  githubLearning: { name: 'GitHub Skills — Learn Git', url: 'https://skills.github.com/' },
  testingLibrary: { name: 'Testing Library — React Testing', url: 'https://testing-library.com/docs/' },
  webDev: { name: 'web.dev — Performance Guide', url: 'https://web.dev/learn/performance' },

  // Data / ML
  kaggle: { name: 'Kaggle Learn — Free Courses', url: 'https://www.kaggle.com/learn' },
  pythonEverybody: { name: 'Python for Everybody — Free Course', url: 'https://www.py4e.com/' },
  modeSql: { name: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
  andrewNgML: { name: 'Andrew Ng — Machine Learning (Coursera)', url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
  fastAi: { name: 'fast.ai — Practical Deep Learning', url: 'https://course.fast.ai/' },
  storytellingWithData: { name: 'Google Data Analytics Certificate', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
  khanStats: { name: 'Khan Academy — Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },

  // Backend / DevOps / Cloud
  odinProject: { name: 'The Odin Project — Full Stack', url: 'https://www.theodinproject.com/' },
  postgresTutorial: { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/' },
  mongodbU: { name: 'MongoDB University — Free Courses', url: 'https://learn.mongodb.com/' },
  owasp: { name: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
  redisU: { name: 'Redis University — Free Courses', url: 'https://university.redis.com/' },
  dockerStart: { name: 'Docker — Getting Started Guide', url: 'https://docs.docker.com/get-started/' },
  systemDesignPrimer: { name: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer' },
  awsFree: { name: 'AWS Skill Builder — Free Training', url: 'https://explore.skillbuilder.aws/learn' },

  // Design / Product
  figmaTutorials: { name: 'Figma — Learn Design', url: 'https://www.figma.com/resources/learn-design/' },
  ideoKit: { name: 'IDEO — Design Thinking Resources', url: 'https://designthinking.ideo.com/' },
  nnGroup: { name: 'Nielsen Norman Group — UX Articles', url: 'https://www.nngroup.com/articles/' },
  refactoringUI: { name: 'Google UX Design Certificate', url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
  cspo: { name: 'Scrum Alliance — Product Owner', url: 'https://www.scrumalliance.org/get-certified/product-owner-certifications/certified-scrum-product-owner' },

  // HR
  shrmCp: { name: 'SHRM — HR Certification', url: 'https://www.shrm.org/certification' },

  // Finance
  cfaLevel1: { name: 'CFA Institute — Programs', url: 'https://www.cfainstitute.org/en/programs/cfa' },
  cfiFMVA: { name: 'CFI — Financial Modeling Course', url: 'https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva-certification/' },

  // Healthcare
  ahaBls: { name: 'AHA — Healthcare Training', url: 'https://cpr.heart.org/en/cpr-courses-and-kits/healthcare-professional-training' },
  nihEbp: { name: 'NIH — Evidence-Based Practice', url: 'https://www.ncbi.nlm.nih.gov/books/NBK519005/' },

  // Government / UPSC
  ncert: { name: 'NCERT — Official Textbooks', url: 'https://ncert.nic.in/textbook.php' },
  upscOfficial: { name: 'UPSC — Official Syllabus', url: 'https://upsc.gov.in/' },
  visionIAS: { name: 'Unacademy — UPSC Preparation', url: 'https://unacademy.com/goal/upsc-civil-services-examination-ias-preparation/KSCGY' },

  // Marketing
  googleDigitalMarketing: { name: 'Google Digital Marketing (Coursera)', url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce' },
  hubSpotInbound: { name: 'HubSpot Academy — Free Marketing Course', url: 'https://academy.hubspot.com/courses/inbound-marketing' },

  // Operations / Project
  leanSixSigma: { name: 'ASQ — Six Sigma Resources', url: 'https://asq.org/quality-resources/six-sigma' },
  pmiCapm: { name: 'PMI — Project Management Cert', url: 'https://www.pmi.org/certifications/certified-associate-capm' },

  // Legal / Education
  nptel: { name: 'NPTEL — Free Online Courses', url: 'https://nptel.ac.in/' },
  courseraLearning: { name: 'Coursera — Teaching & Education', url: 'https://www.coursera.org/browse/social-sciences/education' },

  // Reliable generic resources (specific landing pages, not homepages)
  freeCodeCamp: { name: 'freeCodeCamp — Full Curriculum', url: 'https://www.freecodecamp.org/learn' },
  youtube: { name: 'freeCodeCamp YouTube — Full Courses', url: 'https://www.youtube.com/@freecodecamp/videos' },
  linkedInLearning: { name: 'LinkedIn Learning — Courses', url: 'https://www.linkedin.com/learning/' },
  udemy: { name: 'Udemy — Top Rated Courses', url: 'https://www.udemy.com/courses/development/' },
  medium: { name: 'Dev.to — Developer Articles', url: 'https://dev.to/' },
};

/**
 * Pick a curated resource for a generated role's task.
 */
export function pickResource(skillName: string, taskIndex: number): RoadmapResource {
  const lower = skillName.toLowerCase();
  const candidates: RoadmapResource[] = [RESOURCES.freeCodeCamp, RESOURCES.youtube];

  if (lower.includes('react')) candidates.unshift(RESOURCES.reactDev);
  if (lower.includes('javascript') || lower.includes('js')) candidates.unshift(RESOURCES.javascriptInfo);
  if (lower.includes('html') || lower.includes('css')) candidates.unshift(RESOURCES.mdn, RESOURCES.cssBattle);
  if (lower.includes('typescript') || lower.includes('type')) candidates.unshift(RESOURCES.tsHandbook);
  if (lower.includes('git')) candidates.unshift(RESOURCES.githubLearning);
  if (lower.includes('test')) candidates.unshift(RESOURCES.testingLibrary);
  if (lower.includes('performance') || lower.includes('web')) candidates.unshift(RESOURCES.webDev);
  if (lower.includes('api')) candidates.unshift(RESOURCES.mdn);
  if (lower.includes('database') || lower.includes('sql') || lower.includes('postgres')) candidates.unshift(RESOURCES.postgresTutorial, RESOURCES.modeSql);
  if (lower.includes('mongo')) candidates.unshift(RESOURCES.mongodbU);
  if (lower.includes('python')) candidates.unshift(RESOURCES.pythonEverybody);
  if (lower.includes('machine learning') || lower.includes('ml')) candidates.unshift(RESOURCES.andrewNgML, RESOURCES.kaggle);
  if (lower.includes('deep')) candidates.unshift(RESOURCES.fastAi);
  if (lower.includes('visual') || lower.includes('plot')) candidates.unshift(RESOURCES.storytellingWithData, RESOURCES.kaggle);
  if (lower.includes('statistics')) candidates.unshift(RESOURCES.khanStats);
  if (lower.includes('node') || lower.includes('backend') || lower.includes('express')) candidates.unshift(RESOURCES.odinProject);
  if (lower.includes('security') || lower.includes('auth')) candidates.unshift(RESOURCES.owasp);
  if (lower.includes('cache') || lower.includes('redis')) candidates.unshift(RESOURCES.redisU);
  if (lower.includes('docker')) candidates.unshift(RESOURCES.dockerStart);
  if (lower.includes('system design')) candidates.unshift(RESOURCES.systemDesignPrimer);
  if (lower.includes('cloud') || lower.includes('aws')) candidates.unshift(RESOURCES.awsFree);
  if (lower.includes('figma') || lower.includes('design')) candidates.unshift(RESOURCES.figmaTutorials);
  if (lower.includes('user research') || lower.includes('usability')) candidates.unshift(RESOURCES.nnGroup, RESOURCES.ideoKit);
  if (lower.includes('product manager') || lower.includes('scrum')) candidates.unshift(RESOURCES.cspo);
  if (lower.includes('hr') || lower.includes('employee')) candidates.unshift(RESOURCES.shrmCp);
  if (lower.includes('finance') || lower.includes('valuation') || lower.includes('model')) candidates.unshift(RESOURCES.cfiFMVA, RESOURCES.cfaLevel1);
  if (lower.includes('health') || lower.includes('patient')) candidates.unshift(RESOURCES.nihEbp, RESOURCES.ahaBls);
  if (lower.includes('upsc') || lower.includes('governance') || lower.includes('civil')) candidates.unshift(RESOURCES.upscOfficial, RESOURCES.ncert, RESOURCES.visionIAS);
  if (lower.includes('marketing') || lower.includes('seo') || lower.includes('digital')) candidates.unshift(RESOURCES.googleDigitalMarketing, RESOURCES.hubSpotInbound);
  if (lower.includes('operations') || lower.includes('lean') || lower.includes('six sigma')) candidates.unshift(RESOURCES.leanSixSigma);
  if (lower.includes('project manager') || lower.includes('pm')) candidates.unshift(RESOURCES.pmiCapm);
  if (lower.includes('teacher') || lower.includes('education')) candidates.unshift(RESOURCES.courseraLearning, RESOURCES.nptel);
  if (lower.includes('legal') || lower.includes('law')) candidates.unshift(RESOURCES.nptel);

  return candidates[taskIndex % candidates.length];
}
