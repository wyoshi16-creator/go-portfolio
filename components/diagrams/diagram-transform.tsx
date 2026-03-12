"use client";
import { C } from "@/lib/design-tokens";

export function DiagramTransform({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  const items = ["旧来の\n枠組み", "→", "再定義", "→", "新しい\n構造"];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 0" }}>
      {items.map((item, i) => {
        const isArrow = item === "→";
        return (
          <div key={i} style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateX(0)" : "translateX(-20px)",
            transition: `opacity 0.6s ease ${i*0.18}s, transform 0.6s ease ${i*0.18}s`,
          }}>
            {isArrow ? (
              <div style={{ fontSize: "18px", color: phaseColor, opacity: 0.7 }}>→</div>
            ) : (
              <div style={{
                padding: "10px 14px", border: `1px solid ${phaseColor}`,
                borderColor: i === 4 ? phaseColor : C.inkFaint,
                background: i === 4 ? `${phaseColor}15` : C.surfaceAlt,
                minWidth: "64px", textAlign: "center",
              }}>
                {item.split("\n").map((l, li) => (
                  <div key={li} style={{ fontSize: "11px", color: i === 4 ? phaseColor : C.inkMid, fontFamily: C.mono, letterSpacing: "0.1em", lineHeight: 1.6 }}>{l}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
