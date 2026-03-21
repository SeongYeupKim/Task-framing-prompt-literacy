# Step-by-step setup (beginner-friendly)

Follow these in order. You only do this **once** per computer (and again when you deploy online).

---

## Part A — Create a Firebase project (website database + login)

1. Open **[Firebase Console](https://console.firebase.google.com)** in your browser.
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g. `task-framing-study`) → **Continue**.
4. Google Analytics: you can turn it **off** for simplicity → **Create project** → wait → **Continue**.

### A1 — Register a “Web” app to get config values

5. On the project overview, click the **Web** icon `</>` (“Add app” → Web).
6. App nickname: e.g. `study-web` → **Register app**.
7. You will see **Firebase configuration** with several keys. **Keep this tab open** — you will copy these into `.env.local` later.

### A2 — Enable Email login

8. Left menu → **Build** → **Authentication** → **Get started**.
9. Tab **Sign-in method** → click **Email/Password** → **Enable** → **Save**.

### A3 — Enable Firestore (database)

10. Left menu → **Build** → **Firestore Database** → **Create database**.
11. Choose **Start in production mode** (we will add rules from this repo) → **Next**.
12. Pick a **location** close to you → **Enable**.

### A4 — Paste security rules (so each user only sees their own data)

13. In Firestore, open the **Rules** tab.
14. Replace everything with the contents of **`firestore.rules`** in this project (copy from the file in Cursor), then click **Publish**.

---

## Part B — Put secrets in `.env.local` (never upload to GitHub)

**If Cursor search (Cmd+P) says “no matching results” for `.env.local`:**  
That file is **gitignored**, so some editors hide it. This repo includes **`.vscode/settings.json`** so the sidebar shows gitignored files—**reload the window** (Cmd+Shift+P → “Reload Window”) after pulling. Or edit via **`local-env-template.txt`** (visible name), then run: `cp local-env-template.txt .env.local`

1. In Cursor (or Finder), open the **`task-framing-study`** folder.
2. Find **`.env.example`** in the `task-framing-study` folder. **Duplicate** it (copy/paste in Finder, or in Cursor: right-click → Copy → Paste).
3. Rename the copy to **`.env.local`** (exact name: starts with a dot).
4. Open **`.env.local`** in a text editor.

### B1 — Fill Firebase (from Part A, step 7)

For each line, paste the value from Firebase **without** extra spaces or quotes:

| Line in `.env.local`        | Where it comes from in Firebase config |
|----------------------------|----------------------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |

Example shape (use **your** values, not these):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### B2 — OpenAI API key

1. Go to **[OpenAI API keys](https://platform.openai.com/api-keys)** (log in).
2. **Create new secret key** → copy it once (you may not see it again).
3. In **`.env.local`**, set:

```env
OPENAI_API_KEY=sk-proj-...paste-your-full-key-here...
```

4. Set the model name your account allows, for example:

```env
OPENAI_MODEL=gpt-4o-mini
```

If your lab uses another model name, replace `gpt-4o-mini` with that exact name.

5. **Save** `.env.local`.

**Important:** Do **not** commit `.env.local` to Git. This project already ignores it.

---

## Part C — Install and run the website on your computer

1. Open **Terminal** (Mac: Spotlight → type `Terminal`).
2. Go to the project folder. Example (your path may differ):

```bash
cd "/Users/seongyeupkim/Library/Mobile Documents/com~apple~CloudDocs/Docs/_Research/_Individual research/*2026/*0. Prompt literacy/task-framing-study"
```

Tip: In Finder, you can drag the **`task-framing-study`** folder into the Terminal window after `cd ` to paste the path.

3. Install packages (first time, or after pulling updates):

```bash
npm install
```

4. Start the dev server:

```bash
npm run dev
```

5. Open a browser: **[http://localhost:3000](http://localhost:3000)**  
6. Click **Register**, create a test account, and walk through the study.
7. In Firebase → **Firestore** → **Data** → collection **`users`** → open your user document and confirm fields appear (`condition`, `phase`, etc.).

To stop the server: in Terminal press **Ctrl + C**.

---

## Part D — When something goes wrong

| Problem | What to try |
|--------|-------------|
| Blank page / Firebase error | Check every `NEXT_PUBLIC_...` line in `.env.local` — no missing values. |
| “Missing OPENAI_API_KEY” | `OPENAI_API_KEY=` line is filled and file is saved; restart `npm run dev`. |
| Chat returns error | Check `OPENAI_MODEL` matches a model your key can use; check billing on OpenAI if needed. |
| Permission denied in Firestore | Re-publish **`firestore.rules`** from this repo (Part A4). |
| `npm` not found | Install [Node.js LTS](https://nodejs.org/) and open a new Terminal. |

---

## Part E — Put the site online (later)

Use **Vercel** (or similar):

1. Push your code to GitHub (already set up for this repo).
2. Import the repo in [Vercel](https://vercel.com) → add **the same variables** as in `.env.local` in **Project → Settings → Environment Variables**.
3. Deploy. Participants use the Vercel URL, not `localhost`.

---

If you tell me where you get stuck (e.g. “step B2” or “Firestore rules”), say the step number and any error message, and we can fix that part only.
