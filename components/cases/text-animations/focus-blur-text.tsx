"use client";
import { useState, useEffect } from "react";
import { C } from "@/lib/design-tokens";

export function FocusBlurText({ text, isActive, phaseColor }: { text: string; isActive: boolean; phaseColor: string }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!isActive) { setFocused(false); return; }
    const t = setTimeout(() => setFocused(true), 150);
    return () => clearTimeout(t);
  }, [isActive]);
  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) || (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : C.ink,
            fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em",
            filter: focused ? "blur(0px)" : `blur(${6 + i * 1.5}px)`,
            opacity: focused ? 1 : 0.2,
            transition: `filter 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, opacity 0.7s ease ${i * 0.1}s`,
          }}>
            {line || "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}
