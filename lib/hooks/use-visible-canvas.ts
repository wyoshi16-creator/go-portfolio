"use client";
import { useEffect, type RefObject } from "react";

type DrawFn = (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => void;

export function useVisibleCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, drawFn: DrawFn) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number | null = null;
    let t = 0;
    let visible = false;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      if (!visible) { animId = null; return; }
      drawFn(ctx, canvas.width, canvas.height, t);
      t += 0.02;
      animId = requestAnimationFrame(loop);
    };
    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !animId) animId = requestAnimationFrame(loop);
    }, { threshold: 0.01 });
    obs.observe(canvas);
    return () => {
      if (animId) cancelAnimationFrame(animId);
      obs.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef, drawFn]);
}
