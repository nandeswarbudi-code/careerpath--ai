import type { Role } from '../types';
import {
  RESOURCES,
} from './resources';

export const LEVEL_LABELS = ['No experience', 'Beginner', 'Intermediate', 'Advanced'];

export const ROLES: Role[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: '🎨',
    tagline: 'Build beautiful, interactive web experiences',
    demand: 'Very High Demand',
    color: 'from-violet-500 to-indigo-600',
    skills: [
      { id: 'html', name: 'HTML & CSS', requiredLevel: 3, category: 'Core' },
      { id: 'js', name: 'JavaScript (ES6+)', requiredLevel: 3, category: 'Core' },
      { id: 'react', name: 'React', requiredLevel: 3, category: 'Framework' },
      { id: 'ts', name: 'TypeScript', requiredLevel: 2, category: 'Framework' },
      { id: 'git', name: 'Git & GitHub', requiredLevel: 2, category: 'Tools' },
      { id: 'api', name: 'REST APIs & Fetch', requiredLevel: 2, category: 'Integration' },
      { id: 'test', name: 'Testing (Jest/RTL)', requiredLevel: 1, category: 'Quality' },
      { id: 'perf', name: 'Web Performance', requiredLevel: 1, category: 'Quality' },
    ],
    phases: [
      {
        id: 'p1', title: 'Foundations', duration: 'Weeks 1–4',
        tasks: [
          { id: 't1', title: 'Master semantic HTML & modern CSS (Flexbox, Grid)', skillId: 'html', resource: 'MDN Web Docs + CSS Battle', resourceLink: RESOURCES.mdn, hours: 30 },
          { id: 't2', title: 'JavaScript fundamentals: closures, async/await, DOM', skillId: 'js', resource: 'JavaScript.info', resourceLink: RESOURCES.javascriptInfo, hours: 40 },
          { id: 't3', title: 'Version control workflow with Git branches & PRs', skillId: 'git', resource: 'GitHub Learning Lab', resourceLink: RESOURCES.githubLearning, hours: 10 },
        ],
      },
      {
        id: 'p2', title: 'Framework Mastery', duration: 'Weeks 5–10',
        tasks: [
          { id: 't4', title: 'React: components, hooks, state management', skillId: 'react', resource: 'React.dev official tutorial', resourceLink: RESOURCES.reactDev, hours: 50 },
          { id: 't5', title: 'TypeScript: types, generics, typing React props', skillId: 'ts', resource: 'TypeScript Handbook', resourceLink: RESOURCES.tsHandbook, hours: 25 },
          { id: 't6', title: 'Consume REST APIs, handle loading & error states', skillId: 'api', resource: 'Build a weather dashboard', resourceLink: RESOURCES.freeCodeCamp, hours: 15 },
        ],
      },
      {
        id: 'p3', title: 'Professional Polish', duration: 'Weeks 11–14',
        tasks: [
          { id: 't7', title: 'Unit & integration testing with Jest + RTL', skillId: 'test', resource: 'Testing Library docs', resourceLink: RESOURCES.testingLibrary, hours: 20 },
          { id: 't8', title: 'Lighthouse audits, code-splitting, lazy loading', skillId: 'perf', resource: 'web.dev performance course', resourceLink: RESOURCES.webDev, hours: 15 },
        ],
      },
    ],
    projects: [
      { id: 'pr1', title: 'Personal Portfolio Site', description: 'Responsive portfolio with dark mode, animations, and a contact form.', difficulty: 'Beginner', skills: ['HTML/CSS', 'JavaScript'] },
      { id: 'pr2', title: 'Task Manager SPA', description: 'Full CRUD app with React, local storage persistence, and drag-and-drop.', difficulty: 'Intermediate', skills: ['React', 'TypeScript'] },
      { id: 'pr3', title: 'E-Commerce Storefront', description: 'Product catalog, cart, checkout flow with API integration and tests.', difficulty: 'Advanced', skills: ['React', 'APIs', 'Testing'] },
    ],
    certifications: [
      { id: 'c1', name: 'Meta Front-End Developer', provider: 'Coursera' },
      { id: 'c2', name: 'JavaScript Algorithms & Data Structures', provider: 'freeCodeCamp' },
    ],
    questions: [
      { id: 'q1', type: 'Technical', question: 'Explain the difference between let, const, and var in JavaScript.', hint: 'Cover scope (block vs function), hoisting, and reassignment rules.' },
      { id: 'q2', type: 'Technical', question: 'What is the virtual DOM and how does React use it to optimize rendering?', hint: 'Mention diffing, reconciliation, and batched updates.' },
      { id: 'q3', type: 'Technical', question: 'How would you optimize a slow-loading web page?', hint: 'Code splitting, image optimization, caching, lazy loading, CDN.' },
      { id: 'q4', type: 'Behavioral', question: 'Tell me about a time you received critical feedback on your code.', hint: 'Use STAR: Situation, Task, Action, Result. Show growth mindset.' },
      { id: 'q5', type: 'System Design', question: 'Design the frontend architecture for an infinite-scroll news feed.', hint: 'Virtualization, pagination vs cursors, caching, optimistic UI.' },
    ],
    jobs: [
      { id: 'j1', title: 'Frontend Developer', company: 'Nexora Labs', location: 'Remote', match: 94, tags: ['React', 'TypeScript'] },
      { id: 'j2', title: 'React Engineer', company: 'BrightPixel', location: 'Bengaluru, IN', match: 89, tags: ['React', 'Redux', 'CSS'] },
      { id: 'j3', title: 'UI Engineer', company: 'CloudMint', location: 'New York, US', match: 82, tags: ['JavaScript', 'Design Systems'] },
    ],
  },
  {
    id: 'datascientist',
    title: 'Data Scientist',
    icon: '📊',
    tagline: 'Turn raw data into decisions with ML & statistics',
    demand: 'High Demand',
    color: 'from-emerald-500 to-teal-600',
    skills: [
      { id: 'py', name: 'Python', requiredLevel: 3, category: 'Core' },
      { id: 'stats', name: 'Statistics & Probability', requiredLevel: 3, category: 'Core' },
      { id: 'pandas', name: 'Pandas & NumPy', requiredLevel: 3, category: 'Data' },
      { id: 'sql', name: 'SQL', requiredLevel: 2, category: 'Data' },
      { id: 'ml', name: 'Machine Learning', requiredLevel: 2, category: 'ML' },
      { id: 'viz', name: 'Data Visualization', requiredLevel: 2, category: 'Communication' },
      { id: 'dl', name: 'Deep Learning', requiredLevel: 1, category: 'ML' },
      { id: 'mlops', name: 'Model Deployment', requiredLevel: 1, category: 'Engineering' },
    ],
    phases: [
      {
        id: 'p1', title: 'Foundations', duration: 'Weeks 1–5',
        tasks: [
          { id: 't1', title: 'Python fluency: functions, OOP, comprehensions', skillId: 'py', resource: 'Python for Everybody', resourceLink: RESOURCES.pythonEverybody, hours: 35 },
          { id: 't2', title: 'Descriptive & inferential statistics, hypothesis testing', skillId: 'stats', resource: 'Khan Academy Statistics', resourceLink: RESOURCES.khanStats, hours: 30 },
          { id: 't3', title: 'SQL joins, aggregations, window functions', skillId: 'sql', resource: 'Mode SQL Tutorial', resourceLink: RESOURCES.modeSql, hours: 20 },
        ],
      },
      {
        id: 'p2', title: 'Data Wrangling & ML', duration: 'Weeks 6–12',
        tasks: [
          { id: 't4', title: 'Data cleaning & EDA with Pandas and NumPy', skillId: 'pandas', resource: 'Kaggle Pandas course', resourceLink: RESOURCES.kaggle, hours: 25 },
          { id: 't5', title: 'Supervised learning: regression, trees, ensembles', skillId: 'ml', resource: 'scikit-learn + Andrew Ng ML', resourceLink: RESOURCES.andrewNgML, hours: 45 },
          { id: 't6', title: 'Storytelling with Matplotlib, Seaborn, Plotly', skillId: 'viz', resource: 'Storytelling with Data', resourceLink: RESOURCES.storytellingWithData, hours: 15 },
        ],
      },
      {
        id: 'p3', title: 'Advanced & Production', duration: 'Weeks 13–16',
        tasks: [
          { id: 't7', title: 'Neural networks with PyTorch or TensorFlow', skillId: 'dl', resource: 'fast.ai Practical DL', resourceLink: RESOURCES.fastAi, hours: 30 },
          { id: 't8', title: 'Deploy a model as an API with FastAPI + Docker', skillId: 'mlops', resource: 'Full Stack Deep Learning', resourceLink: RESOURCES.dockerStart, hours: 20 },
        ],
      },
    ],
    projects: [
      { id: 'pr1', title: 'Exploratory Data Analysis Report', description: 'Deep-dive EDA on a real dataset with insights and visual narrative.', difficulty: 'Beginner', skills: ['Pandas', 'Visualization'] },
      { id: 'pr2', title: 'Customer Churn Predictor', description: 'End-to-end ML pipeline: cleaning, feature engineering, model tuning.', difficulty: 'Intermediate', skills: ['ML', 'scikit-learn'] },
      { id: 'pr3', title: 'Deployed ML Web Service', description: 'Train, containerize, and deploy a model with monitoring dashboard.', difficulty: 'Advanced', skills: ['Deep Learning', 'MLOps'] },
    ],
    certifications: [
      { id: 'c1', name: 'IBM Data Science Professional', provider: 'Coursera' },
      { id: 'c2', name: 'TensorFlow Developer Certificate', provider: 'Google' },
    ],
    questions: [
      { id: 'q1', type: 'Technical', question: 'Explain the bias–variance tradeoff and how to manage it.', hint: 'Underfitting vs overfitting, regularization, cross-validation.' },
      { id: 'q2', type: 'Technical', question: 'When would you use precision over recall as your key metric?', hint: 'Cost of false positives vs false negatives; give real examples.' },
      { id: 'q3', type: 'Technical', question: 'How do you handle missing data in a dataset?', hint: 'Deletion, imputation strategies, and when each is appropriate.' },
      { id: 'q4', type: 'Behavioral', question: 'Describe a time your analysis changed a business decision.', hint: 'Quantify the impact. Show communication with non-technical stakeholders.' },
      { id: 'q5', type: 'System Design', question: 'Design an ML system to detect fraudulent transactions in real time.', hint: 'Feature pipelines, class imbalance, latency, feedback loops.' },
    ],
    jobs: [
      { id: 'j1', title: 'Data Scientist', company: 'Quantiva', location: 'Remote', match: 91, tags: ['Python', 'ML'] },
      { id: 'j2', title: 'ML Analyst', company: 'FinEdge', location: 'Hyderabad, IN', match: 86, tags: ['SQL', 'scikit-learn'] },
      { id: 'j3', title: 'Junior Data Scientist', company: 'HealthLoop', location: 'Boston, US', match: 80, tags: ['Pandas', 'Statistics'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: '⚙️',
    tagline: 'Architect the servers, APIs, and databases that power apps',
    demand: 'Very High Demand',
    color: 'from-orange-500 to-rose-600',
    skills: [
      { id: 'lang', name: 'Node.js / Python / Java', requiredLevel: 3, category: 'Core' },
      { id: 'db', name: 'Databases (SQL & NoSQL)', requiredLevel: 3, category: 'Data' },
      { id: 'apis', name: 'API Design (REST/GraphQL)', requiredLevel: 3, category: 'Core' },
      { id: 'auth', name: 'Auth & Security', requiredLevel: 2, category: 'Security' },
      { id: 'git', name: 'Git & CI/CD', requiredLevel: 2, category: 'Tools' },
      { id: 'cache', name: 'Caching & Queues', requiredLevel: 1, category: 'Scale' },
      { id: 'docker', name: 'Docker & Cloud', requiredLevel: 1, category: 'DevOps' },
      { id: 'sysdes', name: 'System Design', requiredLevel: 2, category: 'Architecture' },
    ],
    phases: [
      {
        id: 'p1', title: 'Server-Side Foundations', duration: 'Weeks 1–5',
        tasks: [
          { id: 't1', title: 'Backend language deep-dive (Node.js/Express or Python/FastAPI)', skillId: 'lang', resource: 'Official docs + The Odin Project', resourceLink: RESOURCES.odinProject, hours: 40 },
          { id: 't2', title: 'Relational modeling, PostgreSQL, and MongoDB basics', skillId: 'db', resource: 'PostgreSQL Tutorial + MongoDB U', resourceLink: RESOURCES.postgresTutorial, hours: 30 },
          { id: 't3', title: 'Git workflows and a basic CI pipeline', skillId: 'git', resource: 'GitHub Actions docs', resourceLink: RESOURCES.githubLearning, hours: 10 },
        ],
      },
      {
        id: 'p2', title: 'APIs & Security', duration: 'Weeks 6–11',
        tasks: [
          { id: 't4', title: 'Design RESTful APIs: versioning, pagination, error handling', skillId: 'apis', resource: 'Build a bookings API', resourceLink: RESOURCES.freeCodeCamp, hours: 35 },
          { id: 't5', title: 'JWT auth, OAuth2, OWASP top 10 mitigations', skillId: 'auth', resource: 'OWASP Cheat Sheets', resourceLink: RESOURCES.owasp, hours: 20 },
          { id: 't6', title: 'Redis caching and message queues (RabbitMQ/Kafka basics)', skillId: 'cache', resource: 'Redis University', resourceLink: RESOURCES.redisU, hours: 15 },
        ],
      },
      {
        id: 'p3', title: 'Scale & Deployment', duration: 'Weeks 12–15',
        tasks: [
          { id: 't7', title: 'Containerize services and deploy to a cloud provider', skillId: 'docker', resource: 'Docker Getting Started + AWS free tier', resourceLink: RESOURCES.dockerStart, hours: 20 },
          { id: 't8', title: 'System design fundamentals: load balancing, sharding, CAP', skillId: 'sysdes', resource: 'System Design Primer', resourceLink: RESOURCES.systemDesignPrimer, hours: 25 },
        ],
      },
    ],
    projects: [
      { id: 'pr1', title: 'URL Shortener API', description: 'REST API with rate limiting, analytics, and PostgreSQL storage.', difficulty: 'Beginner', skills: ['Node.js', 'SQL'] },
      { id: 'pr2', title: 'Auth Microservice', description: 'JWT + refresh tokens, role-based access, email verification.', difficulty: 'Intermediate', skills: ['Auth', 'Security'] },
      { id: 'pr3', title: 'Event-Driven Order System', description: 'Microservices with queues, caching, Docker Compose, and CI/CD.', difficulty: 'Advanced', skills: ['Queues', 'Docker', 'System Design'] },
    ],
    certifications: [
      { id: 'c1', name: 'AWS Certified Developer – Associate', provider: 'Amazon' },
      { id: 'c2', name: 'Node.js Application Developer (JSNAD)', provider: 'OpenJS' },
    ],
    questions: [
      { id: 'q1', type: 'Technical', question: 'Explain the difference between SQL and NoSQL databases and when to use each.', hint: 'Schema, transactions, scaling patterns, consistency models.' },
      { id: 'q2', type: 'Technical', question: 'How does JWT authentication work? What are its weaknesses?', hint: 'Stateless tokens, signature verification, revocation challenges.' },
      { id: 'q3', type: 'Technical', question: 'What strategies would you use to scale an API handling 10x traffic?', hint: 'Horizontal scaling, caching layers, DB replicas, queues.' },
      { id: 'q4', type: 'Behavioral', question: 'Tell me about a production bug you debugged under pressure.', hint: 'Show systematic debugging, communication, and postmortem learning.' },
      { id: 'q5', type: 'System Design', question: 'Design a rate limiter for a public API.', hint: 'Token bucket vs sliding window, distributed state in Redis.' },
    ],
    jobs: [
      { id: 'j1', title: 'Backend Engineer', company: 'StackForge', location: 'Remote', match: 92, tags: ['Node.js', 'PostgreSQL'] },
      { id: 'j2', title: 'API Developer', company: 'PayTrail', location: 'Pune, IN', match: 87, tags: ['REST', 'Redis'] },
      { id: 'j3', title: 'Platform Engineer', company: 'Orbitly', location: 'Berlin, DE', match: 78, tags: ['Docker', 'Kafka'] },
    ],
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    icon: '✨',
    tagline: 'Craft intuitive, human-centered product experiences',
    demand: 'Growing Demand',
    color: 'from-pink-500 to-fuchsia-600',
    skills: [
      { id: 'ux', name: 'UX Research & Personas', requiredLevel: 3, category: 'Research' },
      { id: 'wire', name: 'Wireframing & Prototyping', requiredLevel: 3, category: 'Design' },
      { id: 'figma', name: 'Figma', requiredLevel: 3, category: 'Tools' },
      { id: 'visual', name: 'Visual Design & Typography', requiredLevel: 2, category: 'Design' },
      { id: 'ia', name: 'Information Architecture', requiredLevel: 2, category: 'Research' },
      { id: 'usab', name: 'Usability Testing', requiredLevel: 2, category: 'Research' },
      { id: 'ds', name: 'Design Systems', requiredLevel: 1, category: 'Design' },
      { id: 'htmlcss', name: 'HTML/CSS Basics', requiredLevel: 1, category: 'Handoff' },
    ],
    phases: [
      {
        id: 'p1', title: 'Design Thinking', duration: 'Weeks 1–4',
        tasks: [
          { id: 't1', title: 'User research methods: interviews, surveys, personas', skillId: 'ux', resource: 'NN/g articles + IDEO Design Kit', resourceLink: RESOURCES.nnGroup, hours: 25 },
          { id: 't2', title: 'Information architecture and user flows', skillId: 'ia', resource: 'Card sorting exercises', resourceLink: RESOURCES.ideoKit, hours: 15 },
          { id: 't3', title: 'Figma essentials: frames, auto-layout, components', skillId: 'figma', resource: 'Figma official tutorials', resourceLink: RESOURCES.figmaTutorials, hours: 20 },
        ],
      },
      {
        id: 'p2', title: 'Craft & Prototyping', duration: 'Weeks 5–9',
        tasks: [
          { id: 't4', title: 'Low-fi to hi-fi wireframes and interactive prototypes', skillId: 'wire', resource: 'Redesign a popular app screen', resourceLink: RESOURCES.figmaTutorials, hours: 30 },
          { id: 't5', title: 'Color theory, typography scales, spacing systems', skillId: 'visual', resource: 'Refactoring UI', resourceLink: RESOURCES.refactoringUI, hours: 20 },
          { id: 't6', title: 'Moderated usability tests and iteration', skillId: 'usab', resource: 'Maze / Useberry practice', resourceLink: RESOURCES.nnGroup, hours: 15 },
        ],
      },
      {
        id: 'p3', title: 'Systems & Handoff', duration: 'Weeks 10–12',
        tasks: [
          { id: 't7', title: 'Build a mini design system with tokens & components', skillId: 'ds', resource: 'Material Design + Polaris study', resourceLink: RESOURCES.figmaTutorials, hours: 20 },
          { id: 't8', title: 'HTML/CSS basics for smooth developer handoff', skillId: 'htmlcss', resource: 'freeCodeCamp Responsive Web', resourceLink: RESOURCES.freeCodeCamp, hours: 15 },
        ],
      },
    ],
    projects: [
      { id: 'pr1', title: 'App Redesign Case Study', description: 'Identify UX flaws in a real app, redesign flows, document decisions.', difficulty: 'Beginner', skills: ['Research', 'Figma'] },
      { id: 'pr2', title: 'End-to-End Product Design', description: 'From user interviews to a tested hi-fi prototype for a new product idea.', difficulty: 'Intermediate', skills: ['Prototyping', 'Usability'] },
      { id: 'pr3', title: 'Design System from Scratch', description: 'Tokens, components, docs, and dark mode for a multi-platform brand.', difficulty: 'Advanced', skills: ['Design Systems', 'Visual Design'] },
    ],
    certifications: [
      { id: 'c1', name: 'Google UX Design Certificate', provider: 'Coursera' },
      { id: 'c2', name: 'Interaction Design Specialization', provider: 'UC San Diego' },
    ],
    questions: [
      { id: 'q1', type: 'Technical', question: 'Walk me through your design process from brief to handoff.', hint: 'Discover → Define → Ideate → Prototype → Test → Iterate.' },
      { id: 'q2', type: 'Technical', question: 'How do you decide between a modal, a drawer, or a new page?', hint: 'Task complexity, context preservation, mobile constraints.' },
      { id: 'q3', type: 'Technical', question: 'How would you measure the success of a redesign?', hint: 'Task success rate, time-on-task, SUS score, conversion metrics.' },
      { id: 'q4', type: 'Behavioral', question: 'Tell me about a time a stakeholder disagreed with your design.', hint: 'Show data-driven persuasion and willingness to compromise.' },
      { id: 'q5', type: 'System Design', question: 'Design the onboarding flow for a finance app for first-time investors.', hint: 'Progressive disclosure, trust signals, empty states, education.' },
    ],
    jobs: [
      { id: 'j1', title: 'Product Designer', company: 'Lumen Studio', location: 'Remote', match: 90, tags: ['Figma', 'UX Research'] },
      { id: 'j2', title: 'UI/UX Designer', company: 'Zesty Apps', location: 'Mumbai, IN', match: 85, tags: ['Prototyping', 'Design Systems'] },
      { id: 'j3', title: 'UX Designer', company: 'Northwind Health', location: 'London, UK', match: 79, tags: ['Usability', 'IA'] },
    ],
  },
];
