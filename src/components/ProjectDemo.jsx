import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import { trackEvent } from "../lib/analytics.js";

// Inline demo teaser + click-to-enlarge lightbox. The card thumbnail is a muted,
// looping, self-hosted clip (CSP pins media to 'self') that plays on hover
// (pointer) or in-view (touch) — it signals "this is alive". Because a dense
// screen recording is unreadable at card size, clicking opens a large modal
// player. Reduced motion → still poster, no autoplay; the lightbox still works.
export default function ProjectDemo({ src, poster, title, variant = "card" }) {
  const reduce = useReducedMotion();
  const videoRef = useRef(null);
  const playedOnce = useRef(false);
  const [open, setOpen] = useState(false);

  // real hover pointer (mouse) vs touch — decides hover-play vs in-view-play
  const [hoverCapable, setHoverCapable] = useState(true);
  useEffect(() => {
    setHoverCapable(window.matchMedia("(hover: hover)").matches);
  }, []);

  const play = () => {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.play().catch(() => {}); // autoplay policies can reject; poster stays, no crash
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

  // the demo lives inside the card's <a href=repo>; intercept so a click on the
  // demo opens the player instead of navigating to GitHub
  const openLightbox = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    if (!playedOnce.current) {
      playedOnce.current = true;
      trackEvent("demo_play", { project: title });
    }
  };

  // close on Esc; lock body scroll while the modal is up
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        onPointerEnter={hoverCapable ? play : undefined}
        onPointerLeave={hoverCapable ? stop : undefined}
        aria-label={`Play ${title} demo`}
        className={
          variant === "featured"
            ? // fills the hero cell: full height, divider on the right (desktop)
              // or bottom (mobile stack); parent clips the corners
              "group/demo relative block h-full min-h-[240px] w-full cursor-pointer overflow-hidden border-b border-[var(--line)] bg-[var(--term)] md:border-b-0 md:border-r"
            : // default card banner: bleeds to the card edges, fixed 16:10
              "group/demo relative -mx-6 -mt-6 mb-4 block aspect-[16/10] w-[calc(100%+3rem)] cursor-pointer overflow-hidden rounded-t-2xl border-b border-[var(--line)] bg-[var(--term)]"
        }
      >
        <video
          ref={videoRef}
          src={reduce ? undefined : src}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          className="h-full w-full object-contain"
        />
        {/* expand affordance — the small loop alone doesn't read as clickable */}
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-md border border-[var(--line)] bg-black/55 px-2 py-1 font-mono text-[10px] text-[var(--term-text)] backdrop-blur-sm transition-colors group-hover/demo:border-[var(--accent-dim)] group-hover/demo:text-[var(--accent)]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
          watch
        </span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} demo`}
          >
            <div
              className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--term)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--term-line)] px-4 py-2.5">
                <span className="font-mono text-[12px] text-[var(--term-dim)]">{title} — demo</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close demo"
                  className="font-mono text-[16px] leading-none text-[var(--term-dim)] transition-colors hover:text-[var(--accent)]"
                >
                  ✕
                </button>
              </div>
              <video
                src={src}
                poster={poster}
                autoPlay={!reduce}
                controls
                loop
                muted
                playsInline
                className="max-h-[78vh] w-full bg-black object-contain"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
