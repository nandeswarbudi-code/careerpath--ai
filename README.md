# 🚀 CareerPath AI

**Intelligent career-preparation platform — from dream role to job offer.**

Skill assessment, personalized roadmap with quiz verification, live AI video/voice interviews, resume builder, ATS checker, coding practice (30 problems across JavaScript, C, C++, Python, Java, PHP, and Ruby), and real job search links.

---

## Architecture

```
                    CAREERPATH AI
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Frontend        Backend         Firebase
    React+TS       Node+Express     (BaaS)
    Vite+TW4       Gemini AI          │
    Zustand          │            ┌───┴───┐
       │             │            Auth  Firestore
       │             ▼
    Browser      AI Evaluation
    APIs         Cover Letters
    (TTS/STT)    Live Interview
```

The Node.js backend provides Gemini-based interview generation and scoring. Without it, the frontend falls back to deterministic local question and feedback generation. Firebase provides auth and database via client SDK.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS 4 |
| State | Zustand + Immer |
| Backend | Node.js · Express 5 · TypeScript |
| AI | Google Gemini (multi-model fallback) |
| Auth & DB | Firebase Auth (Google + Email) · Cloud Firestore |
| Voice | Browser SpeechSynthesis + Web Speech API |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/careerpath-ai.git
cd careerpath-ai

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Fill in Firebase values and your Gemini API key in .env

# 4. Run
npm run server     # Terminal 1 — backend on :3001
npm run dev        # Terminal 2 — frontend on :5173
```

### Required environment values

```bash
# Frontend
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend
GEMINI_API_KEY=your_gemini_key
```

Open http://localhost:5173

> Without the backend, the app works with local rule-based scoring (honestly labeled).

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing: `ai-interview-practice-pl-98fed`)
3. Enable **Google + Email/Password** in Authentication → Sign-in method
4. Create **Firestore Database** → Apply these owner-only rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

5. Add your deployment domain to Authentication → Settings → Authorized domains

---

## Deployment

### Frontend → Vercel (recommended)

```bash
# 1. Push to GitHub (see below)

# 2. Go to https://vercel.com
# 3. Import your GitHub repo
# 4. Framework: Vite
# 5. Build command: npm run build
# 6. Output directory: dist
# 7. Add environment variables:
#      VITE_API_URL = https://careerpath-ai-n4ak.onrender.com
#      VITE_FIREBASE_API_KEY = value from Firebase console
#      VITE_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
#      VITE_FIREBASE_DATABASE_URL = your Realtime Database URL
#      VITE_FIREBASE_PROJECT_ID = your Firebase project ID
#      VITE_FIREBASE_STORAGE_BUCKET = your storage bucket
#      VITE_FIREBASE_MESSAGING_SENDER_ID = your sender ID
#      VITE_FIREBASE_APP_ID = your web app ID
#      VITE_FIREBASE_MEASUREMENT_ID = optional Analytics ID
# 8. Deploy
```

### Backend → Render (recommended, free tier)

```bash
# 1. Go to https://render.com
# 2. New → Web Service → Connect GitHub repo
# 3. Settings:
#      Build command: npm install
#      Start command: npx tsx server/index.ts
#      Environment variables:
#        GEMINI_API_KEY = your-key
#        FIREBASE_PROJECT_ID = your-project-id
#        FIREBASE_CLIENT_EMAIL = firebase-adminsdk-...@your-project.iam.gserviceaccount.com
#        FIREBASE_PRIVATE_KEY = service-account private key with \n escaped
# 4. Deploy
```

### Alternative: Deploy both on Render

You can deploy the frontend as a **Static Site** on Render:
- Build command: `npm run build`
- Publish directory: `dist`
- Add env: `VITE_API_URL = https://your-backend.onrender.com`

Firebase web variables belong in Vercel; Firebase Admin variables belong only
on Render. After changing any `VITE_*` variable in Vercel, redeploy because
Vite embeds those values at build time. Add `careerpath-ai-blue.vercel.app` to
Firebase Authentication -> Settings -> Authorized domains.

---

## Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "CareerPath AI — full-stack career preparation platform"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/careerpath-ai.git
git branch -M main
git push -u origin main
```

### Important: `.env` is in `.gitignore`
Your API keys will NOT be pushed to GitHub. After cloning on a new machine or deploying, create a new `.env` file with your keys.

---

## Project Structure

```
├── index.html                    # Entry HTML
├── package.json                  # Dependencies
├── tsconfig.json / vite.config.ts
├── .env / .env.example / .gitignore
├── public/                       # Static public assets
├── server/
│   └── index.ts                  # Node.js + Express + Gemini backend
└── src/
    ├── App.tsx                   # App shell + routing
    ├── main.tsx                  # Bootstrap
    ├── index.css                 # Tailwind + design system (light/dark)
    ├── types.ts                  # Shared types
    ├── lib/                      # Core logic
    │   ├── firebase.ts           # Auth, Firestore
    │   ├── api.ts                # Backend-first, local fallback
    │   ├── store.ts              # Zustand state + theme
    │   ├── localInterviewer.ts   # Local question generator
    │   ├── quizData.ts           # Verification quizzes
    │   ├── speech.ts / tts.ts    # Voice I/O
    │   └── ...
    ├── data/                     # 44 roles, resources, catalogs
    └── components/               # All UI pages and interview views
        └── liveInterview/
            ├── InterviewerAvatar.tsx # Video robot + voice visualizer
            └── LiveInterviewSession.tsx
```

---

## Features

- **44 career roles** across 10 industries
- **Skill assessment** with gap analysis
- **Personalized roadmap** with curated resources + quiz verification
- **Recommended projects & certifications** (inline in roadmap)
- **Resume builder** with ATS keyword checker
- **Live AI video / voice interview** with adaptive role-specific questions
- **Coding practice** — 30 problems (10 easy, 10 medium, 10 hard) per role, runnable in JavaScript, C, C++, Python, Java, PHP, and Ruby
- **Job search links** — LinkedIn, Google Jobs, Indeed, Naukri, Glassdoor, Wellfound
- **Light/Dark theme** toggle
- **Readiness score** — weighted heuristic across all pillars

### Live Interview Fallback

| | Local (always works) | AI (needs backend) |
|---|---|---|
| Mode | Deterministic local questions and feedback | Adaptive Gemini questions and feedback |
| Speed | Instant | 2-5 seconds |
| Quality | Basic fallback experience | Genuine AI contextual feedback |

---

## Environment Variables

| Variable | Required | Where | Purpose |
|---|---|---|---|
| `VITE_API_URL` | Optional | Frontend | Backend URL (default: localhost:3001) |
| `GEMINI_API_KEY` | For AI features | Backend | Google Gemini API key |
| `COMPILER_API_KEY` | Optional | Backend | If needed by a future compile provider; not currently required for the public Judge0-compatible runner |

---

## Online Code Execution

The coding section supports JavaScript, C, C++, Python, Java, PHP, and Ruby by sending code to a backend route that runs it through a public online judge-compatible compiler API.

- JavaScript uses the browser sandbox for quick local execution.
- C/C++/Python/Java/PHP/Ruby run via the backend using the online compiler service.
- Compile errors and runtime errors are surfaced separately for easier debugging.

---

## QA and Pre-Deploy Validation

Run the repository checks before deploying:

```bash
npm run typecheck
npm test -- --run
npm run build
```

Start the backend in a separate terminal and verify its health endpoint:

```bash
npm run server
curl http://localhost:3001/api/health
```

Expected response:

```json
{"ok":true,"engine":"node","gemini":true}
```

### Smoke checklist

- Open `http://localhost:5173` and confirm there are no browser-console errors.
- Sign in with Email/Password and Google Sign-In.
- Reload after signing in and confirm persisted application state.
- Run a live interview with the backend stopped and verify the local question/feedback fallback.
- Run with the backend active and verify adaptive Gemini questions and feedback.
- Confirm video interviews render the animated Gabriel robot with speaking, listening, blinking, and mouth movement states.
- Confirm voice-only interviews render Maya's lightweight microphone and waveform visualizer without the video animation loop.
- Deny microphone and camera permissions and confirm the interview continues with a visible fallback message.
- Test network interruption during an interview and confirm an actionable error is shown.
- Verify roadmap quiz progression, resume ATS scoring, coding practice, job links, and light/dark theme persistence.

### Expected error handling

The application should continue without a crash when:

- Gemini is unavailable, its API key is missing, or its response is malformed.
- Microphone or camera permissions are denied.
- Speech recognition is unsupported or blocked.
- The backend or network becomes unavailable mid-interview.
- Firebase returns an authentication or Firestore permission error.

Browser permission, Firebase, and authentication checks require an interactive browser session and cannot be fully validated by the CLI alone.

---

MIT License — Free for every job seeker.
