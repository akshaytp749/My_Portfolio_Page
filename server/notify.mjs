// Shared notifier used by the API routes. Sends a short "someone did X on your
// portfolio" alert. Email via Resend is primary (user's choice); Discord / Slack
// / Telegram work too if their env vars are set instead. All optional — a no-op
// when nothing is configured, and best-effort (never throws into the caller).

const MAX_NOTIFY_PER_DAY = 50;

// Per-key throttle so a single visitor can't flood you (e.g. mashing chips).
// Needs Upstash; without it, no throttle. Returns true if this key is muted.
async function throttled(key, seconds = 300) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !key) return false;
  try {
    const res = await fetch(
      `${url}/set/notify:${encodeURIComponent(key)}/1/nx/ex/${seconds}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { result } = await res.json();
    return result !== "OK"; // key already existed → within cooldown → mute
  } catch {
    return false; // fail open — a Redis hiccup shouldn't drop the alert
  }
}

// Global daily ceiling so that even if per-IP throttling is evaded (spoofed IPs),
// the total blast radius is bounded — you can't get spammed past N/day, and the
// Resend free-tier quota can't be drained. Counts actual send attempts.
async function overDailyCap() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const key = `notify:count:${new Date().toISOString().slice(0, 10)}`;
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, "86400", "NX"],
      ]),
    });
    const [{ result: count }] = await res.json();
    return Number(count) > MAX_NOTIFY_PER_DAY;
  } catch {
    return false;
  }
}

export async function notify(subject, text, { dedupeKey, cooldown } = {}) {
  if (await throttled(dedupeKey, cooldown)) return;
  if (await overDailyCap()) return;

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL_TO;
  const from = process.env.NOTIFY_EMAIL_FROM || "Portfolio <onboarding@resend.dev>";

  try {
    if (resendKey && to) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${resendKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, text }),
      });
      return;
    }
    const discord = process.env.DISCORD_WEBHOOK_URL;
    if (discord) {
      await fetch(discord, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: `**${subject}**\n${text}` }),
      });
      return;
    }
    const slack = process.env.SLACK_WEBHOOK_URL;
    if (slack) {
      await fetch(slack, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: `*${subject}*\n${text}` }),
      });
      return;
    }
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChat = process.env.TELEGRAM_CHAT_ID;
    if (tgToken && tgChat) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: tgChat, text: `${subject}\n${text}` }),
      });
    }
  } catch (err) {
    console.error("notify failed", err);
  }
}
