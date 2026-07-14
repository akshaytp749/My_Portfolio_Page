// Prebuild step: refresh src/data/github.json with live repo stats so the
// Projects section shows freshness (stars, last push) as of the last deploy.
// MUST NOT fail the build — on any error the committed fallback stays in place.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "src", "data", "github.json");

const { projects, identity } = await import(
  new URL("../src/data/resume.js", import.meta.url)
);

const owner = identity.github.split("/").pop();

try {
  const fresh = {};
  for (const p of projects) {
    const res = await fetch(`https://api.github.com/repos/${owner}/${p.repo}`, {
      headers: { accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error(`${p.repo}: ${res.status}`);
    const data = await res.json();
    fresh[p.repo] = {
      stars: data.stargazers_count,
      pushedAt: data.pushed_at,
    };
  }
  fresh.fetchedAt = new Date().toISOString();
  writeFileSync(outFile, JSON.stringify(fresh, null, 2) + "\n");
  console.log(`github.json refreshed for ${projects.length} repos`);
} catch (err) {
  const hasFallback = (() => {
    try {
      JSON.parse(readFileSync(outFile, "utf8"));
      return true;
    } catch {
      return false;
    }
  })();
  console.warn(`github fetch failed (${err.message}); using committed fallback`);
  if (!hasFallback) {
    writeFileSync(outFile, "{}\n");
  }
}
