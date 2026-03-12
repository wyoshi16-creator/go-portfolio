"use client";
import { useRef } from "react";
import { useInView } from "@/lib/hooks/use-in-view";
import { C } from "@/lib/design-tokens";

export function PlaceholderDiagram({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.1, "0px 0px -60px 0px");
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      marginTop: "20px", marginBottom: "8px", padding: "24px",
      background: "linear-gradient(180deg, #f5f7fa 0%, #eef1f5 100%)", borderRadius: "8px",
      border: "1px solid rgba(0,0,0,0.06)",
    }}>
      <svg width="100%" height="120" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <path d="M40 60 L100 60 L100 30 L160 30" stroke={C.accent} strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
        <path d="M100 60 L100 90 L160 90" stroke={C.inkFaint} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="40" cy="60" r="14" fill={C.accent} fillOpacity="0.2" stroke={C.accent} strokeWidth="2" />
        <circle cx="100" cy="60" r="14" fill={C.accent} fillOpacity="0.15" stroke={C.accent} strokeWidth="1.5" />
        <circle cx="100" cy="30" r="12" fill={C.inkMid} fillOpacity="0.2" stroke={C.inkMid} strokeWidth="1.5" />
        <circle cx="100" cy="90" r="12" fill={C.inkDim} fillOpacity="0.2" stroke={C.inkDim} strokeWidth="1.5" />
        <circle cx="160" cy="30" r="14" fill={C.accent} fillOpacity="0.25" stroke={C.accent} strokeWidth="2" />
        <circle cx="160" cy="90" r="14" fill={C.inkMid} fillOpacity="0.2" stroke={C.inkMid} strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, marginTop: "8px", textAlign: "center" }}>DIAGRAM</div>
    </div>
  );
}
