# Design

Graphite & Phosphor (v4): neutral graphite dark with ONE amber-phosphor accent
shared by the page and the terminal — the machine's color is the site's color.
No purple, no gradients, no light theme. Source of truth for tokens:
`src/index.css`; full constitution: CLAUDE.md § Design system.

## Colors

All tokens are CSS custom properties on `:root`.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0B0C0E` | page background (graphite) |
| `--panel` | `rgba(255,255,255,0.03)` | cards, chips |
| `--line` | `rgba(255,255,255,0.08)` | borders, dividers |
| `--text` | `#F2F3F1` | headings, primary text |
| `--text-soft` | `#B3B8B4` | body text |
| `--text-faint` | `#878D89` | captions, meta — floor: ≥4.5:1 on `--bg`, do not darken |
| `--accent` | `#F5A623` | THE accent: phosphor amber (headline phrase, eyebrows, metrics, links, focus) |
| `--accent-dim` | `#9A6A1F` | borders, prompt prefixes, diagram edges |
| `--accent-tint` | `rgba(245,166,35,0.08)` | button fills, card spotlights |
| `--term` | `#12100C` | terminal background |
| `--term-line` | `#2A251C` | terminal inner borders |
| `--term-text` | `#E8E3D8` | terminal user text |
| `--term-dim` | `#7A7263` | terminal boot/status lines |
| `--term-answer` | `#D9CFAE` | terminal agent answers |

Color strategy: restrained — graphite neutrals + one amber accent well under 10%
of surface. Selection is amber on graphite. No other hues anywhere.

## Typography

| Face | Weights | Role |
|---|---|---|
| Space Grotesk | 500, 700 | display — applied globally via `h1,h2,h3` in index.css, tracking-tight |
| Inter | 400, 500 | body |
| JetBrains Mono | 400, 500 | terminal, eyebrows, labels, metrics, chips, buttons |

Hero headline: 36–47px responsive, bold, `leading-[1.12]`; the accent phrase is
solid amber followed by a blinking `▍` block cursor (the terminal leaking into the
page). Eyebrow: mono 12px/500, letter-spacing 0.18em, uppercase, amber. Terminal
body: mono 13px. Small print: mono 10.5px.

## Layout

Max-width 1120px, `px-5` gutters. Hero = headline left / terminal right
(`lg:grid-cols-2`), stacking on mobile. Sections: `py-20` rhythm with a scroll cue
under the hero ("↓ the systems behind the claims"). Systems: 2-col card grid;
Projects: 3-col; Stack: definition-list rows.

## Components

- **Terminal** (`Terminal.jsx`) — the signature element. Chrome bar with dots +
  dynamic `— live`/`— demo` status, CRT scanline overlay (`.crt-overlay`, CSS
  only), amber outer glow, boot sequence (first line typed by ReactBits TextType,
  rest staggered), auto-demo after 4s idle, suggestion chips, streaming answers.
- **SpotlightCard** (ReactBits, vendored) — Systems cards; amber-tint spotlight
  follows cursor, `--panel` bg, `rounded-2xl`, hover lift.
- **CountUp** (ReactBits) — numeric metrics animate on scroll-into-view; amber.
- **SideRays** (ReactBits) — the ONE background: amber rays from top-right (the
  terminal's corner), hero only, bottom-fade into `--bg`.
- **ShinyText** (ReactBits) — hero role line only.
- **SystemDiagram** (React Flow, lazy) — dataflow graphs in Systems `<details>`;
  dark nodes, animated amber-dim edges, `title` tooltips with design decisions.
- **Reveal** (`motion`) — shared scroll-reveal wrapper, 0.55s ease-out, once.
- Buttons/CTAs: mono 12px pills — primary = amber-dim border + accent-tint fill;
  secondary = line border, ghost.

## Motion

Budget: ONE background effect + ONE text effect site-wide; micro-interactions
(spotlight, count-up, hover lifts) don't count. One orchestrated page-load moment:
the terminal boot. Everything honors `prefers-reduced-motion` via both the CSS
kill-switch and JS checks (WebGL skipped, typing instant, counters static).
WebGL pauses when offscreen or tab hidden.

## Banned

Side-stripe borders, gradient text, glassmorphism-as-default, purple/violet
anything, green accents, light theme, second background effect, Ballpit,
LetterGlitch, effect-soup. See CLAUDE.md banned list — it wins on conflict.
