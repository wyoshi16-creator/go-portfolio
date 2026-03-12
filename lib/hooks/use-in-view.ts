"use client";
import { useState, useEffect, type RefObject } from "react";

export function useInView(
  ref: RefObject<HTMLElement | null>,
  threshold: number = 0.2,
  rootMargin: string = "0px"
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}
