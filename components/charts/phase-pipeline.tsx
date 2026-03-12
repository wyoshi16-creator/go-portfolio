"use client";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";

export function PhasePipeline({ activePhase, subPhases = [], vertical = false }: { activePhase: string; subPhases?: string[]; vertical?: boolean }) {
  if (vertical) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative" }}>
        <div style={{ position: "absolute", left: "17px", top: "20px", bottom: "20px", width: "1px", background: C.inkFaint }} />
        {PHASES.map(ph => {
          const isActive = activePhase === ph.id;
          const isSub = subPhases.includes(ph.id);
          return (
            <div key={ph.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", position: "relative" }}>
              <div style={{
                width: isActive ? "34px" : "22px", height: isActive ? "34px" : "22px",
                borderRadius: "50%", flexShrink: 0, zIndex: 2,
                background: isActive ? ph.color : isSub ? `${ph.color}30` : C.surfaceAlt,
                border: `${isActive ? 2 : 1}px solid ${isActive || isSub ? ph.color : C.inkFaint}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isActive ? `0 0 16px ${ph.color}60` : "none",
              }}>
                {isActive && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div style={{ opacity: isActive ? 1 : isSub ? 0.6 : 0.3, transition: "opacity 0.4s" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: isActive ? ph.color : C.ink, fontFamily: C.mono, fontWeight: isActive ? "bold" : "normal" }}>
                  {ph.label.toUpperCase()}
                </div>
                <div style={{ fontSize: "11px", color: C.inkDim, letterSpacing: "0.08em", marginTop: "1px" }}>{ph.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ position: "relative", padding: "8px 0 24px" }}>
      <div style={{ position: "absolute", top: "28px", left: "32px", right: "32px", height: "1px", background: C.inkFaint }} />
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        {PHASES.map(ph => {
          const isActive = activePhase === ph.id;
          const isSub = subPhases.includes(ph.id);
          return (
            <div key={ph.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: isActive ? "44px" : isSub ? "32px" : "22px", height: isActive ? "44px" : isSub ? "32px" : "22px",
                borderRadius: "50%", background: isActive ? ph.color : isSub ? `${ph.color}30` : C.surfaceAlt,
                border: `${isActive ? 2 : 1}px solid ${isActive || isSub ? ph.color : C.inkFaint}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                boxShadow: isActive ? `0 0 20px ${ph.color}50` : "none", position: "relative", zIndex: 2,
              }}>
                {isActive && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", opacity: 0.9 }} />}
                {isSub && !isActive && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: ph.color, opacity: 0.7 }} />}
              </div>
              <div style={{ marginTop: "10px", textAlign: "center", opacity: isActive ? 1 : isSub ? 0.7 : 0.35, transition: "opacity 0.5s" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.25em", fontFamily: C.mono, color: isActive ? ph.color : C.ink, fontWeight: isActive ? "bold" : "normal" }}>
                  {ph.label.toUpperCase()}
                </div>
                <div style={{ fontSize: "11px", color: C.inkDim, letterSpacing: "0.1em", marginTop: "2px" }}>{ph.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
