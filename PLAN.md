# Portfolio Build Plan — Akshay Thomas (AI Engineer)

Goal: a distinctive portfolio whose signature feature is a **live "chat with my resume" agent** in the hero terminal, backed by real production-system storytelling (multi-agent platform, hybrid RAG, MCP servers).

All facts, copy, design tokens, and the agent's system prompt are in `CLAUDE.md`. There is no prototype file — build directly from that spec. `Akshay_Resume_Latest_July.pdf` in the repo root is the source resume (copied to `public/` in Phase 0).

Working style: complete one phase at a time. After each phase, run `npm run dev`, review visually, commit. Do not start a new phase with the previous one half-done.

---

## Phase 0 — Scaffold

- [x] Init Vite + React project; add Tailwind v4 via `@tailwindcss/vite` plugin
      (no tailwind.config.js — tokens are CSS variables in `src/index.css`)
- [x] Deps: `react`, `react-dom`, `lucide-react`. Dev: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`
- [x] `index.html`: fonts (Instrument Serif, Inter, IBM Plex Mono from Google Fonts), title, meta description
- [x] `src/index.css`: Tailwind import + all design tokens from CLAUDE.md as CSS vars + blink/pulse keyframes + prefers-reduced-motion kill-switch
- [x] `src/data/resume.js`: SINGLE SOURCE OF TRUTH — port every content block from CLAUDE.md Appendix A (identity, boot lines, suggestions, systems, projects, skills, AGENT_SYSTEM_PROMPT, fallback answers)
- [x] Components: `Nav`, `Hero` (headline left, Terminal right), `Terminal`, `Systems`, `Projects`, `Stack`, `Footer` — all render from `resume.js`, zero hard-coded copy
- [x] Hero CTAs: quiet mono `Resume ↓` + `Email ↗` links under the intro (recruiter acts from screen one)
- [x] Signals strip: one mono line under the Systems footnote (IIT Madras · Ace ×2 · 4 interns → FT · JEE AIR 186)
- [x] `src/lib/agent.js`: POST `/api/chat` with multi-turn history; on failure fall back to local keyword answers (so plain `npm run dev` always demos, with a visible "demo mode" note)
- [x] `api/chat.js`: Vercel serverless function → OpenAI-compatible LLM provider (Groq free tier by default; OpenRouter/Gemini via `LLM_BASE_URL`/`LLM_MODEL`; key from `LLM_API_KEY` env only); validate/trim incoming messages, cap turns
- [x] Copy `Akshay_Resume_Latest_July.pdf` → `public/Akshay_Thomas_Resume.pdf`; footer links it
      (phone number stays PDF-only — never in page copy or `resume.js`)
- [x] `.env.example` (`LLM_API_KEY=` + provider presets), `.gitignore` (node_modules, dist, .env, .vercel)
- [x] Verify: boot sequence plays, suggestion chips work, fallback answers respond, layout holds on mobile width

## Phase 1 — UI upgrade (the "make it super cool" pass)

Improve the baseline without losing the concept: quiet editorial light page (the human) vs. one dark amber terminal (the machine).

Effect picks are LOCKED in CLAUDE.md (design system) — Particles background, Decrypted
Text headline, Spotlight Card, CountUp, optional Magnet. Don't re-litigate here.

- [x] Install `motion` (framer-motion successor) for scroll-reveal + page-load orchestration
- [x] ReactBits "Particles" in the hero only — sparse, amber #B45309, low opacity.
      The terminal is the hero, not the background.
- [x] ReactBits "Decrypted Text" on the hero headline's italic accent phrase (the ONE text effect)
- [x] Terminal polish: CSS-only CRT scanline overlay, faint amber glow, smoother auto-scroll
- [x] Terminal auto-demo: ~4s after boot, auto-type the first chip question + stream its LOCAL
      fallback answer (never the live API); cancel on any interaction; skip on reduced-motion
- [x] Systems cards: hover lift + ReactBits "Spotlight Card" (amber spotlight)
- [x] Metrics: ReactBits "CountUp" when scrolled into view
- [x] Section headings: staggered reveal via motion variants (NOT a second text effect)
- [ ] Optional: ReactBits "Magnet" on the footer email link only
- [x] Mobile pass: terminal height, nav collapse, type scale
- [x] Accessibility pass: focus states everywhere; terminal transcript is `aria-live="polite"`;
      prefers-reduced-motion disables all of the above

Rule of restraint: max ONE background effect + ONE text effect site-wide.

## Phase 2 — Real streaming chat backend

- [ ] Upgrade `api/chat.js` to stream (`stream: true` on the OpenAI-compatible endpoint → SSE passthrough)
- [ ] Update `src/lib/agent.js` + Terminal to consume the stream (replace simulated token reveal)
- [ ] Rate limiting via Upstash Redis free tier (in-memory does NOT work — Vercel functions
      are stateless across instances/cold starts) + Origin/Referer allowlist check — this
      endpoint spends real API credits
- [ ] Max-turns cap per session (e.g. 10) with a friendly "email Akshay instead" message
- [x] Provider is already env-swappable (Groq/OpenRouter/Gemini free tiers, OpenAI-compatible) — done in Phase 0

## Phase 3 — Interactive architecture diagrams

Replace the mono dataflow strings in Systems cards with real diagrams:

- [ ] Install `@xyflow/react` (React Flow, free); lazy-load it (it's heavy)
- [ ] One diagram per system, data-driven from `resume.js` (nodes + edges arrays)
- [ ] Animated edges (dash flow) showing data direction
- [ ] Hover a node → tooltip with the design decision ("Why Postgres for the registry?")

## Phase 4 — Content, SEO, deploy

- [ ] `scripts/fetch-github.mjs` as a prebuild step: public GitHub API → `src/data/github.json`
      (stars, last-push for the project repos); `Projects.jsx` merges it for freshness badges;
      build must not fail if the API is unreachable (use committed fallback)
- [ ] Meta tags, OpenGraph image (a terminal-screenshot OG card works well)
- [ ] Favicon (amber ▸ on dark square)
- [ ] sitemap.xml + robots.txt
- [ ] Lighthouse: aim 95+ performance and accessibility
- [ ] Prompt test: run the top ~20 recruiter/hiring-manager questions against the live agent
      (incl. "what's his weakness?", salary, injection attempts) and tune AGENT_SYSTEM_PROMPT
- [ ] Vercel Analytics (free) — learn whether visitors actually use the terminal
- [ ] Make the portfolio repo public; set the repo URL in `resume.js` so the footer
      "view source ↗" link renders (verify no key ever entered git history first)
- [ ] Deploy to Vercel; set `LLM_API_KEY` (+ optional `LLM_BASE_URL`/`LLM_MODEL`) env vars; verify `/api/chat` in prod
- [ ] Custom domain (optional)

## Phase 5 — Stretch (pick at most one or two)

- [ ] "The Interval" spectator panel: read-only feed of agent conversations from A2A-MCP-World (static JSON export is fine to start)
- [ ] Embed the LLM Laptop Compatibility Checker live (it's already JS)
- [ ] "How this site works" page with the site's own architecture diagram
- [ ] Command palette (Cmd+K) that routes commands to the agent

---

## Definition of done

1. A stranger can ask the terminal 5 questions and get accurate, grounded answers.
2. Loads fast, works on a phone, passes reduced-motion.
3. Every claim on the page traces back to `src/data/resume.js`.
4. No API key anywhere in client code or git history.
