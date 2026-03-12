"use client";
import { C } from "@/lib/design-tokens";

export function DiagramQuestion({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  return (
    <div style={{ padding: "14px 18px", border: `1px solid ${C.inkFaint}`, background: C.surfaceAlt,
      opacity: isActive ? 1 : 0, transition: "opacity 0.8s ease 0.3s",
    }}>
      <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>RECEIVED QUESTION</div>
      <div style={{ fontSize: "13px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.8, fontStyle: "italic" }}>
        「依頼の言葉は、問いの表面だ。」
      </div>
      <div style={{ marginTop: "12px", height: "1px", background: `linear-gradient(90deg, ${phaseColor}80, transparent)` }} />
      <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: phaseColor, fontFamily: C.mono, marginTop: "8px" }}>
        → 構造の読解へ
      </div>
    </div>
  );
}
