"use client";
import { C } from "@/lib/design-tokens";

export function DiagramStructure({ phaseColor, isActive }: { phaseColor: string; isActive: boolean }) {
  const nodes = [
    { x: 60, y: 80, label: "依頼の\n表面", size: 36 },
    { x: 180, y: 40, label: "構造の\n問題", size: 42 },
    { x: 180, y: 120, label: "隠れた\n前提", size: 32 },
    { x: 300, y: 80, label: "本質の\n問い", size: 46 },
  ];
  const edges = [[0,1],[0,2],[1,3],[2,3]];
  return (
    <svg width="100%" viewBox="0 0 360 160" style={{ overflow: "visible" }}>
      {edges.map(([a,b], i) => {
        const na = nodes[a], nb = nodes[b];
        return (
          <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
            stroke={phaseColor} strokeWidth="1.5" strokeOpacity={isActive ? 0.5 : 0}
            strokeDasharray="4 3"
            style={{ transition: `stroke-opacity 0.8s ease ${i*0.15}s` }} />
        );
      })}
      {nodes.map((n, i) => (
        <g key={i} style={{ transition: `opacity 0.6s ease ${i*0.2}s`, opacity: isActive ? 1 : 0 }}>
          <circle cx={n.x} cy={n.y} r={n.size/2} fill={phaseColor} fillOpacity={i===3?0.25:0.1}
            stroke={phaseColor} strokeWidth={i===3?2:1} strokeOpacity={0.8} />
          {n.label.split("\n").map((l, li) => (
            <text key={li} x={n.x} y={n.y + (li - 0.3) * 12} textAnchor="middle"
              fill={C.ink} fontSize="9" fontFamily={C.mono} letterSpacing="0.05em">
              {l}
            </text>
          ))}
        </g>
      ))}
    </svg>
  );
}
