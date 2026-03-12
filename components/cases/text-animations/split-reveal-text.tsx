"use client";
import { C } from "@/lib/design-tokens";

export function SplitRevealText({ text, isActive, phaseColor }: { text: string; isActive: boolean; phaseColor: string }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const mid = Math.ceil(lines.length / 2);
  const top = lines.slice(0, mid);
  const bot = lines.slice(mid);
  return (
    <div style={{ minHeight: `${lines.length * 2.4}em`, position: "relative", overflow: "hidden" }}>
      <div style={{ transform: isActive ? "translateY(0)" : "translateY(-40px)", opacity: isActive ? 1 : 0, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 0.6s ease 0.1s" }}>
        {top.map((line, i) => {
          const isHighlight = /^[0-9×.%→↑↓倍]/.test(line.trim());
          return <div key={i} style={{ fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)", color: isHighlight ? phaseColor : C.ink, fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em" }}>{line}</div>;
        })}
      </div>
      <div style={{ height: "1px", background: `linear-gradient(90deg, ${phaseColor}60, transparent)`, opacity: isActive ? 1 : 0, transition: "opacity 0.5s ease 0.5s", margin: "8px 0" }} />
      <div style={{ transform: isActive ? "translateY(0)" : "translateY(40px)", opacity: isActive ? 1 : 0, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s, opacity 0.6s ease 0.25s" }}>
        {bot.map((line, i) => {
          const isHighlight = line.startsWith("——") || (i === bot.length - 1 && lines.length > 2);
          return <div key={i} style={{ fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)", color: isHighlight ? phaseColor : C.ink, fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em" }}>{line}</div>;
        })}
      </div>
    </div>
  );
}
