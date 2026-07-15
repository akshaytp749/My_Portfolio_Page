// Read logged agent conversations from Upstash.
//   npm run logs              -> today
//   npm run logs 2026-07-14   -> a specific day
//   npm run logs yesterday    -> yesterday
// Requires UPSTASH_REDIS_REST_URL/TOKEN in .env (or the environment).
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error("UPSTASH_REDIS_REST_URL / _TOKEN not set (.env or environment).");
  process.exit(1);
}

let day = process.argv[2] || new Date().toISOString().slice(0, 10);
if (day === "yesterday") {
  day = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
}

const res = await fetch(`${url}/lrange/log:${day}/0/-1`, {
  headers: { Authorization: `Bearer ${token}` },
});
const { result } = await res.json();

if (!result || result.length === 0) {
  console.log(`No conversations logged for ${day}.`);
  process.exit(0);
}

console.log(`${result.length} exchange(s) on ${day}\n${"─".repeat(60)}`);
for (const raw of result) {
  try {
    const { t, q, a } = JSON.parse(raw);
    console.log(`\n[${t.slice(11, 19)}] Q: ${q}\n           A: ${a}`);
  } catch {
    console.log(`\n(unparseable entry) ${raw}`);
  }
}
