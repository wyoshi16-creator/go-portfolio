"use client";
import { useRef } from "react";
import { C } from "@/lib/design-tokens";
import { useInView } from "@/lib/hooks/use-in-view";

export function OverviewRadar({ caseId, phaseColor }: { caseId: number; phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const params = caseId === 1
    ? [
        { label: "構造発見", value: 0.95 },
        { label: "BizDev", value: 0.72 },
        { label: "PdM", value: 0.60 },
        { label: "組織設計", value: 0.45 },
        { label: "財務設計", value: 0.55 },
        { label: "UX設計", value: 0.50 },
      ]
    : [
        { label: "構造発見", value: 0.70 },
        { label: "BizDev", value: 0.80 },
        { label: "PdM", value: 0.65 },
        { label: "組織設計", value: 0.60 },
        { label: "財務設計", value: 0.50 },
        { label: "UX設計", value: 0.45 },
      ];
  const n = params.length;
  const cx = 110, cy = 110, r = 80;
  const angles = params.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const pts = (scale: number) => params.map((p, i) => ({
    x: cx + Math.cos(angles[i]) * r * p.value * scale,
    y: cy + Math.sin(angles[i]) * r * p.value * scale,
  }));
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const toPath = (points: { x: number; y: number }[]) => points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {gridLevels.map((lv, gi) => (
          <polygon key={gi} points={angles.map(a => `${(cx + Math.cos(a) * r * lv).toFixed(1)},${(cy + Math.sin(a) * r * lv).toFixed(1)}`).join(" ")}
            fill="none" stroke={C.inkFaint} strokeWidth="0.8" opacity="0.6" />
        ))}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={(cx + Math.cos(a) * r).toFixed(1)} y2={(cy + Math.sin(a) * r).toFixed(1)} stroke={C.inkFaint} strokeWidth="0.8" opacity="0.5" />
        ))}
        <path d={toPath(pts(inView ? 1 : 0))} fill={phaseColor} fillOpacity="0.18" stroke={phaseColor} strokeWidth="1.5"
          style={{ transition: "d 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay: "2.2s" }} />
        {pts(inView ? 1 : 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={phaseColor} opacity={inView ? 0.8 : 0} style={{ transition: `opacity 0.4s ease ${2.4 + i * 0.08}s` }} />
        ))}
        {params.map((param, i) => {
          const lx = cx + Math.cos(angles[i]) * (r + 18);
          const ly = cy + Math.sin(angles[i]) * (r + 18);
          return (
            <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={C.inkMid} fontFamily="'JetBrains Mono','Courier New',monospace">
              {param.label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {params.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: `${p.value * 100}%`, height: "3px", background: phaseColor, opacity: inView ? 0.7 : 0, transition: `opacity 0.4s ease ${2.6 + i * 0.07}s, width 0.8s ease ${2.3 + i * 0.07}s`, borderRadius: "1px" }} />
            <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: "monospace", flexShrink: 0, minWidth: "30px" }}>{Math.round(p.value * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
