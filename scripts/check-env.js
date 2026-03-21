/**
 * Checks .env.local: required keys filled, optional OpenAI API test (no secrets printed).
 * Usage: node scripts/check-env.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

function parseEnvFile(content) {
  const env = {};
  let raw = content;
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    env[k] = v;
  }
  return env;
}

const required = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

async function testOpenAI(apiKey, model) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: "Say OK in one word." }],
      max_tokens: 5,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("HTTP " + res.status + " — " + text.slice(0, 300));
  }
}

async function main() {
  console.log("=== Environment check (secrets hidden) ===\n");

  if (!fs.existsSync(envPath)) {
    console.log("FAIL: .env.local not found at:\n  " + envPath);
    console.log("\nRun: npm run setup:env");
    process.exit(1);
  }

  const env = parseEnvFile(fs.readFileSync(envPath, "utf8"));
  let allOk = true;

  for (const k of required) {
    const v = env[k];
    if (v === undefined || v === "") {
      console.log("MISSING OR EMPTY: " + k);
      allOk = false;
    } else {
      console.log("OK (has value): " + k);
    }
  }

  if (!allOk) {
    console.log(
      "\nFill missing lines in .env.local, save, then run: npm run check:env"
    );
  }

  // Test OpenAI as soon as key + model exist (don't wait for Firebase).
  if (env.OPENAI_API_KEY && env.OPENAI_MODEL) {
    console.log("\n=== OpenAI API test ===\n");
    try {
      await testOpenAI(env.OPENAI_API_KEY, env.OPENAI_MODEL);
      console.log(
        "SUCCESS: OpenAI key works with model: " + env.OPENAI_MODEL
      );
    } catch (e) {
      console.log("OPENAI TEST FAILED: " + (e.message || String(e)));
      console.log(
        "\nCheck: billing on OpenAI, model name, key not revoked."
      );
      process.exit(2);
    }
  } else {
    console.log("\n(OpenAI test skipped — add OPENAI_API_KEY and OPENAI_MODEL.)");
  }

  const firebaseKeys = required.filter((k) => k.startsWith("NEXT_PUBLIC_FIREBASE"));
  const fbOk = firebaseKeys.every((k) => env[k]);
  console.log("\n=== Firebase ===\n");
  if (fbOk) {
    console.log(
      "All Firebase public config lines are filled. Test in browser: register at http://localhost:3000/register"
    );
    console.log(
      "See FIREBASE_KEYS_GUIDE.md if anything fails."
    );
  } else {
    console.log(
      "Firebase config is still incomplete — see FIREBASE_KEYS_GUIDE.md in this folder."
    );
    console.log(
      "Console: https://console.firebase.google.com → Project settings → Your apps → firebaseConfig object."
    );
  }

  if (!allOk) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
