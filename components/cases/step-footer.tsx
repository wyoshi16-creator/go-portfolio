"use client";
import { C } from "@/lib/design-tokens";

export function StepFooter({ index, total, label, phaseColor, isActive }: { index: number; total: number; label: string; phaseColor: string; isActive: boolean }) {
  return (
    <div style={{ padding: "0 clamp(24px,5vw,80px) 32px", display: "flex", alignItems: "center", gap: "12px", opacity: isActive ? 0.65 : 0.25, transition: "opacity 0.6s ease" }}>
      <div style={{ fontSize: "11px", letterSpacing: "0.45em", color: phaseColor, fontFamily: C.mono, flexShrink: 0 }}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${phaseColor}50, transparent)` }} />
      <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, flexShrink: 0 }}>{label}</div>
    </div>
  );
}
