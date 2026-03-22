# Task framing study — data collection web app

**Repository:** [github.com/SeongYeupKim/Task-framing-prompt-literacy](https://github.com/SeongYeupKim/Task-framing-prompt-literacy)

Next.js app for a randomized three-condition study: **AI acceptance (Likert)** → **training** → optional **evaluation tasks** → **GenAI chat** → **essay** → **demographics** → **complete**, with Firebase Auth + Firestore and OpenAI chat API (server-side). Participants **register and sign in with a Penn State `@psu.edu` email** (enforced on the auth forms).

**New to Firebase / `.env`?** Follow the full walkthrough: **[SETUP.md](./SETUP.md)**.

**Deploy to Vercel:** **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)** — set project name **`taskframing`** for **`https://taskframing.vercel.app`**, add env vars + Firebase authorized domain.

## Setup

1. **Install**

   ```bash
   cd task-framing-study
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env.local` and fill in:

   - **Firebase** (from Firebase Console → Project settings → Your apps):  
     `NEXT_PUBLIC_FIREBASE_*`
   - **OpenAI** (server only):  
     `OPENAI_API_KEY`  
     `OPENAI_MODEL` — use the model ID enabled on your key (e.g. `gpt-4o-mini`).  
     *Replace with your approved project model name if different.*

3. **Firebase**

   - Enable **Authentication** → Email/Password.
   - Enable **Firestore** (production mode), then deploy rules:

     ```bash
     firebase deploy --only firestore:rules
     ```

     Or paste `firestore.rules` in the Firebase Console.

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Conditions (random at first `/study` load)

| Condition   | Flow |
|------------|------|
| `control`  | AI acceptance → Training → GenAI → Essay → Demographics → Complete |
| `two_eval` | AI acceptance → Training → Evaluation 1 → GenAI → Essay → Demographics → Complete |
| `four_eval`| AI acceptance → Training → Evaluation 1 → Evaluation 2 → GenAI → Essay → Demographics → Complete |

## Data stored (per user document `users/{uid}`)

- `condition`, `phase`, timestamps  
- `aiAcceptanceResponses`: array of **20** integers (1–5 Likert), `aiAcceptanceCompletedAt`  
- `eval1` / `eval2`: ratings 1–6 and rationales for Students A/B/C  
- `genaiMessages`: full chat log  
- `essayText`, `essaySubmittedAt`  
- `demographics` (PSU email, age, gender, race/ethnicity, name for credit, follow-up intent), `demographicsSubmittedAt`

## Security

- Never commit `.env.local` or API keys.
- OpenAI key stays on the server (`/api/chat` only).

## License

Research use — adjust as needed for your institution.
