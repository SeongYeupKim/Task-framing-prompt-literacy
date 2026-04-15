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

Researchers sign in with the same **Firebase Email/Password** flow as participants (**`@psu.edu`**). The browser reads all documents in **`users`** using the client SDK—**no** Firebase Admin or service-account variables on Vercel.

**Firestore:** publish **`firestore.rules`** from this repo. Rules let each user read/write their own doc and let **any signed-in user** read every **`users`** document (so `/admin` can export). Keep the `/admin` URL off public pages if you do not want participants browsing each other’s data.

Exports: **JSON** (complete nested data), **CSV** (one row per participant; nested fields as JSON strings), **.txt** (human-readable chat logs per UID), including full **`genaiMessages`**.

## Security

- Never commit `.env.local` or API keys.  
- OpenAI key server-side only (`/api/chat`).
- **`/admin` is not a secret gate:** anyone with a study account and the URL can export. Tighten rules (e.g. custom claims or an allow-list collection) if you need stricter access later.

## License

Research use — adjust as needed for your institution.
