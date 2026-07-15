# Product

## Register

brand

## Platform

web

## Users

Primary: recruiters and hiring managers screening AI-engineer candidates — 45 seconds
of attention, skimming for credibility signals, deciding whether to reach out.
Secondary: senior engineers and hiring-panel members who arrive from the recruiter's
shortlist and probe deeper — they read architecture details, open the dataflow
diagrams, try to break the terminal agent.

## Product Purpose

Akshay Thomas's personal portfolio. It exists to convert attention into interviews
by demonstrating — not claiming — that he builds production AI systems. The
signature feature is a live terminal agent grounded in his resume: the site's core
claim ("agents do real work") is proven by the page itself. Success = a visitor
emails him.

## Positioning

The portfolio that is itself the proof: a live agent answering for a candidate who
ships agent infrastructure to production.

## Conversion & proof

- Primary CTA: email (akshaythomas.p@gmail.com). Secondary: resume PDF download.
- The line a visitor remembers after 10 seconds: "I build systems where agents do
  real work — and the terminal on his site was one of them."
- Belief ladder: (1) this person ships production AI systems, not demos → (2) the
  proof is verifiable — live agent, concrete metrics (90% faster onboarding, 100k+
  vectors, 100% calculation accuracy), public code → (3) he is reachable and
  responsive.
- Proof on hand: production metrics in Systems cards; awards strip (IIT Madras CS
  '22, Ace of the Quarter ×2 2024, 4 interns mentored to full-time, JEE Advanced
  AIR 186); public GitHub repos with live freshness data; the working agent itself.

## Brand Personality

Precise, warm, quietly confident. The voice of an engineer who lets systems speak:
first person on the page, third person from the agent. Lightly witty in the
terminal, never jokey. Three words: engineered, honest, understated.

## Anti-references

- The 2026 default AI-engineer portfolio: dark page + purple/violet gradient blob +
  gradient text. Explicitly rejected twice during design iteration.
- Green accents (rejected), light themes (rejected), glassmorphism-as-default,
  effect-soup template portfolios, "AI slop" aesthetics.
- Anything that would make an engineer say "template" — decorative WebGL that
  competes with the terminal, badge walls, skill-percentage bars.

## Design Principles

1. Practice what you preach — the site must itself be evidence of the claimed craft
   (live agent, streaming, real data, public source).
2. The machine is the light — one amber-phosphor accent shared by page and terminal;
   the terminal is the only loud element.
3. Show metrics, not adjectives — every claim traces to a number, a system, or a repo.
4. Restraint is the differentiator — max one background effect, one text effect;
   ReactBits components appear subtly, never as decoration that announces itself.
5. Honest by construction — no fake numbers, demo mode labels itself, copy never
   overclaims what the code does.

## Accessibility & Inclusion

WCAG 2.1 AA contrast (≥4.5:1 body text — tokens are annotated with this floor).
`prefers-reduced-motion` disables every effect (WebGL, typing, counters, reveals)
with instant/static equivalents. The terminal transcript is an `aria-live="polite"`
region so the signature feature works for screen-reader users. Diagrams keep a
text flow-string fallback for screen readers.
