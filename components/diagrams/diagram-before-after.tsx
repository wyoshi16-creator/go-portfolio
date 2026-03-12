"use client";
import { C } from "@/lib/design-tokens";

export function DiagramBeforeAfter({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: C.inkFaint }}>
      {[
        { label: "BEFORE", items: ["問いが曖昧", "構造が見えない", "対症療法"], dim: true },
        { label: "AFTER", items: ["本質の問い", "構造の設計", "根本解決"], dim: false },
      ].map((col, ci) => (
        <div key={ci} style={{
          padding: "16px", background: col.dim ? C.surfaceAlt : `${phaseColor}10`,
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateX(0)" : `translateX(${ci===0?"-":"+"}20px)`,
          transition: `opacity 0.7s ease ${ci*0.2}s, transform 0.7s ease ${ci*0.2}s`,
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: col.dim ? C.inkDim : phaseColor, fontFamily: C.mono, marginBottom: "10px" }}>{col.label}</div>
          {col.items.map((item, ii) => (
            <div key={ii} style={{ fontSize: "11px", color: col.dim ? C.inkDim : C.ink, fontFamily: C.serif, lineHeight: 1.8, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: col.dim ? C.inkFaint : phaseColor, fontSize: "11px" }}>{col.dim ? "✕" : "◆"}</span>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
