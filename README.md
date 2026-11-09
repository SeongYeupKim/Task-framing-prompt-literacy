# Task framing study — data collection web app

**Repository:** [github.com/SeongYeupKim/Task-framing-prompt-literacy](https://github.com/SeongYeupKim/Task-framing-prompt-literacy)

Next.js app for a **three-arm** design: **control** vs **CARE instruction only** vs **CARE instruction + four self-explanation questions**, then a common **GenAI chat → essay** task, **demographics**, a **Canvas PDF** of the essay and chat, and **complete**. Firebase Auth + Firestore, OpenAI chat API (server-side). Participants use a Penn State **`@psu.edu`** email (enforced on auth forms).

**New to Firebase / `.env`?** **[SETUP.md](./SETUP.md)** · **Vercel:** **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**

## Setup

1. **Install:** `cd task-framing-study && npm install`
2. **Environment:** copy `.env.example` → `.env.local` (Firebase `NEXT_PUBLIC_*`, `OPENAI_API_KEY`, `OPENAI_MODEL`).
3. **Firebase:** Email/Password auth; Firestore + rules.
4. **Run:** `npm run dev` → http://localhost:3000

## Conditions (random at first `/study` load)

New assignments are `control` | `instruction` | `instruction_se`. Older documents may still show `instruction_eval`, `two_eval`, or `four_eval`. `two_eval` is treated as `instruction`. `instruction_eval` / `four_eval` stay labeled as the retired pilot arm and are moved on to the main task if they are still on the old lesson or prompt-rating screens. A restart from that retired arm is assigned one of the three current conditions.

| Condition | Flow |
|-----------|------|
| **`control`** | AI acceptance → **guide (main task)** → GenAI → Essay → Demographics → **Canvas PDF** → Complete |
| **`instruction`** | AI acceptance → **CARE reading** → **guide (main task)** → GenAI → Essay → Demographics → **Canvas PDF** → Complete |
| **`instruction_se`** | AI acceptance → **same CARE reading** → **four written questions** (definition, elaboration vs. refinement, judge a short chat, advise that student) → **guide (main task)** → GenAI → Essay → Demographics → **Canvas PDF** → Complete |

The two instruction arms read the same CARE text (contextualization, articulation, responsive elaboration, evaluation-driven refinement). Practice materials use feedback, not the exercise essay. Those arms get a **collapsible CARE reminder** during the **final task**.

## Data stored (`users/{uid}`)

- `condition`, `phase`, timestamps  
- `aiAcceptanceResponses` (20× Likert 1–5), `aiAcceptanceCompletedAt`  
- **Instruction:** `instructionCompletedAt`, `trainingCompletedAt`. **`instruction_se` also stores** `careSeDefinition`, `careSeDistinction`, `careSeJudgment`, `careSeAdvice`, `careSeDistinctionOrder` (`extend_first` or `repair_first`).
- Pilot fields (`instructionSelfExplanation`, matching, `eval1`) remain on older documents.  
- `genaiMessages`, `essayText`, `essaySubmittedAt`. A follow-up prompt also stores `secAfterAiToInput` (AI reply shown → first keystroke) and `secAfterAiToSend` (AI reply shown → send). Wide CSV columns are `st_i_sec_to_input` and `st_i_sec_to_send`.
- `demographics`, `demographicsSubmittedAt`
- `recordPdfDownloadedAt` when the Canvas record is downloaded

## Researcher export (`/admin`)

**Username / password:** built-in defaults are **`admin`** / **`mattandseong`** (override with **`ADMIN_DASHBOARD_*`** / **`ADMIN_EXPORT_SECRET`**).

**Two ways to export the same wide CSV:** (1) **Server** — **`FIREBASE_SERVICE_ACCOUNT_JSON`** / **`FIREBASE_ADMIN_*`** on Vercel. (2) **Browser** — one dashboard login (**default `admin` / `mattandseong`**); the app signs into Firebase as **`admin@psu.edu`** with that same password. **One-time:** add that user under **Authentication → Users** in Firebase and **publish `firestore.rules`** (export account is named in the rules). Optional: **`NEXT_PUBLIC_RESEARCH_EXPORT_EMAIL`** if you use another address (edit rules to match).

Wide CSV includes the CARE answers (`care_se_*`) and, for older rows, the pilot matching and eval1 columns. Order: **email → condition → responses → essay → `st_1`/`ai_1`/… → demographics**.

## Security

- Never commit `.env.local` or API keys.  
- OpenAI key server-side only (`/api/chat`).
- Treat **`ADMIN_DASHBOARD_*`** and the **service account** like full access to participant data; rotate if exposed. Do not rely on obscurity for `/admin`—use strong passwords and restrict who knows the URL.

## License

Research use — adjust as needed for your institution.
