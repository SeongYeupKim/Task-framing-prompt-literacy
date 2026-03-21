# How to find your Firebase values for `.env.local`

You need the **web app** config (not the Admin SDK JSON). All of these are safe to put in `NEXT_PUBLIC_*` variables — they are **not** secret keys; security comes from **Firestore rules** + **Authentication**.

## Steps

1. Open **[Firebase Console](https://console.firebase.google.com)** and select your project.

2. Click the **gear icon** ⚙️ next to **Project overview** → **Project settings**.

3. Scroll down to **Your apps**.

4. If you don’t have a **Web** app yet:
   - Click **`</>`** (Add app → Web).
   - Register the app (nickname is fine) → **Register app**.

5. Under **SDK setup and configuration**, choose **npm** (or the config object view).

6. You will see something like:

```js
const firebaseConfig = {
  apiKey: "....",
  authDomain: "....",
  projectId: "....",
  storageBucket: "....",
  messagingSenderId: "....",
  appId: "...."
};
```

7. Copy each value into **`.env.local`** like this:

| Firebase field     | Line in `.env.local`                    |
|--------------------|-----------------------------------------|
| `apiKey`           | `NEXT_PUBLIC_FIREBASE_API_KEY=`         |
| `authDomain`       | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=`     |
| `projectId`        | `NEXT_PUBLIC_FIREBASE_PROJECT_ID=`      |
| `storageBucket`    | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=`  |
| `messagingSenderId`| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=` |
| `appId`            | `NEXT_PUBLIC_FIREBASE_APP_ID=`          |

**Rules:** no spaces around `=`, no quotes unless Firebase gave you quotes (usually paste without quotes).

## Also enable (one time)

- **Authentication** → **Sign-in method** → **Email/Password** → Enable.
- **Firestore** → Create database → then **Rules** → paste rules from `firestore.rules` in this project → **Publish**.

## How you know it works

- Run the app → **Register** a test account.
- **Firestore** → **Data** → collection **`users`** → you should see a document after you use `/study`.

---

## OpenAI key (different from Firebase)

- Go to **[OpenAI API keys](https://platform.openai.com/api-keys)**.
- **Create new secret key** → copy once into `OPENAI_API_KEY=` in `.env.local`.
- Set `OPENAI_MODEL=` to a model your account can use (e.g. `gpt-4o-mini`).

Test locally: `npm run check:env` (checks variables and tries one small API call).
