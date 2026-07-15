import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

// Aggregate behavioral events → Vercel Analytics dashboard. Never send PII or the
// raw question text here (Vercel truncates properties anyway); source/label only.
export function trackEvent(name, props) {
  try {
    track(name, props);
  } catch {
    // analytics not loaded (local dev) — ignore
  }
}

// High-signal actions → /api/notify → email alert. keepalive so it still fires
// when the click navigates away (resume download / mailto). Fire-and-forget.
export function pingNotify(event) {
  try {
    fetch("/api/notify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

// Records a section_view once, the first time the section scrolls into view.
export function useSectionView(name) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackEvent("section_view", { section: name });
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [name]);
  return ref;
}
