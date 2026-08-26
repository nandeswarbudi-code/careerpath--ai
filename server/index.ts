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

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT ?? 3001);
const __dir = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dir, 'data');
const STORE_FILE = join(DATA_DIR, 'progress.json');
const PROGRESS_API_KEY = (process.env.PROGRESS_API_KEY ?? '').trim();

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

// AI interview evaluation — semantic LLM analysis
app.post('/api/ai/evaluate', async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const { roleTitle, question, answer, resumeSummary } = req.body;
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
app.post('/api/ai/interview-next', async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const { roleTitle, phase, messages, resumeSummary } = req.body;

  const history = (messages || []).map((m: { role: string; text: string }) =>
    `${m.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${m.text}`
  ).join('\n');

  const prompt = `You are a senior ${roleTitle} interviewer. Current phase: ${phase}.
${resumeSummary ? `Candidate: ${resumeSummary}` : ''}

Rules: Ask ONE question. React naturally to the previous answer. Sound human, not scripted.

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
app.post('/api/ai/interview-feedback', async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const { roleTitle, messages } = req.body;

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
app.post('/api/ai/cover-letter', async (req, res) => {
  if (!geminiOk) return res.status(503).json({ error: 'Gemini not configured' });
  const { name, roleTitle, company, resumeText, tone } = req.body;
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
  const p = store[req.params.uid];
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ progress: p });
});

app.put('/api/progress/:uid', requireProgressAuth, (req, res) => {
  const uid = req.params.uid;
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
