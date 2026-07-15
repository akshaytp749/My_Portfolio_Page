import { notify } from "../server/notify.mjs";
import { clientIp, originAllowed } from "../server/http.mjs";

// Client-side "someone did X" pings (resume download, email click). Agent
// questions are notified server-side from api/chat.js, not here.
const MESSAGES = {
  resume_download: "Someone just downloaded your resume.",
  email_click: "Someone just clicked your email link.",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  if (!originAllowed(req)) return res.status(403).json({ error: "forbidden" });

  const { event } = req.body ?? {};
  const message = MESSAGES[event];
  if (!message) return res.status(400).json({ error: "unknown event" });

  const ip = clientIp(req);
  // one alert per event per visitor per 5 min — dashboard has the exact counts
  await notify("Portfolio activity", message, { dedupeKey: `${event}:${ip}`, cooldown: 300 });

  return res.status(204).end();
}
