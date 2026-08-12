// Guardrails for a public, unauthenticated LLM endpoint.
//
// THREAT MODEL. This agent has no tools, no secrets and no spend: nothing in the
// prompt is confidential and it cannot act on the world. So the risk is not data
// loss, it is REPUTATION — a visitor screenshotting the agent saying "I have no
// rules", or dumping its own instructions, on a page whose entire pitch is "I
// build production agent systems". Treat that as the thing being defended.
//
// WHY NOT JUST PROMPT IT. The rules already tell the model to refuse both, and
// llama-3.3-70b complies with a basic DAN jailbreak anyway. Prompt-level defense
// depends on the model choosing to obey; on a free-tier model that is a coin
// flip. Everything here is deterministic and holds regardless of which provider
// or model served the request — including the OpenRouter failover.
//
// DEFENSE IN DEPTH — three independent layers, each sufficient alone:
//   1. INPUT   classify the visitor turn before spending a token. Normalizes
//              away the evasions that make naive keyword matching useless
//              (unicode/homoglyphs, zero-width chars, l33t, s p a c i n g).
//   2. PROMPT  see AGENT_SYSTEM_PROMPT — rules last, and written so that a leak
//              is boring rather than embarrassing (defense by exclusion, the
//              same reason the phone number is not in the prompt at all).
//   3. OUTPUT  inspect what the model actually produced before the visitor sees
//              it. This is the layer that does not care how clever the jailbreak
//              was: if the text coming back looks like our own instructions, or
//              like a compliance banner, it never reaches the wire.
//
// Layer 3 is why this is not a blocklist. A novel jailbreak we never imagined
// still has to produce output, and the output is checked against what the model
// was actually given — not against a list of attacks we guessed in advance.

// ── normalization ───────────────────────────────────────────────────────────
// Attackers pad, homoglyph and interleave to slip past literal matching. We
// match against two derived forms so those tricks collapse before comparison.
const INVISIBLE = /[­​-‏‪-‮⁠-⁤﻿]/g;
const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s", "!": "i" };

export function normalize(input) {
  const base = String(input ?? "")
    .normalize("NFKC") // fullwidth/styled unicode → plain ascii equivalents
    .replace(INVISIBLE, "")
    .toLowerCase()
    .replace(/[013457@$!]/g, (c) => LEET[c] ?? c);
  return {
    // readable form: word-boundary patterns run here
    spaced: base.replace(/\s+/g, " ").trim(),
    // letters+digits only: defeats "i g n o r e" and "i-g-n-o-r-e"
    squished: base.replace(/[^a-z0-9]/g, ""),
  };
}

// ── layer 1: input classification ───────────────────────────────────────────
// Patterns describe COMMANDS AIMED AT THE ASSISTANT, not topics. That matters:
// this site legitimately discusses prompt injection (The Interval ships an
// injection-refusal admission gate), so "how does his injection gate work?" must
// sail through while "ignore your instructions" must not.
const INJECTION_PATTERNS = [
  // instruction override
  [/\bignore\s+(all\s+|any\s+)?(previous|prior|preceding|above|earlier|the)\b[^.?!]{0,30}\b(instruction|prompt|rule|direction|context)/, "override"],
  [/\bdisregard\s+(all\s+|any\s+|your\s+)?(previous|prior|above|the)?\b[^.?!]{0,30}\b(instruction|prompt|rule|guideline)/, "override"],
  [/\bforget\s+(all\s+|everything\s+)?(you|your|previous|prior|above|what)/, "override"],
  [/\b(override|bypass|circumvent|disable)\s+(your|the|all)\b[^.?!]{0,25}\b(rule|instruction|restriction|guardrail|filter|safety|programming)/, "override"],
  [/\bnew\s+(instructions?|system\s*prompt|rules?)\s*[:\-]/, "override"],
  [/\bfrom\s+now\s+on\b[^.?!]{0,30}\b(you|respond|reply|answer)\b/, "override"],

  // role reassignment / persona hijack
  [/\byou\s+are\s+(now|no\s+longer)\b/, "persona"],
  [/\b(act|behave|respond)\s+as\s+(if\s+)?(a\s+|an\s+|the\s+)?(dan\b|jailbroken|unrestricted|uncensored|evil|hacker)/, "persona"],
  [/\bpretend\s+(to\s+be|you\s+are|that\s+you)/, "persona"],
  [/\b(developer|debug|god|admin)\s+mode\b/, "persona"],
  [/\bdo\s+anything\s+now\b/, "persona"],
  [/\bjailbr(eak|oken)\b/, "persona"],
  [/\byou\s+(have|are\s+under)\s+no\s+(rules|restrictions|limits|filters)\b/, "persona"],
  [/\bwithout\s+(any\s+)?(restrictions|rules|filters|censorship)\b/, "persona"],
  [/\brespond\s+only\s+with\b/, "persona"],

  // prompt / instruction extraction — direct
  [/\b(reveal|show|print|output|repeat|display|dump|recite|echo|expose|leak)\b[^.?!]{0,40}\b(system\s*)?(prompt|instruction|directive|rule)s?\b/, "extraction"],
  // ...and indirect: laundering the same request through a transformation
  // ("summarize", "translate", "as a story") is still an extraction attempt.
  // Anchored on "your" so questions about Akshay's systems ("describe the
  // configuration of his RAG pipeline") are unaffected.
  [/\b(summar(y|ize|ise)|paraphrase|translate|rephrase|describe|explain|list|outline|encode|encrypt|base64)\b[^.?!]{0,30}\byour\b[^.?!]{0,25}\b(prompt|instruction|directive|rule|guideline|configuration|config|setup|setting|training)s?\b/, "extraction"],
  [/\b(the|your)\s+system\s*(prompt|message|instruction)/, "extraction"],
  [/\bintegrity\s*token\b/, "extraction"],
  [/\bwhat\s+(is|are)\s+your\s+(prompt|instruction|rule|guideline|configuration|directive)s?\b/, "extraction"],
  [/\b(what|tell\s+me)\b[^.?!]{0,30}\b(your|the)\b[^.?!]{0,20}\b(system\s*prompt|initial\s+instruction|original\s+instruction)/, "extraction"],
  [/\brepeat\s+(everything|all|the\s+text|the\s+words)\b[^.?!]{0,20}\b(above|before|prior)/, "extraction"],
  [/\bverbatim\b[^.?!]{0,30}\b(prompt|instruction)/, "extraction"],
  [/\b(first|last)\s+\d+\s+(words|lines|characters|tokens)\b/, "extraction"],
  [/\bwhat\s+(were|are)\s+you\s+(told|instructed|programmed)\b/, "extraction"],
];

// Same intent with every separator stripped — catches padded/hyphenated evasion
// that the spaced patterns above would miss.
const INJECTION_NEEDLES = [
  "ignoreallprevious",
  "ignorepreviousinstruction",
  "ignoreaboveinstruction",
  "disregardprevious",
  "disregardallprevious",
  "systemprompt",
  "initialinstructions",
  "originalinstructions",
  "revealyourprompt",
  "printyourprompt",
  "showyourprompt",
  "repeateverythingabove",
  "developermode",
  "doanythingnow",
  "jailbreak",
  "youarenow",
  "overrideyourinstructions",
  "bypassyourrules",
  "actasdan",
  "norestrictions",
  "yourinstructions",
  "yourconfiguration",
  "integritytoken",
  "yoursystemprompt",
];

// Long opaque blobs are almost always encoded payloads, never real questions.
const ENCODED_BLOB = /[A-Za-z0-9+/]{60,}={0,2}/;

/**
 * Classify a visitor turn. Returns { blocked, reason } — `reason` is for logs
 * only and is never shown to the visitor (telling an attacker which rule fired
 * is free tuning feedback for them).
 */
export function detectInjection(text) {
  const { spaced, squished } = normalize(text);
  for (const [re, reason] of INJECTION_PATTERNS) {
    if (re.test(spaced)) return { blocked: true, reason };
  }
  for (const needle of INJECTION_NEEDLES) {
    if (squished.includes(needle)) return { blocked: true, reason: "obfuscated" };
  }
  if (ENCODED_BLOB.test(String(text ?? ""))) return { blocked: true, reason: "encoded" };
  return { blocked: false, reason: null };
}

// ── layer 3: output inspection ──────────────────────────────────────────────
// Model-agnostic and attack-agnostic: we compare what came back against what we
// sent in. Novel jailbreaks still have to emit text, and the text is the thing
// being judged.

const N = 8; // 8-word verbatim run — long enough that paraphrase never trips it

function wordsOf(text) {
  return normalize(text)
    .spaced.replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngramsOf(text, n = N) {
  const w = wordsOf(text);
  const out = new Set();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(" "));
  return out;
}

// Banners a model emits when it has accepted a jailbreak. Deliberately narrow:
// these are phrases a legitimate answer about Akshay would never contain.
const COMPLIANCE_MARKERS = [
  /\bi\s+(have|am\s+under|follow)\s+no\s+(rules|restrictions|limits|guidelines)\b/,
  /\b(dan|developer|god)\s+mode\s+(enabled|activated|on)\b/,
  /\bas\s+(dan|a\s+jailbroken)\b/,
  /\bi\s+am\s+(now\s+)?jailbroken\b/,
  /\bignoring\s+(my|all)\s+(previous\s+)?(instructions|rules)\b/,
  /\bi\s+can\s+do\s+anything\s+now\b/,
];

/**
 * Build an inspector bound to the exact system prompt this request sent.
 *
 * Fingerprint scope is deliberate. We fingerprint the IDENTITY LINE and the
 * RULES block — text the agent has no legitimate reason to ever speak — and NOT
 * the facts, because the facts are public and the agent is supposed to recite
 * them. Fingerprinting facts would block correct answers; this way a verbatim
 * dump is caught while "he ran 100k+ enterprise vectors" streams normally.
 */
export function createOutputGuard(systemPrompt, canary, { speakable = [] } = {}) {
  const prompt = String(systemPrompt ?? "");
  const identity = prompt.split("\n", 1)[0] ?? "";
  const rulesIdx = prompt.search(/^RULES:/m);

  // The rules block ends where runtime-injected CONTENT begins. Everything
  // appended per request — owner facts, the CURRENT CONTEXT tenure line, the
  // integrity token — is material the agent is SUPPOSED to recite, so it must
  // never enter the fingerprint. Getting this wrong silently blocks correct
  // answers: fingerprinting the tenure line made "how many years of experience
  // does he have?" look like a prompt leak, because the honest answer quotes it.
  const RUNTIME_APPEND = /\n\n(ADDITIONAL OWNER-PROVIDED FACTS:|CURRENT CONTEXT|INTEGRITY TOKEN:)/;
  let rules = rulesIdx === -1 ? "" : prompt.slice(rulesIdx);
  const appendIdx = rules.search(RUNTIME_APPEND);
  if (appendIdx !== -1) rules = rules.slice(0, appendIdx);

  const fingerprint = new Set([...ngramsOf(identity), ...ngramsOf(rules)]);

  // Subtract anything the agent is MEANT to say out loud. The rules quote an
  // example refusal to steer the model toward a good one — without this, the
  // model obeying that instruction would look identical to a prompt leak and we
  // would block our own correct answer. Rule of thumb: text that is speakable by
  // design can never be evidence of a leak.
  for (const allowed of speakable) {
    for (const gram of ngramsOf(allowed)) fingerprint.delete(gram);
  }

  return {
    /** Judge the answer so far. Cheap enough to call on every chunk. */
    inspect(textSoFar) {
      const text = String(textSoFar ?? "");
      if (canary && text.includes(canary)) return { blocked: true, reason: "canary" };
      const { spaced } = normalize(text);
      for (const re of COMPLIANCE_MARKERS) {
        if (re.test(spaced)) return { blocked: true, reason: "compliance-banner" };
      }
      if (fingerprint.size) {
        for (const gram of ngramsOf(text)) {
          if (fingerprint.has(gram)) return { blocked: true, reason: "prompt-leak" };
        }
      }
      return { blocked: false, reason: null };
    },
    fingerprintSize: fingerprint.size,
  };
}

// ── release policy ──────────────────────────────────────────────────────────
// Streaming is the conflict: bytes on the wire cannot be recalled, so we cannot
// judge only at the end. We hold the opening GATE_CHARS back until it can be
// inspected as a whole — a prompt dump reveals itself well inside that window
// (the identity line is ~72 chars) — then stream continuously behind a short
// TRAIL so a signature straddling two chunks is still caught before release.
export const GATE_CHARS = 160;
export const TRAIL_CHARS = 48;

/** How much of `text` is safe to flush, given whether the stream has ended. */
export function releasableLength(text, ended) {
  const len = String(text ?? "").length;
  if (ended) return len;
  if (len < GATE_CHARS) return 0;
  return Math.max(0, len - TRAIL_CHARS);
}
