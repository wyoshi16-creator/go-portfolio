"use client";
import { C } from "@/lib/design-tokens";

interface Step { text: string; label: string; }

export function DiagramOutcome({ step, phaseColor, isActive }: { step: Step; phaseColor: string; isActive: boolean }) {
  const metrics: { value: string; label: string }[] = [];
  const found = step.text.match(/[\d.]+[倍×%]/g) || [];
  found.slice(0, 3).forEach((m, i) => {
    const labels = ["主要指標", "改善率", "副次効果"];
    metrics.push({ value: m, label: labels[i] || "指標" });
  });
  if (metrics.length === 0) metrics.push({ value: "↑", label: "改善達成" });

  return (
    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          flex: 1, padding: "16px 12px", border: `1px solid ${phaseColor}40`,
          background: `${phaseColor}10`, textAlign: "center",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.7s ease ${i*0.2}s, transform 0.7s ease ${i*0.2}s`,
        }}>
          <div style={{ fontSize: "clamp(22px,3vw,32px)", color: phaseColor, fontFamily: C.mono, fontWeight: "bold", letterSpacing: "-0.02em" }}>
            {m.value}
          </div>
          <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.2em", marginTop: "6px" }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
