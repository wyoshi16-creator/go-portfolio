"use client";
import { useState, useEffect } from "react";
import { C } from "@/lib/design-tokens";

export function GlitchText({ text, isActive, phaseColor }: { text: string; isActive: boolean; phaseColor: string }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [phase, setPhase] = useState<"hidden"|"glitch"|"stable">("hidden");
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@%&";
  const [glitched, setGlitched] = useState<string[]>([]);

  useEffect(() => {
    if (!isActive) { setPhase("hidden"); setGlitched([]); return; }
    setPhase("glitch");
    setGlitched(lines.map(l => l.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")));
    const t1 = setInterval(() => {
      setGlitched(lines.map(l => l.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")));
    }, 60);
    const t2 = setTimeout(() => { clearInterval(t1); setPhase("stable"); }, 700);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [isActive, text]);

  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) || (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : phase === "glitch" ? phaseColor + "aa" : C.ink,
            fontFamily: phase === "glitch" ? C.mono : C.serif,
            lineHeight: 1.9, letterSpacing: phase === "glitch" ? "0.08em" : "0.04em",
            opacity: phase === "hidden" ? 0 : 1,
            transition: phase === "stable" ? `color 0.3s ease ${i * 0.06}s, font-family 0.1s, letter-spacing 0.3s` : "none",
            textShadow: phase === "glitch" ? `0 0 8px ${phaseColor}60, 2px 0 ${phaseColor}40, -2px 0 rgba(255,0,128,0.3)` : "none",
          }}>
            {phase === "glitch" ? (glitched[i] || line) : (line || "\u00A0")}
          </div>
        );
      })}
    </div>
  );
}
