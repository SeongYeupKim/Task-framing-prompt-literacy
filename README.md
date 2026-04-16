# Task framing study — data collection web app

**Repository:** [github.com/SeongYeupKim/Task-framing-prompt-literacy](https://github.com/SeongYeupKim/Task-framing-prompt-literacy)

Next.js app for a **three-arm** design: **control (pure)** vs **instruction only** vs **instruction + one evaluation practice**, then a common **GenAI chat → essay** task, **demographics**, **complete**. Firebase Auth + Firestore, OpenAI chat API (server-side). Participants use a Penn State **`@psu.edu`** email (enforced on auth forms).

**New to Firebase / `.env`?** **[SETUP.md](./SETUP.md)** · **Vercel:** **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**

## Setup

1. **Install:** `cd task-framing-study && npm install`
2. **Environment:** copy `.env.example` → `.env.local` (Firebase `NEXT_PUBLIC_*`, `OPENAI_API_KEY`, `OPENAI_MODEL`).
3. **Firebase:** Email/Password auth; Firestore + rules.
4. **Run:** `npm run dev` → http://localhost:3000

## Conditions (random at first `/study` load)

Firestore stores `control` | `instruction` | `instruction_eval`. Legacy documents may still show `two_eval` / `four_eval`; they are **normalized in the app** to `instruction` / `instruction_eval`.

| Condition | Flow |
|-----------|------|
| **`control`** | AI acceptance → **guide (main task)** → GenAI → Essay → Demographics → Complete |
| **`instruction`** | AI acceptance → **Instruction (Part 1 self-explanation + Part 2 matching)** → **guide (main task)** → GenAI → Essay → Demographics → Complete |
| **`instruction_eval`** | AI acceptance → **Instruction** → **guide (evaluation)** → **Eval 1 (sleep & learning topic)** → **guide (main task)** → **GenAI + essay (exercise topic)** → Demographics → Complete |

Intervention arms get a **collapsible “brief instruction reminder”** during the **final task** (and, for `instruction_eval`, also during **Eval 1**).

## Data stored (`users/{uid}`)

- `condition`, `phase`, timestamps  
- `aiAcceptanceResponses` (20× Likert 1–5), `aiAcceptanceCompletedAt`  
- **Instruction:** `instructionSelfExplanation`, `instructionMatchingByDimension`, `instructionCompletedAt`, `trainingCompletedAt`  
- `eval1` (ratings 1–6 + rationales A/B/C); `eval2` deprecated  
- `genaiMessages`, `essayText`, `essaySubmittedAt`  
- `demographics`, `demographicsSubmittedAt`

## Researcher export (`/admin`)

**Username / password** (set on the server as **`ADMIN_DASHBOARD_USERNAME`** and **`ADMIN_DASHBOARD_PASSWORD`** in `.env.local` / Vercel) open the dashboard. **Firebase Admin** credentials (**`FIREBASE_SERVICE_ACCOUNT_JSON`** or the three `FIREBASE_ADMIN_*` vars) let **`POST /api/admin/export-csv`** read every document in **`users`**.

The download is a **single wide CSV**: columns follow the **full-intervention** arm (`instruction_eval`). Control and instruction-only rows leave unused fields **blank**. Column order is **student email → condition → study responses (including 20 AI-acceptance Likerts, instruction fields, eval1)** → **`essay_text`** → **`st_1`, `ai_1`, `st_2`, `ai_2`, …** (main-task GenAI turns) → **demographics**.

## Security

- Never commit `.env.local` or API keys.  
- OpenAI key server-side only (`/api/chat`).
- Treat **`ADMIN_DASHBOARD_*`** and the **service account** like full access to participant data; rotate if exposed. Do not rely on obscurity for `/admin`—use strong passwords and restrict who knows the URL.

## License

Research use — adjust as needed for your institution.
