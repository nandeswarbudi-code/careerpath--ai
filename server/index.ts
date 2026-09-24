/**
 * CareerPath AI — Node.js Backend
 *
 * Provides:
 *   1. Gemini AI interview evaluation (semantic, not rule-based)
 *   2. AI cover letter generation
 *   3. Live AI interview questions + feedback
 *   4. Progress storage (file-based, or Firebase Admin if configured)
 *
 * The API key stays server-side — never exposed to the browser.
 *
 * Run:  npx tsx server/index.ts
 * Port: 3001 (override with PORT env var)
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth, type Auth as AdminAuth } from 'firebase-admin/auth';

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
}));
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT ?? 3001);
const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, 'data');
const STORE_FILE = join(DATA_DIR, 'progress.json');
const PROGRESS_API_KEY = (process.env.PROGRESS_API_KEY ?? '').trim();
const aiRequests = new Map<string, { count: number; resetAt: number }>();
const AI_WINDOW_MS = 60_000;
const AI_REQUESTS_PER_WINDOW = 30;
let adminAuth: AdminAuth | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const adminApp = getApps()[0] ?? initializeApp(
    projectId && clientEmail && privateKey
      ? { credential: cert({ projectId, clientEmail, privateKey }) }
      : { credential: applicationDefault() },
  );
  adminAuth = getAdminAuth(adminApp);
} catch {
  console.warn('Firebase Admin credentials are not configured; AI routes require Firebase authentication and are disabled.');
}

function requireAiRateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = aiRequests.get(key);
  if (!current || current.resetAt <= now) {
    aiRequests.set(key, { count: 1, resetAt: now + AI_WINDOW_MS });
    return next();
  }
  if (current.count >= AI_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many AI requests. Please try again shortly.' });
  }
  current.count += 1;
  next();
}

async function requireAiAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!adminAuth) return res.status(503).json({ error: 'AI authentication is not configured' });
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    await adminAuth.verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
}

function boundedText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function requireProgressAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!PROGRESS_API_KEY) {
    return res.status(503).json({ error: 'Progress API is disabled. Set PROGRESS_API_KEY to enable it.' });
  }

  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (token !== PROGRESS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// ─── Gemini setup ───────────────────────────────────────

const GEMINI_KEY = (process.env.GEMINI_API_KEY ?? '').trim();
const geminiOk = GEMINI_KEY.length > 10;
const ai = geminiOk ? new GoogleGenAI({ apiKey: GEMINI_KEY }) : null;

if (geminiOk) console.log('✅ Gemini API key detected.');
else console.warn('⚠️  GEMINI_API_KEY not set. AI features disabled.');

const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function askGemini(prompt: string): Promise<string | null> {
  if (!ai) return null;
  for (const model of MODELS) {
    try {
      const r = await ai.models.generateContent({ model, contents: prompt });
      if (r.text) return r.text;
    } catch (e) {
      console.warn(`Model ${model} failed:`, (e as Error).message);
    }
  }
  return null;
}

function extractJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

// ─── File store ─────────────────────────────────────────

function readStore(): Record<string, unknown> {
  try { return existsSync(STORE_FILE) ? JSON.parse(readFileSync(STORE_FILE, 'utf-8')) : {}; } catch { return {}; }
}
function writeStore(s: Record<string, unknown>) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(s, null, 2), 'utf-8');
}

// ─── Routes ─────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, engine: 'node', gemini: geminiOk });
});

const COMPILER_LANGUAGES = new Set(['c', 'cpp', 'python', 'java', 'php', 'ruby']);
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
  php: 68,
  ruby: 72,
};

app.post('/api/code/execute', requireAiRateLimit, async (req, res) => {
  const language = typeof req.body.language === 'string' ? req.body.language : '';
  const code = typeof req.body.code === 'string' ? req.body.code : '';
  const stdin = typeof req.body.stdin === 'string' ? req.body.stdin : '';
  if (!COMPILER_LANGUAGES.has(language)) return res.status(400).json({ error: 'Unsupported compiled language' });
  if (!code.trim()) return res.status(400).json({ error: 'Code is required' });
  if (code.length > 30_000 || stdin.length > 10_000) return res.status(413).json({ error: 'Code or input is too large' });

  try {
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language_id: JUDGE0_LANGUAGE_IDS[language], source_code: code, stdin }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return res.status(502).json({ error: 'Online compiler rejected the request' });
    const result = await response.json() as {
      compile_output?: string | null;
      stdout?: string | null;
      stderr?: string | null;
      message?: string | null;
      status?: { id?: number; description?: string };
    };
    const compileOutput = result.compile_output ?? '';
    const runOutput = [result.stdout ?? '', result.stderr ?? '', result.message ?? '']
      .filter(Boolean).join('\n');
    const statusId = result.status?.id ?? 0;
    const status = compileOutput ? 'compile-error'
      : statusId === 3 ? 'success' : 'runtime-error';
    res.json({ compileOutput, runOutput, status });
  } catch {
    res.status(502).json({ error: 'Online compiler is unavailable or timed out' });
  }
});

// AI interview evaluation — semantic LLM analysis
app.post('/api/ai/evaluate', requireAiAuth, requireAiRateLimit, async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const roleTitle = boundedText(req.body.roleTitle, 120);
  const question = boundedText(req.body.question, 2000);
  const answer = boundedText(req.body.answer, 6000);
  const resumeSummary = boundedText(req.body.resumeSummary, 3000);
  if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });

  const prompt = `You are a senior ${roleTitle || 'technical'} interviewer. Evaluate this answer.

Question: ${question}
Answer: ${answer}
${resumeSummary ? `Candidate background: ${resumeSummary}` : ''}

Return ONLY valid JSON:
{
  "relevance": 0-100,
  "structure": 0-100,
  "depth": 0-100,
  "clarity": 0-100,
  "roleFit": 0-100,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["actionable tip 1", "actionable tip 2"],
  "followUp": "A sharp follow-up question",
  "overallHint": "One concise improvement tip"
}
Be honest. Reference specific parts of the answer.`;

  const text = await askGemini(prompt);
  if (!text) return res.status(500).json({ error: 'AI evaluation failed' });
  const parsed = extractJson(text);
  if (!parsed) return res.status(500).json({ error: 'Failed to parse AI response' });
  res.json({ evaluation: parsed, source: 'gemini' });
});

// Live AI interview — next question
app.post('/api/ai/interview-next', requireAiAuth, requireAiRateLimit, async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const roleTitle = boundedText(req.body.roleTitle, 120);
  const roleKeywords = Array.isArray(req.body.roleKeywords)
    ? req.body.roleKeywords.slice(0, 12).map((value: unknown) => boundedText(value, 60)).join(', ')
    : '';
  const roleTopics = Array.isArray(req.body.roleTopics)
    ? req.body.roleTopics.slice(0, 8).map((value: unknown) => boundedText(value, 80)).join(', ')
    : '';
  const phase = boundedText(req.body.phase, 40);
  const resumeSummary = boundedText(req.body.resumeSummary, 3000);
  const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-30).map((message: { role?: unknown; text?: unknown }) => ({
    role: message.role === 'interviewer' ? 'interviewer' : 'candidate',
    text: boundedText(message.text, 2000),
  })) : [];

  const history = (messages || []).map((m: { role: string; text: string }) =>
    `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.text}`
  ).join('\n');

  const prompt = `You are a senior ${roleTitle} interviewer. Current phase: ${phase}.
Role-specific skills: ${roleKeywords || 'the role requirements'}.
Role-specific topics: ${roleTopics || 'the role responsibilities'}.
${resumeSummary ? `Candidate: ${resumeSummary}` : ''}

Rules: Ask ONE question that is specific to the role skills or topics above. React naturally to the previous answer. Sound human, not scripted. Avoid generic software-engineering questions unless this is a software role.

Conversation:
${history || '(Start the interview)'}

Return ONLY JSON:
{
  "transitionalPhrase": "short reaction to last answer",
  "text": "your next question",
  "phase": "${phase}",
  "isFinal": false
}`;

  const text = await askGemini(prompt);
  if (!text) return res.status(500).json({ error: 'Failed' });
  const parsed = extractJson(text);
  if (!parsed) return res.status(500).json({ error: 'Parse failed' });
  res.json({ next: parsed, source: 'gemini' });
});

// Live AI interview — final feedback
app.post('/api/ai/interview-feedback', requireAiAuth, requireAiRateLimit, async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const roleTitle = boundedText(req.body.roleTitle, 120);
  const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-40).map((message: { role?: unknown; text?: unknown }) => ({
    role: message.role === 'interviewer' ? 'interviewer' : 'candidate',
    text: boundedText(message.text, 2000),
  })) : [];

  const history = (messages || []).map((m: { role: string; text: string }) =>
    `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.text}`
  ).join('\n');

  const prompt = `Review this ${roleTitle} interview and provide detailed feedback.

Transcript:
${history}

Return ONLY JSON:
{
  "overallScore": 72,
  "communication": 75,
  "technicalKnowledge": 68,
  "confidence": 74,
  "problemSolving": 70,
  "strengths": ["specific strength from transcript"],
  "weaknesses": ["specific weakness from transcript"],
  "improvements": ["actionable tip"],
  "summary": "2-3 sentence honest assessment"
}`;

  const text = await askGemini(prompt);
  if (!text) return res.status(500).json({ error: 'Failed' });
  const parsed = extractJson(text);
  if (!parsed) return res.status(500).json({ error: 'Parse failed' });
  res.json({ feedback: parsed, source: 'gemini' });
});

// Cover letter
app.post('/api/ai/cover-letter', requireAiAuth, requireAiRateLimit, async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const name = boundedText(req.body.name, 120);
  const roleTitle = boundedText(req.body.roleTitle, 120);
  const company = boundedText(req.body.company, 160);
  const resumeText = boundedText(req.body.resumeText, 6000);
  const tone = boundedText(req.body.tone, 40);
  const prompt = `Write a ${tone || 'professional'} cover letter for ${roleTitle} at ${company || 'the company'}.
Candidate: ${name || 'The candidate'}
Resume: ${resumeText || 'Not provided'}
Return only the letter text, under 300 words.`;

  const text = await askGemini(prompt);
  if (!text) return res.status(500).json({ error: 'Failed' });
  res.json({ letter: text.trim(), source: 'gemini' });
});

// Progress CRUD
app.get('/api/progress/:uid', requireProgressAuth, (req, res) => {
  const store = readStore();
  const uid = typeof req.params.uid === 'string' ? req.params.uid : '';
  const p = store[uid];
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ progress: p });
});

app.put('/api/progress/:uid', requireProgressAuth, (req, res) => {
  const uid = typeof req.params.uid === 'string' ? req.params.uid : '';
  const tokenUid = req.get('x-user-uid');
  if (tokenUid && tokenUid !== uid) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const store = readStore();
  store[uid] = { ...req.body, updatedAt: new Date().toISOString() };
  writeStore(store);
  res.json({ ok: true });
});

// ─── Start ──────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 CareerPath AI backend → http://localhost:${PORT}`);
  console.log('   POST /api/ai/evaluate          — Gemini interview evaluation');
  console.log('   POST /api/ai/interview-next     — Live AI interview question');
  console.log('   POST /api/ai/interview-feedback  — Interview feedback report');
  console.log('   POST /api/ai/cover-letter        — Cover letter generation');
  console.log('   GET/PUT /api/progress/:uid       — User progress\n');
});
