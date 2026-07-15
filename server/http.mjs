// Shared request helpers for the API routes.

// Vercel sets x-real-ip to the true immediate client IP. Unlike the leftmost
// token of x-forwarded-for (which a client can prepend), x-real-ip is set by the
// platform, so it's the right key for rate limiting and notification throttling.
export function clientIp(req) {
  const real = req.headers["x-real-ip"];
  if (real) return String(real).trim();
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return "unknown";
}

function requestOrigin(req) {
  if (req.headers.origin) return req.headers.origin;
  try {
    return new URL(req.headers.referer).origin;
  } catch {
    return "";
  }
}

// Exact origin match — no startsWith, so a lookalike host like
// `allowed.example.com.evil.com` can't slip through. Trailing slashes on the
// allowlist entries are tolerated. Empty allowlist = allow all (local dev).
export function originAllowed(req) {
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  if (allowed.length === 0) return true;
  return allowed.includes(requestOrigin(req));
}
