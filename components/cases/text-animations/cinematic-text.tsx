"use client";
import { useState, useEffect } from "react";
import { C } from "@/lib/design-tokens";

export function CinematicText({ text, isActive, phaseColor }: { text: string; isActive: boolean; phaseColor: string }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) { setVisibleCount(0); return; }
    setVisibleCount(0);
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 320 + 100)
    );
    return () => timers.forEach(clearTimeout);
  }, [isActive, text]);

  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isEmpty = line.trim() === "";
        const isVisible = i < visibleCount;
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) ||
          (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isEmpty ? "0.5em" : isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : C.ink,
            fontFamily: C.serif,
            lineHeight: isEmpty ? 0.8 : 1.9,
            letterSpacing: "0.04em",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-14px)",
            transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
            marginBottom: isEmpty ? "8px" : "0",
            textShadow: isHighlight ? `0 0 16px ${phaseColor}40` : "none",
          }}>
            {line || "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}
