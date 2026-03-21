# Fix: “Firebase API key doesn’t match this project” (`auth/invalid-api-key`)

That error means the **`apiKey` in your env vars does not belong to the Firebase project** you think you’re using, or it was copied wrong.

---

## 1. Copy fresh values from the correct project

1. Open **[Firebase Console](https://console.firebase.google.com)**.
2. Select **the same project** you use for this study (check the name in the top bar).
3. Click **⚙️ Project settings** (gear next to “Project overview”).
4. Under **Your apps**, click your **Web** app (`</>`).  
   - If there is no web app, add one: **`</>`** → register → you’ll get `firebaseConfig`.
5. In **SDK setup and configuration**, use the **Config** object (not the private key / service account).

Copy **each** value into your env (same spelling as below):

| Firebase field | Environment variable |
|----------------|----------------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

**Rules:** paste **without** extra quotes. No space before/after `=`. One line per variable.

---

## 2. Local (`.env.local`)

Edit **`task-framing-study/.env.local`**, save, restart:

```bash
npm run dev
```

---

## 3. Vercel (production)

1. **[vercel.com](https://vercel.com)** → your project → **Settings** → **Environment Variables**.
2. **Edit** each `NEXT_PUBLIC_FIREBASE_*` value — paste again from Firebase (step 1).
3. **Save** → **Deployments** → **⋯** → **Redeploy** (env changes only apply after redeploy).

**Important:** Vercel must use the **same** six values as the Firebase project where **Authentication** and **Firestore** are enabled.

---

## 4. Common mistakes

- **Wrong project** — keys from project A, console open on project B.
- **Old / rotated key** — always copy again from **Project settings → Your apps**.
- **Extra quotes** in Vercel: value should be `AIza...` not `"AIza..."`.
- **Typo** in variable **name** (must match exactly, e.g. `NEXT_PUBLIC_FIREBASE_API_KEY`).
- **Not redeployed** on Vercel after changing env.

---

## 5. Quick check

After updating, register again. If it still fails, run locally:

```bash
cd task-framing-study
npm run check:env
```

All Firebase lines should show “OK (has value)”. Then compare **Project ID** in Firebase settings with `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `.env.local` — they must match exactly.
