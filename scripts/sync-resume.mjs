// Copies the newest PDF in the repo root to public/Akshay_Thomas_Resume.pdf.
// Step 1 of the resume-refresh playbook in CLAUDE.md — the site copy and
// AGENT_SYSTEM_PROMPT in src/data/resume.js still need a manual/agent sync.
import { copyFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const candidates = readdirSync(root)
  .filter((f) => f.toLowerCase().endsWith(".pdf"))
  .map((f) => ({ f, mtime: statSync(path.join(root, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);

if (candidates.length === 0) {
  console.error("No PDF found in the repo root. Drop the new resume there first.");
  process.exit(1);
}

const src = candidates[0].f;
copyFileSync(path.join(root, src), path.join(root, "public", "Akshay_Thomas_Resume.pdf"));
console.log(`Synced ${src} -> public/Akshay_Thomas_Resume.pdf`);
console.log(
  "If facts changed, update src/data/resume.js AND AGENT_SYSTEM_PROMPT together (CLAUDE.md playbook)."
);
