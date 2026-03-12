"use client";
import { C } from "@/lib/design-tokens";

export function DiagramTension({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  return (
    <svg width="100%" viewBox="0 0 320 100" style={{ overflow: "visible" }}>
      <line x1="20" y1="50" x2="300" y2="50" stroke={C.inkFaint} strokeWidth="1" />
      {[60,120,180,240].map((x, i) => (
        <g key={i} style={{ opacity: isActive ? 1 : 0, transition: `opacity 0.5s ease ${i*0.15}s` }}>
          <circle cx={x} cy={50 + (i%2===0 ? -18 : 18)} r="6"
            fill={i===3 ? phaseColor : C.surfaceAlt}
            stroke={i===3 ? phaseColor : C.inkFaint} strokeWidth="1.5" />
          <line x1={x} y1={50 + (i%2===0 ? -12 : 12)} x2={x} y2={50}
            stroke={i===3 ? phaseColor : C.inkFaint} strokeWidth="1" />
        </g>
      ))}
      <text x="20" y="85" fill={C.inkDim} fontSize="10" fontFamily={C.mono} letterSpacing="0.1em" style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.8s ease 0.6s" }}>
        常識
      </text>
      <text x="245" y="85" fill={phaseColor} fontSize="10" fontFamily={C.mono} letterSpacing="0.1em" style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.8s ease 0.8s" }}>
        違和感
      </text>
    </svg>
  );
}
