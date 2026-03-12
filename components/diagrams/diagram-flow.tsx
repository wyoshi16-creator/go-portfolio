"use client";
import React from "react";
import { C } from "@/lib/design-tokens";

export function DiagramFlow({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  const steps = ["設計", "検証", "調整", "実装"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{
            flex: 1, padding: "10px 6px", textAlign: "center",
            background: i === steps.length-1 ? `${phaseColor}20` : C.surfaceAlt,
            border: `1px solid ${i === steps.length-1 ? phaseColor : C.inkFaint}`,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateY(0)" : "translateY(12px)",
            transition: `opacity 0.5s ease ${i*0.15}s, transform 0.5s ease ${i*0.15}s`,
          }}>
            <div style={{ fontSize: "11px", color: i === steps.length-1 ? phaseColor : C.inkMid, fontFamily: C.mono, letterSpacing: "0.15em" }}>{s}</div>
          </div>
          {i < steps.length-1 && (
            <div style={{ color: phaseColor, fontSize: "11px", opacity: isActive ? 0.5 : 0, transition: `opacity 0.5s ease ${i*0.15+0.3}s` }}>›</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
