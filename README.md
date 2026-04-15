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

Password-protected dashboard to download all `users` documents, including full **`genaiMessages`** (every user turn and assistant reply with `createdAt`).

**Vercel / server env (never commit):**

- **`ADMIN_EXPORT_SECRET`** — long random string; enter it as the password on `/admin`.
- **`FIREBASE_SERVICE_ACCOUNT_JSON`** — full JSON of a [Firebase service account](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) private key (single line in Vercel). The account must be able to read Firestore (default “Firebase Admin SDK” service account works).

Exports: **JSON** (complete nested data), **CSV** (one row per participant; nested fields as JSON strings), **.txt** (human-readable chat logs per UID).

## Security

- Never commit `.env.local` or API keys.  
- OpenAI key server-side only (`/api/chat`).
- Treat **`ADMIN_EXPORT_SECRET`** and the **service account JSON** like root access to participant data; rotate if exposed.

## License

Research use — adjust as needed for your institution.
