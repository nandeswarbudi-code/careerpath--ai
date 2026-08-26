import type { Role, Skill } from '../types';
import { INTERVIEW_ROLES, type InterviewRole } from './interviewRoles';
import { ROLES as FEATURED_ROLES } from './roles';
import { pickResource } from './resources';

/** Journey role id → hand-crafted featured role. */
const FEATURED_BY_INTERVIEW_ID: Record<string, string> = {
  'frontend-dev': 'frontend',
  'data-scientist': 'datascientist',
  'backend-dev': 'backend',
  'ux-designer': 'uiux',
};

const INDUSTRY_META: Record<string, { icon: string; color: string; demand: string }> = {
  'Engineering & Technology': { icon: '🛠️', color: 'from-blue-500 to-indigo-600', demand: 'Very High Demand' },
  'Data & AI': { icon: '📊', color: 'from-emerald-500 to-teal-600', demand: 'Very High Demand' },
  'Design & Product': { icon: '✨', color: 'from-pink-500 to-fuchsia-600', demand: 'High Demand' },
  'HR & People': { icon: '🤝', color: 'from-amber-500 to-orange-600', demand: 'Steady Demand' },
  'Finance & Accounting': { icon: '💰', color: 'from-lime-500 to-emerald-600', demand: 'High Demand' },
  Healthcare: { icon: '🏥', color: 'from-rose-500 to-red-600', demand: 'Very High Demand' },
  'Government & Civil Services': { icon: '🏛️', color: 'from-slate-500 to-slate-700', demand: 'Competitive' },
  'Marketing & Sales': { icon: '📣', color: 'from-orange-500 to-rose-600', demand: 'High Demand' },
  'Operations & Supply Chain': { icon: '🚚', color: 'from-cyan-500 to-blue-600', demand: 'Steady Demand' },
  'Legal & Education': { icon: '⚖️', color: 'from-violet-500 to-purple-600', demand: 'Steady Demand' },
};

const ACRONYMS = new Set(['api', 'sql', 'seo', 'crm', 'kpi', 'sop', 'npa', 'rbi', 'gaap', 'dcf', 'lbo', 'm&a', 'etl', 'ci/cd', 'aws', 'ios', 'rtos', 'owasp', 'slo', 'nps', 'mlops', 'upsc', 'hr']);

function pretty(term: string): string {
  return term
    .split(' ')
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const LEVEL_PATTERN: (1 | 2 | 3)[] = [3, 3, 3, 2, 2, 2, 1, 1];
const CATEGORY_PATTERN = ['Core', 'Core', 'Core', 'Applied', 'Applied', 'Applied', 'Advanced', 'Advanced'];

const CERTS_BY_INDUSTRY: Record<string, { name: string; provider: string }[]> = {
  'Engineering & Technology': [
    { name: 'AWS Certified Cloud Practitioner', provider: 'Amazon' },
    { name: 'Professional Certificate in the role domain', provider: 'Coursera / edX' },
  ],
  'Data & AI': [
    { name: 'Google Data Analytics Professional', provider: 'Coursera' },
    { name: 'Microsoft Certified: Azure Data Fundamentals', provider: 'Microsoft' },
  ],
  'Design & Product': [
    { name: 'Google UX Design Certificate', provider: 'Coursera' },
    { name: 'Certified Scrum Product Owner (CSPO)', provider: 'Scrum Alliance' },
  ],
  'HR & People': [
    { name: 'SHRM Certified Professional (SHRM-CP)', provider: 'SHRM' },
    { name: 'HR Management Certificate', provider: 'HRCI / Coursera' },
  ],
  'Finance & Accounting': [
    { name: 'CFA Level I / relevant charter', provider: 'CFA Institute' },
    { name: 'Financial Modeling & Valuation Analyst', provider: 'CFI' },
  ],
  Healthcare: [
    { name: 'Basic Life Support (BLS) Certification', provider: 'AHA / Red Cross' },
    { name: 'Specialty certification for your license', provider: 'National board' },
  ],
  'Government & Civil Services': [
    { name: 'NCERT + standard reference mastery (self-track)', provider: 'Self-paced' },
    { name: 'Test-series enrolment with mock boards', provider: 'Reputed academy' },
  ],
  'Marketing & Sales': [
    { name: 'Google Digital Marketing & E-commerce', provider: 'Coursera' },
    { name: 'HubSpot Inbound Certification', provider: 'HubSpot Academy' },
  ],
  'Operations & Supply Chain': [
    { name: 'Lean Six Sigma Green Belt', provider: 'ASQ / IASSC' },
    { name: 'CAPM / PMP (as eligible)', provider: 'PMI' },
  ],
  'Legal & Education': [
    { name: 'Domain bar / teaching eligibility credential', provider: 'Regulatory body' },
    { name: 'Specialized diploma in your practice area', provider: 'University / NPTEL' },
  ],
};

const COMPANIES = ['Northstar Group', 'Helios Partners', 'BlueOak', 'Vertex Global', 'Summit Works', 'Kindred Labs'];
const LOCATIONS = ['Remote', 'Bengaluru, IN', 'New York, US', 'London, UK', 'Singapore', 'Mumbai, IN'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Generates a complete journey Role from an InterviewRole's domain data. */
function generateRole(ir: InterviewRole): Role {
  const meta = INDUSTRY_META[ir.industry] ?? INDUSTRY_META['Engineering & Technology'];
  const h = hash(ir.id);

  const skills: Skill[] = ir.keywords.slice(0, 8).map((kw, i) => ({
    id: `${ir.id}-s${i}`,
    name: pretty(kw),
    requiredLevel: LEVEL_PATTERN[i % LEVEL_PATTERN.length],
    category: CATEGORY_PATTERN[i % CATEGORY_PATTERN.length],
  }));

  const t = (i: number) => ir.topics[i % ir.topics.length];
  const sk = (i: number) => skills[i % skills.length];

  const phases = [
    {
      id: `${ir.id}-p1`,
      title: 'Foundations',
      duration: 'Weeks 1–4',
        tasks: [
          { id: `${ir.id}-t1`, title: `Build core knowledge of ${sk(0).name.toLowerCase()} and ${sk(1).name.toLowerCase()}`, skillId: sk(0).id, resource: 'Top-rated free course + standard reference book', resourceLink: pickResource(sk(0).name, 0), hours: 30 },
          { id: `${ir.id}-t2`, title: `Study fundamentals of ${t(0)} with real case examples`, skillId: sk(1).id, resource: 'Industry blogs, case studies & practice sets', resourceLink: pickResource(sk(1).name, 1), hours: 20 },
          { id: `${ir.id}-t3`, title: `Follow 3 practitioners and analyse how they handle ${t(1)}`, skillId: sk(2).id, resource: 'LinkedIn / podcasts / conference talks', resourceLink: pickResource(sk(2).name, 2), hours: 8 },
        ],
      },
      {
        id: `${ir.id}-p2`,
        title: 'Applied Practice',
        duration: 'Weeks 5–9',
        tasks: [
          { id: `${ir.id}-t4`, title: `Complete hands-on exercises in ${sk(3).name.toLowerCase()} and ${sk(4).name.toLowerCase()}`, skillId: sk(3).id, resource: 'Practice platform / simulated scenarios', resourceLink: pickResource(sk(3).name, 3), hours: 30 },
          { id: `${ir.id}-t5`, title: `Produce one work sample demonstrating ${t(1)}`, skillId: sk(4).id, resource: 'Self-directed mini project', resourceLink: pickResource(sk(4).name, 4), hours: 25 },
          { id: `${ir.id}-t6`, title: `Shadow or interview a working ${ir.title} about their day-to-day`, skillId: sk(5).id, resource: 'Informational interviews (2–3 calls)', resourceLink: pickResource(sk(5).name, 5), hours: 5 },
        ],
      },
      {
        id: `${ir.id}-p3`,
        title: 'Job-Ready Polish',
        duration: 'Weeks 10–13',
        tasks: [
          { id: `${ir.id}-t7`, title: `Master advanced scenarios: ${t(2)}`, skillId: sk(6).id, resource: 'Advanced course module + mock scenarios', resourceLink: pickResource(sk(6).name, 6), hours: 20 },
          { id: `${ir.id}-t8`, title: `Compile a portfolio/dossier of your best work as a ${ir.title}`, skillId: sk(7).id, resource: 'Portfolio site, case-study doc or work file', resourceLink: pickResource(sk(7).name, 7), hours: 12 },
        ],
      },
  ];

  const projects = [
    {
      id: `${ir.id}-pr1`,
      title: `${titleCase(t(0))} Case Study`,
      description: `Research and document a real-world scenario involving ${t(0)}, with your own analysis and recommendations.`,
      difficulty: 'Beginner' as const,
      skills: [sk(0).name, sk(1).name],
    },
    {
      id: `${ir.id}-pr2`,
      title: `Hands-On ${titleCase(t(1))} Project`,
      description: `Deliver an end-to-end work sample tackling ${t(1)} — the kind of artifact you can present in interviews.`,
      difficulty: 'Intermediate' as const,
      skills: [sk(2).name, sk(3).name],
    },
    {
      id: `${ir.id}-pr3`,
      title: `Capstone: ${titleCase(t(2))}`,
      description: `A portfolio-grade capstone demonstrating mastery of ${t(2)}, documented with process, decisions, and outcomes.`,
      difficulty: 'Advanced' as const,
      skills: [sk(4).name, sk(5).name],
    },
  ];

  const certifications = (CERTS_BY_INDUSTRY[ir.industry] ?? CERTS_BY_INDUSTRY['Engineering & Technology']).map((c, i) => ({
    id: `${ir.id}-c${i}`,
    ...c,
  }));

  const jobs = [0, 1, 2].map((i) => ({
    id: `${ir.id}-j${i}`,
    title: i === 0 ? ir.title : i === 1 ? `${ir.title} (Associate)` : `Senior ${ir.title}`,
    company: COMPANIES[(h + i) % COMPANIES.length],
    location: LOCATIONS[(h + i * 2) % LOCATIONS.length],
    match: 92 - i * 6,
    tags: [sk(i).name, sk(i + 1).name],
  }));

  return {
    id: ir.id,
    title: ir.title,
    icon: meta.icon,
    tagline: `Prepare end-to-end for a ${ir.title} career in ${ir.industry}`,
    demand: meta.demand,
    color: meta.color,
    skills,
    phases,
    projects,
    certifications,
    questions: [],
    jobs,
  };
}

export interface CatalogRole {
  role: Role;
  industry: string;
  featured: boolean;
  /** Interview Studio role id for this journey role. */
  interviewRoleId: string;
}

/** Full catalog: 4 hand-crafted featured roles + 40 generated roles = 44 dream roles. */
export const ROLE_CATALOG: CatalogRole[] = INTERVIEW_ROLES.map((ir) => {
  const featuredId = FEATURED_BY_INTERVIEW_ID[ir.id];
  const featured = featuredId ? FEATURED_ROLES.find((r) => r.id === featuredId) : undefined;
  return {
    role: featured ?? generateRole(ir),
    industry: ir.industry,
    featured: Boolean(featured),
    interviewRoleId: ir.id,
  };
});

export function interviewRoleIdFor(journeyRoleId: string): string {
  return ROLE_CATALOG.find((c) => c.role.id === journeyRoleId)?.interviewRoleId ?? journeyRoleId;
}
