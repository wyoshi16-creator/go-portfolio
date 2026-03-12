"use client";
import { useRef } from "react";
import { C } from "@/lib/design-tokens";
import { useInView } from "@/lib/hooks/use-in-view";

export function ScopeBarChart({ caseId, phaseColor }: { caseId: number; phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const skills = caseId === 1
    ? [
        { label: "構造設計", pct: 35, color: phaseColor },
        { label: "BizDev", pct: 25, color: "#2d6a9f" },
        { label: "PdM", pct: 18, color: "#7a3b9e" },
        { label: "UX設計", pct: 12, color: "#b8740a" },
        { label: "調査", pct: 10, color: "#4a7c59" },
      ]
    : [
        { label: "構造設計", pct: 30, color: phaseColor },
        { label: "BizDev", pct: 28, color: "#2d6a9f" },
        { label: "組織設計", pct: 22, color: "#7a3b9e" },
        { label: "PdM", pct: 12, color: "#b8740a" },
        { label: "調査", pct: 8, color: "#4a7c59" },
      ];
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {skills.map((s, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "monospace" }}>{s.label}</div>
            <div style={{ fontSize: "11px", color: s.color, fontFamily: "monospace" }}>{s.pct}%</div>
          </div>
          <div style={{ height: "6px", background: C.inkFaint, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: s.color, borderRadius: "3px",
              width: inView ? `${s.pct}%` : "0%",
              transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${2.1 + i * 0.12}s`,
            }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: "monospace", marginBottom: "6px" }}>SKILL DISTRIBUTION</div>
        <div style={{ display: "flex", height: "12px", borderRadius: "2px", overflow: "hidden" }}>
          {skills.map((s, i) => (
            <div key={i} style={{
              width: inView ? `${s.pct}%` : "0%", background: s.color, height: "100%",
              transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${2.4 + i * 0.08}s`,
            }} title={`${s.label}: ${s.pct}%`} />
          ))}
        </div>
      </div>
    </div>
  );
}
