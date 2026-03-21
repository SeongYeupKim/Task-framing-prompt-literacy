/**
 * Creates .env.local from .env.example (if missing), then opens it in your
 * default text editor so you don't have to find the hidden file in Cursor.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");
const envExample = path.join(root, ".env.example");

if (!fs.existsSync(envExample)) {
  console.error("Missing .env.example in project root.");
  process.exit(1);
}

if (!fs.existsSync(envLocal)) {
  fs.copyFileSync(envExample, envLocal);
  console.log("Created .env.local — add your keys and save.\n");
} else {
  console.log("Opening existing .env.local — add or check your keys.\n");
}

const platform = process.platform;
const quoted = JSON.stringify(envLocal);

if (platform === "darwin") {
  // TextEdit (easy for non-programmers)
  execSync(`open -e ${quoted}`, { stdio: "inherit" });
} else if (platform === "win32") {
  execSync(`notepad ${quoted}`, { stdio: "inherit" });
} else {
  console.log(`Edit this file in any text editor:\n  ${envLocal}\n`);
}
