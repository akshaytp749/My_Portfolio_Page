import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { trackEvent } from "../lib/analytics.js";

// Inline, muted, looping project demo. Plays on hover (pointer devices) or when
// scrolled into view (touch), pauses otherwise. Self-hosted webm/mp4 only — the
// CSP in vercel.json pins media to 'self', so no YouTube/Loom embeds. Under
// prefers-reduced-motion it stays a still poster and never autoplays.
export default function ProjectDemo({ src, poster, title }) {
  const reduce = useReducedMotion();
  const videoRef = useRef(null);
  const playedOnce = useRef(false);

  // real hover pointer (mouse) vs touch — decides hover-play vs in-view-play
  const [hoverCapable, setHoverCapable] = useState(true);
  useEffect(() => {
    setHoverCapable(window.matchMedia("(hover: hover)").matches);
  }, []);

  const play = () => {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.play().catch(() => {}); // autoplay policies can reject; poster stays, no crash
    if (!playedOnce.current) {
      playedOnce.current = true;
      trackEvent("demo_play", { project: title });
    }
  };
  const stop = () => videoRef.current?.pause();

  // touch devices have no hover: play while >60% in view, pause when it leaves
  useEffect(() => {
    if (reduce || hoverCapable) return;
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting && e.intersectionRatio > 0.6 ? play() : stop()),
      { threshold: [0, 0.6] }
    );
    io.observe(v);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, hoverCapable]);

  return (
    <div
      className="-mx-6 -mt-6 mb-4 aspect-[16/10] overflow-hidden rounded-t-2xl border-b border-[var(--line)] bg-[var(--term)]"
      onPointerEnter={hoverCapable ? play : undefined}
      onPointerLeave={hoverCapable ? stop : undefined}
    >
      <video
        ref={videoRef}
        // no src under reduced motion → the poster still is all that loads
        src={reduce ? undefined : src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        // contain, not cover: these are screen recordings whose edges carry
        // content (side panels, tables) — cropping would cut the point. The
        // near-black card bg makes the letterbox bars effectively invisible.
        className="h-full w-full object-contain"
        aria-label={`${title} demo (silent)`}
      />
    </div>
  );
}
