"use client";
import { useRef } from "react";
import { useInView } from "@/lib/hooks/use-in-view";
import { C } from "@/lib/design-tokens";

export function StepDivider({ index, total, phaseColor }: { index: number; total: number; phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.8);
  return (
    <div ref={ref} style={{ position: "relative", height: "48px", background: "#1e1a16", display: "flex", alignItems: "center", overflow: "hidden", borderTop: `1px solid ${phaseColor}18` }}>
      <div style={{
        position: "absolute", left: 0, top: "50%", height: "1px",
        background: `linear-gradient(90deg, ${phaseColor}80, ${phaseColor}20, transparent)`,
        width: inView ? "100%" : "0%",
        transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
      }} />
      <div style={{
        position: "absolute", left: "clamp(24px,5vw,80px)",
        display: "flex", alignItems: "center", gap: "10px",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
      }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.5em", color: phaseColor, fontFamily: C.mono, opacity: 0.9 }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div style={{ width: "1px", height: "12px", background: `${phaseColor}40` }} />
        <span style={{ fontSize: "10px", letterSpacing: "0.3em", color: `${phaseColor}60`, fontFamily: C.mono }}>
          SCENE CHANGE
        </span>
      </div>
    </div>
  );
}
