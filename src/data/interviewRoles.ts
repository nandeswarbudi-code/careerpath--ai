export interface InterviewRole {
  id: string;
  title: string;
  industry: string;
  technical: boolean;
  keywords: string[];
  topics: string[];
}

export const INTERVIEW_ROLES: InterviewRole[] = [
  // ─── Engineering & Technology ───
  { id: 'frontend-dev', title: 'Frontend Developer', industry: 'Engineering & Technology', technical: true, keywords: ['react', 'javascript', 'css', 'performance', 'accessibility', 'component', 'state'], topics: ['rendering performance', 'state management', 'responsive design', 'web accessibility'] },
  { id: 'backend-dev', title: 'Backend Developer', industry: 'Engineering & Technology', technical: true, keywords: ['api', 'database', 'scaling', 'caching', 'security', 'microservices', 'latency'], topics: ['API design', 'database optimization', 'horizontal scaling', 'authentication'] },
  { id: 'fullstack-dev', title: 'Full-Stack Developer', industry: 'Engineering & Technology', technical: true, keywords: ['api', 'react', 'database', 'deployment', 'testing', 'architecture'], topics: ['end-to-end architecture', 'API contracts', 'deployment pipelines'] },
  { id: 'mobile-dev', title: 'Mobile Developer', industry: 'Engineering & Technology', technical: true, keywords: ['android', 'ios', 'offline', 'battery', 'app store', 'native', 'flutter'], topics: ['offline-first design', 'app performance', 'release management'] },
  { id: 'devops', title: 'DevOps Engineer', industry: 'Engineering & Technology', technical: true, keywords: ['ci/cd', 'kubernetes', 'docker', 'monitoring', 'incident', 'infrastructure', 'automation'], topics: ['incident response', 'infrastructure as code', 'observability'] },
  { id: 'cloud-architect', title: 'Cloud Architect', industry: 'Engineering & Technology', technical: true, keywords: ['aws', 'azure', 'cost', 'migration', 'availability', 'disaster recovery'], topics: ['cloud migration', 'cost optimization', 'high availability'] },
  { id: 'security-eng', title: 'Cybersecurity Engineer', industry: 'Engineering & Technology', technical: true, keywords: ['threat', 'vulnerability', 'encryption', 'owasp', 'incident', 'penetration', 'compliance'], topics: ['threat modeling', 'incident response', 'zero-trust architecture'] },
  { id: 'qa-eng', title: 'QA / Test Engineer', industry: 'Engineering & Technology', technical: true, keywords: ['automation', 'regression', 'test case', 'selenium', 'coverage', 'defect'], topics: ['test automation strategy', 'regression suites', 'quality metrics'] },
  { id: 'embedded-eng', title: 'Embedded Systems Engineer', industry: 'Engineering & Technology', technical: true, keywords: ['firmware', 'rtos', 'memory', 'hardware', 'c', 'microcontroller'], topics: ['real-time constraints', 'memory optimization', 'hardware debugging'] },
  { id: 'sre', title: 'Site Reliability Engineer', industry: 'Engineering & Technology', technical: true, keywords: ['slo', 'error budget', 'on-call', 'postmortem', 'reliability', 'automation'], topics: ['SLOs and error budgets', 'blameless postmortems', 'toil reduction'] },

  // ─── Data & AI ───
  { id: 'data-scientist', title: 'Data Scientist', industry: 'Data & AI', technical: true, keywords: ['model', 'python', 'statistics', 'feature', 'experiment', 'metric', 'hypothesis'], topics: ['model evaluation', 'A/B testing', 'feature engineering'] },
  { id: 'data-analyst', title: 'Data Analyst', industry: 'Data & AI', technical: true, keywords: ['sql', 'dashboard', 'insight', 'stakeholder', 'visualization', 'kpi'], topics: ['stakeholder reporting', 'KPI design', 'data storytelling'] },
  { id: 'ml-engineer', title: 'ML Engineer', industry: 'Data & AI', technical: true, keywords: ['pipeline', 'deployment', 'training', 'inference', 'drift', 'mlops'], topics: ['model deployment', 'data drift monitoring', 'training pipelines'] },
  { id: 'data-engineer', title: 'Data Engineer', industry: 'Data & AI', technical: true, keywords: ['etl', 'pipeline', 'warehouse', 'spark', 'airflow', 'schema'], topics: ['ETL design', 'data quality', 'warehouse modeling'] },

  // ─── Design & Product ───
  { id: 'ux-designer', title: 'UI/UX Designer', industry: 'Design & Product', technical: false, keywords: ['user research', 'prototype', 'usability', 'figma', 'accessibility', 'persona'], topics: ['usability testing', 'design systems', 'research synthesis'] },
  { id: 'product-manager', title: 'Product Manager', industry: 'Design & Product', technical: false, keywords: ['roadmap', 'prioritization', 'stakeholder', 'metric', 'user', 'launch', 'tradeoff'], topics: ['prioritization frameworks', 'go-to-market', 'metrics of success'] },
  { id: 'graphic-designer', title: 'Graphic Designer', industry: 'Design & Product', technical: false, keywords: ['brand', 'typography', 'layout', 'client', 'feedback', 'campaign'], topics: ['brand identity', 'client feedback cycles', 'portfolio decisions'] },
  { id: 'content-writer', title: 'Content Writer / Editor', industry: 'Design & Product', technical: false, keywords: ['audience', 'seo', 'tone', 'editing', 'deadline', 'research'], topics: ['audience adaptation', 'editorial standards', 'SEO writing'] },

  // ─── HR & People ───
  { id: 'hr-generalist', title: 'HR Generalist', industry: 'HR & People', technical: false, keywords: ['employee relations', 'policy', 'onboarding', 'grievance', 'compliance', 'engagement'], topics: ['conflict resolution', 'policy rollout', 'employee engagement'] },
  { id: 'recruiter', title: 'Talent Acquisition Specialist', industry: 'HR & People', technical: false, keywords: ['sourcing', 'pipeline', 'candidate experience', 'offer', 'hiring manager', 'diversity'], topics: ['sourcing strategy', 'candidate experience', 'closing offers'] },
  { id: 'ld-specialist', title: 'Learning & Development Specialist', industry: 'HR & People', technical: false, keywords: ['training', 'curriculum', 'skill gap', 'evaluation', 'facilitation'], topics: ['training needs analysis', 'program evaluation', 'facilitation'] },

  // ─── Finance & Accounting ───
  { id: 'financial-analyst', title: 'Financial Analyst', industry: 'Finance & Accounting', technical: false, keywords: ['valuation', 'forecast', 'excel', 'variance', 'dcf', 'budget', 'ratio'], topics: ['forecasting models', 'variance analysis', 'valuation methods'] },
  { id: 'accountant', title: 'Chartered / Staff Accountant', industry: 'Finance & Accounting', technical: false, keywords: ['ledger', 'reconciliation', 'audit', 'gaap', 'tax', 'closing'], topics: ['month-end close', 'audit readiness', 'reconciliations'] },
  { id: 'investment-banker', title: 'Investment Banking Analyst', industry: 'Finance & Accounting', technical: false, keywords: ['m&a', 'pitch', 'model', 'lbo', 'client', 'deal'], topics: ['deal execution', 'financial modeling', 'client pitches'] },
  { id: 'risk-analyst', title: 'Risk Analyst', industry: 'Finance & Accounting', technical: false, keywords: ['exposure', 'credit', 'mitigation', 'stress test', 'regulation', 'portfolio'], topics: ['risk frameworks', 'stress testing', 'regulatory compliance'] },
  { id: 'insurance-underwriter', title: 'Insurance Underwriter', industry: 'Finance & Accounting', technical: false, keywords: ['premium', 'claims', 'actuarial', 'policy', 'assessment'], topics: ['risk assessment', 'pricing decisions', 'claims patterns'] },

  // ─── Healthcare ───
  { id: 'staff-nurse', title: 'Staff Nurse', industry: 'Healthcare', technical: false, keywords: ['patient', 'triage', 'medication', 'handover', 'protocol', 'emergency'], topics: ['patient safety', 'shift handovers', 'emergency response'] },
  { id: 'physician', title: 'Resident Physician', industry: 'Healthcare', technical: false, keywords: ['diagnosis', 'patient', 'treatment', 'ethics', 'communication', 'evidence'], topics: ['clinical reasoning', 'breaking bad news', 'evidence-based practice'] },
  { id: 'pharmacist', title: 'Pharmacist', industry: 'Healthcare', technical: false, keywords: ['dosage', 'interaction', 'counseling', 'inventory', 'prescription'], topics: ['drug interactions', 'patient counseling', 'dispensing accuracy'] },
  { id: 'healthcare-admin', title: 'Healthcare Administrator', industry: 'Healthcare', technical: false, keywords: ['compliance', 'staffing', 'budget', 'patient satisfaction', 'accreditation'], topics: ['staffing optimization', 'compliance audits', 'patient experience'] },

  // ─── Government & Civil Services ───
  { id: 'upsc-ias', title: 'Civil Services (IAS/IPS) Aspirant', industry: 'Government & Civil Services', technical: false, keywords: ['governance', 'policy', 'ethics', 'public', 'administration', 'constitution', 'development'], topics: ['ethical governance', 'public policy', 'district administration'] },
  { id: 'bank-po', title: 'Bank Probationary Officer', industry: 'Government & Civil Services', technical: false, keywords: ['banking', 'customer', 'npa', 'rbi', 'financial inclusion', 'loan'], topics: ['financial inclusion', 'NPA management', 'customer service'] },
  { id: 'ssc-officer', title: 'SSC / State Services Officer', industry: 'Government & Civil Services', technical: false, keywords: ['administration', 'public service', 'procedure', 'integrity', 'citizen'], topics: ['administrative procedure', 'citizen services', 'integrity in office'] },
  { id: 'defense-officer', title: 'Defense Services Officer (SSB)', industry: 'Government & Civil Services', technical: false, keywords: ['leadership', 'discipline', 'team', 'nation', 'decision', 'courage'], topics: ['leadership under pressure', 'team cohesion', 'quick decision-making'] },

  // ─── Marketing & Sales ───
  { id: 'digital-marketer', title: 'Digital Marketing Manager', industry: 'Marketing & Sales', technical: false, keywords: ['campaign', 'roi', 'seo', 'conversion', 'audience', 'budget', 'analytics'], topics: ['campaign ROI', 'channel strategy', 'conversion optimization'] },
  { id: 'sales-exec', title: 'Sales Executive / B2B Sales', industry: 'Marketing & Sales', technical: false, keywords: ['quota', 'pipeline', 'objection', 'negotiation', 'crm', 'closing'], topics: ['objection handling', 'pipeline management', 'negotiation'] },
  { id: 'brand-manager', title: 'Brand Manager', industry: 'Marketing & Sales', technical: false, keywords: ['positioning', 'campaign', 'market share', 'consumer', 'launch'], topics: ['brand positioning', 'product launches', 'consumer insights'] },
  { id: 'customer-success', title: 'Customer Success Manager', industry: 'Marketing & Sales', technical: false, keywords: ['retention', 'churn', 'onboarding', 'escalation', 'renewal', 'nps'], topics: ['churn reduction', 'escalation handling', 'renewal strategy'] },

  // ─── Operations, Legal & Education ───
  { id: 'ops-manager', title: 'Operations Manager', industry: 'Operations & Supply Chain', technical: false, keywords: ['process', 'efficiency', 'sop', 'vendor', 'kpi', 'lean'], topics: ['process improvement', 'vendor management', 'operational KPIs'] },
  { id: 'supply-chain', title: 'Supply Chain Analyst', industry: 'Operations & Supply Chain', technical: false, keywords: ['inventory', 'logistics', 'forecast', 'supplier', 'lead time', 'cost'], topics: ['demand forecasting', 'inventory optimization', 'supplier risk'] },
  { id: 'project-manager', title: 'Project Manager', industry: 'Operations & Supply Chain', technical: false, keywords: ['scope', 'timeline', 'stakeholder', 'risk', 'agile', 'budget', 'delivery'], topics: ['scope creep', 'risk registers', 'stakeholder alignment'] },
  { id: 'corporate-lawyer', title: 'Corporate Lawyer / Legal Associate', industry: 'Legal & Education', technical: false, keywords: ['contract', 'compliance', 'due diligence', 'negotiation', 'clause', 'litigation'], topics: ['contract negotiation', 'due diligence', 'regulatory compliance'] },
  { id: 'teacher', title: 'School Teacher / Educator', industry: 'Legal & Education', technical: false, keywords: ['lesson', 'classroom', 'assessment', 'student', 'curriculum', 'inclusive'], topics: ['classroom management', 'inclusive teaching', 'learning outcomes'] },
  { id: 'professor', title: 'Assistant Professor / Lecturer', industry: 'Legal & Education', technical: false, keywords: ['research', 'pedagogy', 'publication', 'curriculum', 'mentoring'], topics: ['research agenda', 'teaching philosophy', 'student mentoring'] },
];

export const INDUSTRIES: string[] = [...new Set(INTERVIEW_ROLES.map((r) => r.industry))];
