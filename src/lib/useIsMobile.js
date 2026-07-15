import { useEffect, useState } from "react";

// True below the given max-width. SPA (no SSR), so window is always available.
// Used to give phones lighter behavior (no WebGL rays, text flow instead of the
// heavy React Flow diagram) without changing desktop at all.
export function useIsMobile(query = "(max-width: 767px)") {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}
