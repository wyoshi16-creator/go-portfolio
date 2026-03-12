"use client";
import { C } from "@/lib/design-tokens";

export function ArchitectsEye({ text, phaseColor, show }: { text: string; phaseColor: string; show: boolean }) {
  return (
    <div style={{
      opacity: show ? 1 : 0, transition: "opacity 0.8s ease 0.5s",
      padding: "14px 18px", borderLeft: `3px solid ${phaseColor}`,
      background: `${phaseColor}08`, marginTop: "24px",
    }}>
      <div style={{ fontSize: "11px", color: phaseColor, fontFamily: C.mono, letterSpacing: "0.2em", marginBottom: "4px", opacity: 0.8 }}>ARCHITECT&apos;S EYE</div>
      <div style={{ fontSize: "13px", color: C.inkMid, fontFamily: C.serif, fontStyle: "italic", lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}
