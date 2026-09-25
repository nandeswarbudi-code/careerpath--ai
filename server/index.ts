/**
 * CareerPath AI — Node.js Backend
 *
 * Provides:
 * 1. Gemini AI interview evaluation
 * 2. AI cover letter generation
 * 3. Live AI interview questions + feedback
 * 4. Coding execution through Judge0
 * 5. Progress storage
 *
 * Run:
 *   npx tsx server/index.ts
 *
 * Port:
 *   PORT environment variable or 3001
 */

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GoogleGenAI } from '@google/genai';

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';

import {
  getAuth as getAdminAuth,
  type Auth as AdminAuth,
} from 'firebase-admin/auth';


// ============================================================
// APP SETUP
// ============================================================

const app = express();


// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://careerpath-ai-blue.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for health checks, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS origin: ${origin}`);

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-User-UID',
    ],
  })
);


// ============================================================
// JSON BODY
// ============================================================

app.use(
  express.json({
    limit: '1mb',
  })
);


// ============================================================
// SERVER CONFIGURATION
// ============================================================

const PORT = Number(process.env.PORT ?? 3001);

const __dir = dirname(
  fileURLToPath(import.meta.url)
);

const DATA_DIR = join(__dir, 'data');

const STORE_FILE = join(
  DATA_DIR,
  'progress.json'
);


// ============================================================
// PROGRESS API KEY
// ============================================================

const PROGRESS_API_KEY =
  (process.env.PROGRESS_API_KEY ?? '').trim();


// ============================================================
// AI RATE LIMITING
// ============================================================

const aiRequests = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

const AI_WINDOW_MS = 60_000;

const AI_REQUESTS_PER_WINDOW = 30;


// ============================================================
// FIREBASE ADMIN
// ============================================================

let adminAuth: AdminAuth | null = null;

try {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim();

  const clientEmail =
    process.env.FIREBASE_CLIENT_EMAIL?.trim();

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .trim();


  /*
   * Preferred configuration for Render:
   *
   * FIREBASE_PROJECT_ID
   * FIREBASE_CLIENT_EMAIL
   * FIREBASE_PRIVATE_KEY
   */

  if (
    projectId &&
    clientEmail &&
    privateKey
  ) {
    const adminApp =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

    adminAuth = getAdminAuth(adminApp);

    console.log(
      '✅ Firebase Admin authentication configured.'
    );
  } else {
    /*
     * Optional fallback for environments where
     * Google Application Default Credentials exist.
     */

    const adminApp =
      getApps()[0] ??
      initializeApp({
        credential: applicationDefault(),
      });

    adminAuth = getAdminAuth(adminApp);

    console.log(
      '✅ Firebase Admin configured using application default credentials.'
    );
  }
} catch (error) {
  adminAuth = null;

  console.warn(
    '⚠️ Firebase Admin is not configured.'
  );

  console.warn(
    'AI routes requiring authentication will return 503.'
  );
}


// ============================================================
// AI AUTHENTICATION
// ============================================================

async function requireAiAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!adminAuth) {
    return res.status(503).json({
      error: 'AI authentication is not configured.',
    });
  }

  const authorization =
    req.get('authorization') ?? '';

  const token =
    authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : '';

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.',
    });
  }

  try {
    await adminAuth.verifyIdToken(token);

    next();
  } catch (error) {
    console.warn(
      'Firebase token verification failed:',
      error instanceof Error
        ? error.message
        : error
    );

    return res.status(401).json({
      error: 'Invalid authentication token.',
    });
  }
}


// ============================================================
// AI RATE LIMIT
// ============================================================

function requireAiRateLimit(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const now = Date.now();

  const key =
    req.ip ||
    req.socket.remoteAddress ||
    'unknown';

  const current = aiRequests.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    aiRequests.set(key, {
      count: 1,
      resetAt: now + AI_WINDOW_MS,
    });

    return next();
  }

  if (
    current.count >=
    AI_REQUESTS_PER_WINDOW
  ) {
    return res.status(429).json({
      error:
        'Too many AI requests. Please try again shortly.',
    });
  }

  current.count += 1;

  next();
}


// ============================================================
// TEXT SANITIZATION
// ============================================================

function boundedText(
  value: unknown,
  maxLength: number
): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .slice(0, maxLength);
}


// ============================================================
// PROGRESS AUTHENTICATION
// ============================================================

function requireProgressAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!PROGRESS_API_KEY) {
    return res.status(503).json({
      error:
        'Progress API is disabled. Set PROGRESS_API_KEY to enable it.',
    });
  }

  const authorization =
    req.get('authorization') ?? '';

  const token =
    authorization.startsWith('Bearer ')
      ? authorization.slice(7).trim()
      : '';

  if (token !== PROGRESS_API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized.',
    });
  }

  next();
}


// ============================================================
// GEMINI SETUP
// ============================================================

const GEMINI_KEY =
  (process.env.GEMINI_API_KEY ?? '').trim();

const geminiOk =
  GEMINI_KEY.length > 10;

const ai =
  geminiOk
    ? new GoogleGenAI({
        apiKey: GEMINI_KEY,
      })
    : null;


if (geminiOk) {
  console.log(
    '✅ Gemini API key detected.'
  );
} else {
  console.warn(
    '⚠️ GEMINI_API_KEY not set. AI features disabled.'
  );
}


// ============================================================
// GEMINI MODELS
// ============================================================

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];


// ============================================================
// GEMINI HELPER
// ============================================================

async function askGemini(
  prompt: string
): Promise<string | null> {

  if (!ai) {
    return null;
  }

  for (const model of MODELS) {
    try {

      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
        });

      if (response.text) {
        return response.text;
      }

    } catch (error) {

      console.warn(
        `Gemini model ${model} failed:`,
        error instanceof Error
          ? error.message
          : error
      );
    }
  }

  return null;
}


// ============================================================
// JSON EXTRACTION
// ============================================================

function extractJson(
  text: string
): Record<string, unknown> | null {

  const match =
    text.match(/\{[\s\S]*\}/);

  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}


// ============================================================
// FILE STORE
// ============================================================

function readStore(): Record<
  string,
  unknown
> {

  try {

    if (!existsSync(STORE_FILE)) {
      return {};
    }

    return JSON.parse(
      readFileSync(
        STORE_FILE,
        'utf-8'
      )
    );

  } catch {

    return {};
  }
}


function writeStore(
  store: Record<string, unknown>
) {

  if (!existsSync(DATA_DIR)) {
    mkdirSync(
      DATA_DIR,
      {
        recursive: true,
      }
    );
  }

  writeFileSync(
    STORE_FILE,
    JSON.stringify(
      store,
      null,
      2
    ),
    'utf-8'
  );
}


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  '/api/health',
  (_req, res) => {

    res.json({
      ok: true,
      engine: 'node',
      gemini: geminiOk,
      firebaseAdmin: Boolean(
        adminAuth
      ),
      environment:
        process.env.NODE_ENV ??
        'development',
    });
  }
);


// ============================================================
// JUDGE0
// ============================================================

const COMPILER_LANGUAGES =
  new Set([
    'c',
    'cpp',
    'python',
    'java',
    'php',
    'ruby',
  ]);


const JUDGE0_LANGUAGE_IDS: Record<
  string,
  number
> = {
  c: 50,
  cpp: 54,
  python: 71,
  java: 62,
  php: 68,
  ruby: 72,
};


app.post(
  '/api/code/execute',
  requireAiRateLimit,
  async (req, res) => {

    const language =
      typeof req.body.language === 'string'
        ? req.body.language
        : '';

    const code =
      typeof req.body.code === 'string'
        ? req.body.code
        : '';

    const stdin =
      typeof req.body.stdin === 'string'
        ? req.body.stdin
        : '';


    if (
      !COMPILER_LANGUAGES.has(language)
    ) {
      return res.status(400).json({
        error:
          'Unsupported compiled language.',
      });
    }


    if (!code.trim()) {
      return res.status(400).json({
        error:
          'Code is required.',
      });
    }


    if (
      code.length > 30_000 ||
      stdin.length > 10_000
    ) {
      return res.status(413).json({
        error:
          'Code or input is too large.',
      });
    }


    try {

      const response =
        await fetch(
          'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              language_id:
                JUDGE0_LANGUAGE_IDS[
                  language
                ],

              source_code:
                code,

              stdin,
            }),

            signal:
              AbortSignal.timeout(
                15_000
              ),
          }
        );


      if (!response.ok) {
        return res.status(502).json({
          error:
            'Online compiler rejected the request.',
        });
      }


      const result =
        await response.json() as {
          compile_output?:
            string | null;

          stdout?:
            string | null;

          stderr?:
            string | null;

          message?:
            string | null;

          status?: {
            id?: number;
            description?:
              string;
          };
        };


      const compileOutput =
        result.compile_output ?? '';


      const runOutput = [
        result.stdout ?? '',
        result.stderr ?? '',
        result.message ?? '',
      ]
        .filter(Boolean)
        .join('\n');


      const statusId =
        result.status?.id ?? 0;


      let status:
        | 'success'
        | 'compile-error'
        | 'runtime-error';


      if (compileOutput) {
        status =
          'compile-error';
      } else if (
        statusId === 3
      ) {
        status = 'success';
      } else {
        status =
          'runtime-error';
      }


      return res.json({
        compileOutput,
        runOutput,
        status,
      });

    } catch (error) {

      console.error(
        'Judge0 error:',
        error
      );

      return res.status(502).json({
        error:
          'Online compiler is unavailable or timed out.',
      });
    }
  }
);


// ============================================================
// AI INTERVIEW EVALUATION
// ============================================================

app.post(
  '/api/ai/evaluate',
  requireAiAuth,
  requireAiRateLimit,
  async (req, res) => {

    if (!geminiOk) {
      return res.status(503).json({
        error:
          'Gemini is not configured.',
      });
    }


    const roleTitle =
      boundedText(
        req.body.roleTitle,
        120
      );

    const question =
      boundedText(
        req.body.question,
        2000
      );

    const answer =
      boundedText(
        req.body.answer,
        6000
      );

    const resumeSummary =
      boundedText(
        req.body.resumeSummary,
        3000
      );


    if (!question || !answer) {
      return res.status(400).json({
        error:
          'question and answer are required.',
      });
    }


    const prompt = `
You are a senior ${
      roleTitle || 'technical'
    } interviewer.

Evaluate the candidate's answer honestly.

Question:
${question}

Answer:
${answer}

${
  resumeSummary
    ? `Candidate background:
${resumeSummary}`
    : ''
}

Return ONLY valid JSON:

{
  "relevance": 0,
  "structure": 0,
  "depth": 0,
  "clarity": 0,
  "roleFit": 0,
  "strengths": [
    "specific strength"
  ],
  "improvements": [
    "actionable improvement"
  ],
  "followUp": "A useful follow-up question",
  "overallHint": "One concise improvement tip"
}

Use scores from 0 to 100.
Be honest and reference specific parts of the answer.
`;


    const text =
      await askGemini(prompt);


    if (!text) {
      return res.status(500).json({
        error:
          'AI evaluation failed.',
      });
    }


    const parsed =
      extractJson(text);


    if (!parsed) {
      return res.status(500).json({
        error:
          'Failed to parse AI response.',
      });
    }


    return res.json({
      evaluation: parsed,
      source: 'gemini',
    });
  }
);


// ============================================================
// LIVE AI INTERVIEW — NEXT QUESTION
// ============================================================

app.post(
  '/api/ai/interview-next',
  requireAiAuth,
  requireAiRateLimit,
  async (req, res) => {

    if (!geminiOk) {
      return res.status(503).json({
        error:
          'Gemini is not configured.',
      });
    }


    const roleTitle =
      boundedText(
        req.body.roleTitle,
        120
      );


    const roleKeywords =
      Array.isArray(
        req.body.roleKeywords
      )
        ? req.body.roleKeywords
            .slice(0, 12)
            .map(
              (value: unknown) =>
                boundedText(
                  value,
                  60
                )
            )
            .join(', ')
        : '';


    const roleTopics =
      Array.isArray(
        req.body.roleTopics
      )
        ? req.body.roleTopics
            .slice(0, 8)
            .map(
              (value: unknown) =>
                boundedText(
                  value,
                  80
                )
            )
            .join(', ')
        : '';


    const phase =
      boundedText(
        req.body.phase,
        40
      );


    const resumeSummary =
      boundedText(
        req.body.resumeSummary,
        3000
      );


    const messages =
      Array.isArray(
        req.body.messages
      )
        ? req.body.messages
            .slice(-30)
            .map(
              (
                message: {
                  role?: unknown;
                  text?: unknown;
                }
              ) => ({
                role:
                  message.role ===
                  'interviewer'
                    ? 'interviewer'
                    : 'candidate',

                text:
                  boundedText(
                    message.text,
                    2000
                  ),
              })
            )
        : [];


    const history =
      messages
        .map(
          (
            message: {
              role: string;
              text: string;
            }
          ) =>
            `${
              message.role ===
              'interviewer'
                ? 'Interviewer'
                : 'Candidate'
            }: ${message.text}`
        )
        .join('\n');


    const prompt = `
You are a senior ${
      roleTitle || 'technical'
    } interviewer.

Current phase:
${phase}

Role-specific skills:
${
  roleKeywords ||
  'the role requirements'
}

Role-specific topics:
${
  roleTopics ||
  'the role responsibilities'
}

${
  resumeSummary
    ? `Candidate background:
${resumeSummary}`
    : ''
}

Rules:

1. Ask ONE question.
2. Make it specific to the role.
3. React naturally to the previous answer.
4. Sound human, not scripted.
5. Avoid generic questions unless they are relevant.

Conversation:

${
  history ||
  '(Start the interview)'
}

Return ONLY valid JSON:

{
  "transitionalPhrase":
    "short reaction to the previous answer",

  "text":
    "your next interview question",

  "phase":
    "${phase}",

  "isFinal":
    false
}
`;


    const text =
      await askGemini(prompt);


    if (!text) {
      return res.status(500).json({
        error:
          'Failed to generate the next interview question.',
      });
    }


    const parsed =
      extractJson(text);


    if (!parsed) {
      return res.status(500).json({
        error:
          'Failed to parse interview response.',
      });
    }


    return res.json({
      next: parsed,
      source: 'gemini',
    });
  }
);


// ============================================================
// LIVE AI INTERVIEW — FINAL FEEDBACK
// ============================================================

app.post(
  '/api/ai/interview-feedback',
  requireAiAuth,
  requireAiRateLimit,
  async (req, res) => {

    if (!geminiOk) {
      return res.status(503).json({
        error:
          'Gemini is not configured.',
      });
    }


    const roleTitle =
      boundedText(
        req.body.roleTitle,
        120
      );


    const messages =
      Array.isArray(
        req.body.messages
      )
        ? req.body.messages
            .slice(-40)
            .map(
              (
                message: {
                  role?: unknown;
                  text?: unknown;
                }
              ) => ({
                role:
                  message.role ===
                  'interviewer'
                    ? 'interviewer'
                    : 'candidate',

                text:
                  boundedText(
                    message.text,
                    2000
                  ),
              })
            )
        : [];


    const history =
      messages
        .map(
          (
            message: {
              role: string;
              text: string;
            }
          ) =>
            `${
              message.role ===
              'interviewer'
                ? 'Interviewer'
                : 'Candidate'
            }: ${message.text}`
        )
        .join('\n');


    const prompt = `
Review this ${
      roleTitle || 'technical'
    } interview.

Transcript:

${history}

Return ONLY valid JSON:

{
  "overallScore": 0,
  "communication": 0,
  "technicalKnowledge": 0,
  "confidence": 0,
  "problemSolving": 0,

  "strengths": [
    "specific strength"
  ],

  "weaknesses": [
    "specific weakness"
  ],

  "improvements": [
    "actionable improvement"
  ],

  "summary":
    "2-3 sentence honest assessment"
}

Use scores from 0 to 100.
Base the feedback only on the transcript.
`;


    const text =
      await askGemini(prompt);


    if (!text) {
      return res.status(500).json({
        error:
          'Failed to generate interview feedback.',
      });
    }


    const parsed =
      extractJson(text);


    if (!parsed) {
      return res.status(500).json({
        error:
          'Failed to parse interview feedback.',
      });
    }


    return res.json({
      feedback: parsed,
      source: 'gemini',
    });
  }
);


// ============================================================
// COVER LETTER
// ============================================================

app.post(
  '/api/ai/cover-letter',
  requireAiAuth,
  requireAiRateLimit,
  async (req, res) => {

    if (!geminiOk) {
      return res.status(503).json({
        error:
          'Gemini is not configured.',
      });
    }


    const name =
      boundedText(
        req.body.name,
        120
      );

    const roleTitle =
      boundedText(
        req.body.roleTitle,
        120
      );

    const company =
      boundedText(
        req.body.company,
        160
      );

    const resumeText =
      boundedText(
        req.body.resumeText,
        6000
      );

    const tone =
      boundedText(
        req.body.tone,
        40
      );


    const prompt = `
Write a ${
      tone || 'professional'
    } cover letter.

Target role:
${roleTitle}

Company:
${company || 'the company'}

Candidate:
${name || 'The candidate'}

Resume:
${resumeText || 'Not provided'}

Requirements:

- Keep it professional.
- Make it relevant to the target role.
- Do not invent qualifications.
- Keep it under 300 words.

Return only the cover letter text.
`;


    const text =
      await askGemini(prompt);


    if (!text) {
      return res.status(500).json({
        error:
          'Failed to generate cover letter.',
      });
    }


    return res.json({
      letter:
        text.trim(),
      source: 'gemini',
    });
  }
);


// ============================================================
// PROGRESS — GET
// ============================================================

app.get(
  '/api/progress/:uid',
  requireProgressAuth,
  (req, res) => {

    const store =
      readStore();

    const uid =
      typeof req.params.uid ===
      'string'
        ? req.params.uid
        : '';


    const progress =
      store[uid];


    if (!progress) {
      return res.status(404).json({
        error: 'Not found.',
      });
    }


    return res.json({
      progress,
    });
  }
);


// ============================================================
// PROGRESS — UPDATE
// ============================================================

app.put(
  '/api/progress/:uid',
  requireProgressAuth,
  (req, res) => {

    const uid =
      typeof req.params.uid ===
      'string'
        ? req.params.uid
        : '';


    const tokenUid =
      req.get('x-user-uid');


    if (
      tokenUid &&
      tokenUid !== uid
    ) {
      return res.status(403).json({
        error: 'Forbidden.',
      });
    }


    const store =
      readStore();


    store[uid] = {
      ...req.body,
      updatedAt:
        new Date().toISOString(),
    };


    writeStore(store);


    return res.json({
      ok: true,
    });
  }
);


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {

    console.error(
      'Server error:',
      error
    );


    if (
      error instanceof Error &&
      error.message.startsWith(
        'CORS blocked'
      )
    ) {
      return res.status(403).json({
        error:
          'CORS origin is not allowed.',
      });
    }


    return res.status(500).json({
      error:
        'Internal server error.',
    });
  }
);


// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  () => {

    console.log('');
    console.log(
      '🚀 CareerPath AI backend started'
    );

    console.log(
      `📡 Port: ${PORT}`
    );

    console.log(
      `🌐 Frontend: ${
        process.env.FRONTEND_URL ??
        'https://careerpath-ai-blue.vercel.app'
      }`
    );

    console.log(
      `🤖 Gemini: ${
        geminiOk
          ? 'configured'
          : 'not configured'
      }`
    );

    console.log(
      `🔥 Firebase Admin: ${
        adminAuth
          ? 'configured'
          : 'not configured'
      }`
    );

    console.log('');
    console.log(
      'GET  /api/health'
    );

    console.log(
      'POST /api/code/execute'
    );

    console.log(
      'POST /api/ai/evaluate'
    );

    console.log(
      'POST /api/ai/interview-next'
    );

    console.log(
      'POST /api/ai/interview-feedback'
    );

    console.log(
      'POST /api/ai/cover-letter'
    );

    console.log(
      'GET/PUT /api/progress/:uid'
    );

    console.log('');
  }
);