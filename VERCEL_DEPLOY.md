# Deploy to Vercel

Your app **must** have the **same environment variables on Vercel** as on your Mac (`.env.local` is **not** uploaded to GitHub).

**GitHub repo:** [SeongYeupKim/Task-framing-prompt-literacy](https://github.com/SeongYeupKim/Task-framing-prompt-literacy)  
The Next.js app lives at the **repository root** (where `package.json` is). On Vercel, leave **Root Directory** empty unless you use a monorepo.

---

## Target URL: `https://taskframing.vercel.app`

Vercel gives you **`https://<project-name>.vercel.app`**. The name is set in the **Vercel dashboard**, not in Git.

1. **[vercel.com](https://vercel.com)** → open your project (or import the GitHub repo first).
2. **Settings** → **General** → **Project Name**.
3. Set the name to **`taskframing`** → **Save**.

If that name is already taken on Vercel, try e.g. `taskframing-study` or `task-framing-psu` — your URL will match: `https://<that-name>.vercel.app`.

4. After the first successful deploy, open **`https://taskframing.vercel.app`** (or your chosen name).

5. **Firebase → Authentication → Settings → Authorized domains** → **Add domain** →  
   **`taskframing.vercel.app`** (no `https://`) so **Register / Login** works on production.

---

## 1. Push latest code to GitHub

```bash
cd task-framing-study
git add -A
git status
git commit -m "Your message"
git push origin main
```

---

## 2. Import / connect on Vercel

1. **Add New…** → **Project** → **Import** `Task-framing-prompt-literacy`.
2. **Framework preset:** Next.js (auto).
3. **Root Directory:** leave **empty** (repo root = app).
4. **Deploy** (build may fail until env vars are added — add them and **Redeploy**).

---

## 3. Environment variables (required)

**Settings** → **Environment Variables** — add **every** line from your local `.env.local`:

| Name | Environment |
|------|-------------|
| `OPENAI_API_KEY` | Production (+ Preview if you use preview URLs) |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | |

**Save** → **Deployments** → **⋯** → **Redeploy**.

Missing **`OPENAI_API_KEY`** on Vercel is the #1 reason chat works locally but not online.

---

## 4. Firebase: authorized domain

Add your exact Vercel hostname, e.g. **`taskframing.vercel.app`**, under **Authentication → Settings → Authorized domains**.

---

## 5. Firestore rules

Publish the same rules as local: copy **`firestore.rules`** → Firebase **Firestore → Rules** → **Publish**.

---

## 6. Smoke test

1. Open `https://taskframing.vercel.app` (or your project URL).
2. **Register** → **/study** → send one chat message.
3. Errors: **Deployments** → build / **Runtime Logs** (no API keys in screenshots).

---

## Checklist if something fails

- [ ] Env vars set on Vercel + **Redeploy** after changes.
- [ ] **Project name** = `taskframing` if you want `taskframing.vercel.app`.
- [ ] Firebase **Authorized domains** includes that hostname.
- [ ] **Root directory** = empty (this repo layout).

---

## CLI (optional)

```bash
npm i -g vercel
cd task-framing-study
vercel login
vercel --prod
```

Link the project to the same GitHub repo in the dashboard so pushes auto-deploy.
