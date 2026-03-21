# Deploy to Vercel (fix “doesn’t work” on live URL)

Your app **must** have the **same environment variables on Vercel** as on your Mac (`.env.local` is **not** uploaded to GitHub).

---

## 1. Push latest code to GitHub

From the `task-framing-study` folder:

```bash
git add -A
git status
git commit -m "Update: setup scripts, docs, env check"
git push origin main
```

If `git push` asks for login, use GitHub Desktop or a [Personal Access Token](https://github.com/settings/tokens).

---

## 2. Import / redeploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** → log in.
2. **Add New…** → **Project** → **Import** your repo:  
   `SeongYeupKim/Task-framing-prompt-literacy`
3. Framework: **Next.js** (auto-detected). Root directory: **`task-framing-study`** if the repo contains that subfolder — see below.

### If your GitHub repo root **is** `task-framing-study` (only app files at top level)

- Root directory: **`.`** (leave default).

### If your GitHub repo has the app **inside** a folder

- In Vercel project **Settings → General → Root Directory** → set to **`task-framing-study`** → Save → **Redeploy**.

---

## 3. Add environment variables (required)

Vercel → your project → **Settings** → **Environment Variables**.

Add **every** variable from your local `.env.local` (same names, same values):

| Name | Notes |
|------|--------|
| `OPENAI_API_KEY` | **Sensitive** — Production (and Preview if you want previews to work) |
| `OPENAI_MODEL` | e.g. `gpt-4o-mini` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | |

- Enable **Production** (and **Preview** / **Development** if you test those).
- **Save** → **Deployments** → open latest deployment → **⋯** → **Redeploy** (so new env vars apply).

**Missing `OPENAI_API_KEY` on Vercel** is the most common reason chat fails on the live site while localhost works.

---

## 4. Firebase: allow your Vercel domain

Otherwise **login / register** fails on `https://….vercel.app`.

1. **[Firebase Console](https://console.firebase.google.com)** → your project.
2. **Authentication** → **Settings** tab → **Authorized domains**.
3. **Add domain** → enter your Vercel host, e.g. `your-project.vercel.app` (no `https://`).
4. Save.

---

## 5. Firestore rules

Same as local: publish rules from `firestore.rules` in this repo (Firestore → **Rules** → Publish).

---

## 6. Quick test after deploy

1. Open `https://YOUR-PROJECT.vercel.app`
2. **Register** a new test account.
3. If errors: Vercel → **Deployments** → click deployment → **Build Logs** / **Runtime Logs** for errors.

---

## Checklist if “it doesn’t work”

- [ ] All env vars added on Vercel (especially `OPENAI_API_KEY`).
- [ ] Redeploy after changing env vars.
- [ ] **Root directory** in Vercel = folder that contains `package.json`.
- [ ] Firebase **Authorized domains** includes `*.vercel.app` or your exact hostname.
- [ ] Firestore rules published.
