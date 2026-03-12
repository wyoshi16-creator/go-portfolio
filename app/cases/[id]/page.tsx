"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CASES } from "@/lib/cases-data";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";
import { useInView } from "@/lib/hooks/use-in-view";

// ── Constants ──
const NAV_H = 52;
const THUMB_H = 88;

// ── Label → English mapping ──
const LABEL_EN: Record<string, string> = {
  "依頼の表面": "THE SURFACE REQUEST",
  "最初の違和感": "FIRST FRICTION",
  "構造の発見": "STRUCTURAL DISCOVERY",
  "設計の転換": "DESIGN PIVOT",
  "実装の形": "IMPLEMENTATION FORM",
  "アウトカム": "OUTCOME",
  "常識の提示": "COMMON SENSE",
  "常識の破壊": "PARADIGM SHIFT",
  "構造の解剖": "STRUCTURAL ANATOMY",
  "再設計の核心": "CORE REDESIGN",
  "実装": "IMPLEMENTATION",
  "失敗の予感": "SIGNS OF FAILURE",
  "転換点": "TURNING POINT",
  "解体": "DECONSTRUCTION",
  "再構築": "RECONSTRUCTION",
  "突破": "BREAKTHROUGH",
  "依頼された世界": "THE REQUESTED WORLD",
  "設計し直した世界": "THE REDESIGNED WORLD",
  "なぜ違うのか": "WHY IT DIFFERS",
  "違和感": "FRICTION",
  "構造の再設計": "STRUCTURAL REDESIGN",
  "転換": "PIVOT",
};

const DIAGRAM_CYCLE = ["question", "tension", "structure", "transform", "flow", "outcome"];

// Architect's Eye texts for case 1
const CASE1_EYE: Record<string, string> = {
  "依頼の表面": "依頼を額面通りに受け取ることは、依頼者の本当の問いを殺すことと同じだ。",
  "最初の違和感": "問いを疑うことが、設計の始まりだ。表層の問題を解いても、構造は変わらない。",
  "構造の発見": "組織の「見えない壁」は、予算の分断として現れる。構造を見る目が、解を生む。",
  "設計の転換": "アブダクション推論。「こうすれば説明できる」という仮説が、新しい問いの形を作る。",
  "実装の形": "制約は敵ではない。制約の中に、三者が動ける唯一の形が隠れていた。",
  "アウトカム": "問いを設計し直すことで、解のスケールが変わった。これが「号」の仕事の核心だ。",
};

// ── Text parsing ──
type Line = { text: string; size: string; style?: string; mono?: boolean };

function parseStepText(text: string): Line[] {
  const lines: Line[] = [];
  const paragraphs = text.split("\n\n");
  paragraphs.forEach((para, pi) => {
    if (pi > 0) lines.push({ text: "", size: "gap" });
    const paraLines = para.split("\n");
    paraLines.forEach((line, li) => {
      const isFirstLine = pi === 0 && li === 0;
      const isQuote = line.startsWith("「");
      lines.push({
        text: line,
        size: isFirstLine ? "xl" : "md",
        style: isFirstLine && isQuote ? "italic" : undefined,
      });
    });
  });
  return lines;
}

// ── Step data type ──
interface DisplayStep {
  index: number;
  label: string;
  en: string;
  lines: Line[];
  eye: string | null;
  diagramType: string;
}

function buildDisplaySteps(caseData: typeof CASES[0]): DisplayStep[] {
  return caseData.steps.map((step, i) => ({
    index: i + 1,
    label: step.label,
    en: LABEL_EN[step.label] ?? `STEP ${String(i + 1).padStart(2, "0")}`,
    lines: parseStepText(step.text),
    eye: caseData.id === 1 ? (CASE1_EYE[step.label] ?? null) : null,
    diagramType: DIAGRAM_CYCLE[i % DIAGRAM_CYCLE.length],
  }));
}

// ── FadeIn ──
function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── SVG Diagrams ──
function Diagram({ type, visible, phaseColor }: { type: string; visible: boolean; phaseColor: string }) {
  const PC = phaseColor;
  const base: React.CSSProperties = {
    width: "100%", height: "100%",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : "scale(0.92)",
    transition: "opacity 0.6s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)",
  };
  if (type === "question") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="100" cy="100" r="60" fill="none" stroke={PC} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
      <circle cx="100" cy="100" r="40" fill="none" stroke={PC} strokeWidth="1" opacity="0.5" />
      <text x="100" y="108" textAnchor="middle" fontSize="32" fill={PC} fontFamily="Georgia,serif" opacity="0.9">?</text>
    </svg>
  );
  if (type === "tension") return (
    <svg viewBox="0 0 200 200" style={base}>
      <line x1="40" y1="100" x2="160" y2="100" stroke={PC} strokeWidth="1" opacity="0.3" />
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle cx={60 + i * 40} cy="100" r="16" fill="none" stroke={PC} strokeWidth="1" opacity={0.3 + i * 0.25} />
          <circle cx={60 + i * 40} cy="100" r="4" fill={PC} opacity={0.3 + i * 0.25} />
        </g>
      ))}
    </svg>
  );
  if (type === "structure") return (
    <svg viewBox="0 0 200 200" style={base}>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="30" y={50 + i * 44} width="140" height="28" rx="2" fill="none" stroke={PC} strokeWidth="1" opacity={0.25 + i * 0.15} />
          <rect x="30" y={50 + i * 44} width={40 + i * 15} height="28" rx="2" fill={PC} opacity={0.08 + i * 0.06} />
        </g>
      ))}
      <line x1="170" y1="64" x2="170" y2="162" stroke={PC} strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  );
  if (type === "transform") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="70" cy="80" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4" />
      <circle cx="130" cy="80" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4" />
      <circle cx="100" cy="130" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4" />
      <path d="M82 92 L118 92 L100 120 Z" fill={PC} opacity="0.15" />
      <circle cx="100" cy="100" r="6" fill={PC} opacity="0.6" />
    </svg>
  );
  if (type === "flow") return (
    <svg viewBox="0 0 200 200" style={base}>
      {["A", "B", "C"].map((label, i) => (
        <g key={i}>
          <rect x="65" y={30 + i * 52} width="70" height="32" rx="2" fill="none" stroke={PC} strokeWidth="1" opacity={0.35 + i * 0.15} />
          <text x="100" y={51 + i * 52} textAnchor="middle" fontSize="10" fill={PC} fontFamily={C.mono} opacity="0.7">{label}</text>
          {i < 2 && <path d={`M100 ${62 + i * 52} L100 ${72 + i * 52} M96 ${68 + i * 52} L100 ${73 + i * 52} L104 ${68 + i * 52}`} fill="none" stroke={PC} strokeWidth="1" opacity="0.3" />}
        </g>
      ))}
    </svg>
  );
  if (type === "outcome") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="100" cy="100" r="50" fill="none" stroke={PC} strokeWidth="1" opacity="0.2" />
      <circle cx="100" cy="100" r="35" fill="none" stroke={PC} strokeWidth="1" opacity="0.35" />
      <circle cx="100" cy="100" r="20" fill={PC} opacity="0.12" />
      <circle cx="100" cy="100" r="6" fill={PC} opacity="0.7" />
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        return <circle key={i} cx={100 + 50 * Math.cos(rad)} cy={100 + 50 * Math.sin(rad)} r="3" fill={PC} opacity="0.5" />;
      })}
    </svg>
  );
  return null;
}

// ── DotNav ──
function DotNav({ labels, active, onDotClick, phaseColor }: { labels: string[]; active: number; onDotClick: (i: number) => void; phaseColor: string }) {
  const PC = phaseColor;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {labels.map((label, i) => {
        const isActive = i === active;
        const isPast = i < active;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && (
              <div style={{
                width: "clamp(10px,1.8vw,24px)", height: "1px",
                background: isPast || isActive ? PC : C.inkFaint,
                transition: "background 0.35s ease",
              }} />
            )}
            <div onClick={() => onDotClick(i)} title={label} style={{
              cursor: "pointer", flexShrink: 0,
              width: isActive ? "10px" : "6px",
              height: isActive ? "10px" : "6px",
              borderRadius: "50%",
              background: isActive ? PC : isPast ? `${PC}80` : C.inkFaint,
              border: isActive ? `2px solid ${PC}` : "none",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ── TextLines ──
function TextLines({ lines, visible }: { lines: Line[]; visible: boolean }) {
  return (
    <div>
      {lines.map((line, i) => {
        if (line.size === "gap") return <div key={i} style={{ height: "clamp(10px,1.8vh,20px)" }} />;
        const delay = i * 0.06;
        return (
          <div key={i} style={{ overflow: "hidden", marginBottom: "2px" }}>
            <div style={{
              fontSize: line.size === "xl" ? "clamp(20px,2.6vw,32px)" : "clamp(14px,1.6vw,18px)",
              color: line.size === "xl" ? C.ink : C.inkMid,
              fontFamily: line.mono ? C.mono : C.serif,
              lineHeight: line.size === "xl" ? 1.35 : 1.85,
              letterSpacing: line.style === "italic" ? "0.02em" : line.mono ? "0.15em" : "0.03em",
              fontStyle: line.style === "italic" ? "italic" : "normal",
              transform: visible ? "translateY(0)" : "translateY(110%)",
              opacity: visible ? 1 : 0,
              transition: `transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}s, opacity 0.5s ease ${delay}s`,
            }}>
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── PlaceholderImg ──
function PlaceholderImg({ label, visible, phaseColor }: { label: string; visible: boolean; phaseColor: string }) {
  return (
    <div style={{
      width: "260px", height: "260px", flexShrink: 0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
      transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s",
    }}>
      <div style={{
        width: "100%", height: "100%",
        background: C.surfaceAlt, border: `1px solid ${C.inkFaint}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
          <defs><pattern id={`ig-${label}`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke={C.inkFaint} strokeWidth="1" />
          </pattern></defs>
          <rect width="100%" height="100%" fill={`url(#ig-${label})`} />
        </svg>
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: C.inkDim, fontFamily: C.mono, marginBottom: "6px" }}>IMAGE PLACEHOLDER</div>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: phaseColor, fontFamily: C.mono }}>{label}</div>
          <div style={{ marginTop: "6px", fontSize: "10px", color: C.inkFaint, fontFamily: C.mono }}>400 × 400</div>
        </div>
      </div>
    </div>
  );
}

// ── Architect's Eye ──
function ArchitectsEye({ text, visible, phaseColor }: { text: string; visible: boolean; phaseColor: string }) {
  return (
    <div style={{
      padding: "12px 16px",
      borderLeft: `3px solid ${phaseColor}`,
      background: `${phaseColor}0a`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{ fontSize: "8px", letterSpacing: "0.35em", color: phaseColor, fontFamily: C.mono, marginBottom: "5px", opacity: 0.8 }}>
        ARCHITECT&apos;S EYE
      </div>
      <div style={{ fontSize: "clamp(11px,1.3vw,13px)", color: C.inkMid, fontFamily: C.serif, fontStyle: "italic", lineHeight: 1.85, letterSpacing: "0.03em" }}>
        {text}
      </div>
    </div>
  );
}

// ── OverviewRadar ──
function OverviewRadar({ phaseColor }: { phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const params = [
    { label: "構造発見", value: 0.95 },
    { label: "BizDev", value: 0.72 },
    { label: "PdM", value: 0.60 },
    { label: "組織設計", value: 0.45 },
    { label: "財務設計", value: 0.55 },
    { label: "UX設計", value: 0.50 },
  ];
  const n = params.length;
  const cx = 110, cy = 110, r = 80;
  const angles = params.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const pts = (scale: number) => params.map((p, i) => ({
    x: cx + Math.cos(angles[i]) * r * p.value * scale,
    y: cy + Math.sin(angles[i]) * r * p.value * scale,
  }));
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {gridLevels.map((lv, gi) => (
          <polygon key={gi}
            points={angles.map(a => `${(cx + Math.cos(a) * r * lv).toFixed(1)},${(cy + Math.sin(a) * r * lv).toFixed(1)}`).join(" ")}
            fill="none" stroke={C.inkFaint} strokeWidth="0.8" opacity="0.6" />
        ))}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy}
            x2={Number((cx + Math.cos(a) * r).toFixed(1))} y2={Number((cy + Math.sin(a) * r).toFixed(1))}
            stroke={C.inkFaint} strokeWidth="0.8" opacity="0.5" />
        ))}
        <path d={toPath(pts(inView ? 1 : 0))}
          fill={phaseColor} fillOpacity="0.18" stroke={phaseColor} strokeWidth="1.5"
          style={{ transition: "d 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay: "0.3s" }} />
        {pts(inView ? 1 : 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={phaseColor}
            opacity={inView ? 0.8 : 0}
            style={{ transition: `opacity 0.4s ease ${0.5 + i * 0.08}s` }} />
        ))}
        {params.map((param, i) => {
          const lx = cx + Math.cos(angles[i]) * (r + 18);
          const ly = cy + Math.sin(angles[i]) * (r + 18);
          return (
            <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fill={C.inkMid} fontFamily={C.mono}>
              {param.label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {params.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: inView ? `${p.value * 100}%` : "0%", height: "3px",
              background: phaseColor, borderRadius: "1px",
              opacity: inView ? 0.7 : 0,
              transition: `opacity 0.4s ease ${0.7 + i * 0.07}s, width 0.8s ease ${0.4 + i * 0.07}s`,
            }} />
            <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: "monospace", flexShrink: 0, minWidth: "30px" }}>
              {Math.round(p.value * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ScopeBarChart ──
function ScopeBarChart({ scope, phaseColor }: { scope: { role: string; desc: string }[]; phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const colors = [phaseColor, "#2d6a9f", "#7a3b9e", "#b8740a", "#4a7c59", "#8b1a1a", "#3a5470"];
  const total = scope.length;
  const skills = scope.map((s, i) => ({
    label: s.role.split(" ")[0],
    pct: Math.round(100 / total),
    color: colors[i % colors.length],
  }));

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {skills.map((s, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "monospace" }}>{s.label}</div>
            <div style={{ fontSize: "11px", color: s.color, fontFamily: "monospace" }}>{s.pct}%</div>
          </div>
          <div style={{ height: "6px", background: C.inkFaint, borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: s.color, borderRadius: "3px",
              width: inView ? `${s.pct}%` : "0%",
              transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${0.2 + i * 0.12}s`,
            }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: "monospace", marginBottom: "6px" }}>
          SKILL DISTRIBUTION
        </div>
        <div style={{ display: "flex", height: "12px", borderRadius: "2px", overflow: "hidden" }}>
          {skills.map((s, i) => (
            <div key={i} style={{
              width: inView ? `${s.pct}%` : "0%", background: s.color, height: "100%",
              transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.08}s`,
            }} title={`${s.label}: ${s.pct}%`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ProjectOverview (featured cases only) ──
function ProjectOverview({ caseData, phaseColor }: { caseData: typeof CASES[0]; phaseColor: string }) {
  const ov = caseData.overview;
  if (!ov) return null;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.1);
  const phase = PHASES.find(p => p.id === caseData.phase);

  const items = [
    { num: "01", label: "Context", sub: "背景", text: ov.context },
    { num: "02", label: "Concept", sub: "再定義", text: ov.concept },
    { num: "03", label: "Strategy", sub: "戦略", text: ov.strategy },
    { num: "04", label: "Value", sub: "提供価値", text: ov.value },
  ];

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
      background: C.surface,
      borderTop: `1px solid ${C.inkFaint}`,
    }}>
      <div style={{
        padding: `12px clamp(48px,10vw,160px)`,
        borderBottom: `2px solid ${C.ink}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: C.bg,
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono }}>PROJECT OVERVIEW</div>
        <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono }}>{caseData.year} — {phase?.label.toUpperCase()}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "0", borderBottom: `1px solid ${C.inkFaint}` }}>
        <div style={{ padding: "24px 32px", borderRight: `1px solid ${C.inkFaint}` }}>
          <FadeIn>
            <h2 style={{ fontSize: "clamp(15px,2vw,22px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.4, marginBottom: "24px" }}>
              {ov.projectTitle}
            </h2>
          </FadeIn>
          {items.map((item, idx) => (
            <FadeIn key={item.label} delay={idx * 0.08}>
              <div style={{
                display: "flex", gap: "16px",
                paddingBottom: "18px", marginBottom: "18px",
                borderBottom: idx < 3 ? `1px solid ${C.inkFaint}` : "none",
              }}>
                <div style={{ flexShrink: 0, textAlign: "right", width: "32px" }}>
                  <div style={{ fontSize: "18px", color: C.inkFaint, fontFamily: C.mono, lineHeight: 1 }}>{item.num}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", letterSpacing: "0.2em", color: phaseColor, fontFamily: C.mono, fontWeight: "bold" }}>{item.label}</span>
                    <span style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif }}>{item.sub}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9 }}>{item.text}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div style={{ padding: "24px 20px", background: C.bg }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>PARAMETER</div>
          <OverviewRadar phaseColor={phaseColor} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "0" }}>
        <div style={{ padding: "24px 32px", borderRight: `1px solid ${C.inkFaint}` }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.ink, fontFamily: C.mono, fontWeight: "bold" }}>DESIGN SCOPE</div>
              <div style={{ flex: 1, height: "1px", background: C.inkFaint }} />
              <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono }}>{ov.scope.length} ROLES</div>
            </div>
          </FadeIn>
          {ov.scope.map((item, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div style={{
                display: "flex", gap: "16px",
                paddingBottom: "16px", marginBottom: "16px",
                borderBottom: i < ov.scope.length - 1 ? `1px solid ${C.inkFaint}` : "none",
              }}>
                <div style={{ flexShrink: 0, width: "32px", textAlign: "right" }}>
                  <div style={{ fontSize: "18px", color: C.inkFaint, fontFamily: C.mono, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: C.ink, fontFamily: C.mono, fontWeight: "bold", marginBottom: "6px" }}>{item.role}</div>
                  <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.8 }}>{item.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div style={{ padding: "24px 20px", background: C.bg }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>SKILL MIX</div>
          <ScopeBarChart scope={ov.scope} phaseColor={phaseColor} />
        </div>
      </div>
    </div>
  );
}

// ── Non-featured: Simple Timeline ──
function SimpleTimeline({ steps, phaseColor }: { steps: DisplayStep[]; phaseColor: string }) {
  return (
    <div style={{ padding: "clamp(40px,6vh,80px) clamp(48px,10vw,160px)" }}>
      {steps.map((step, i) => (
        <TimelineStep key={i} step={step} index={i} total={steps.length} phaseColor={phaseColor} />
      ))}
    </div>
  );
}

function TimelineStep({ step, index, total, phaseColor }: { step: DisplayStep; index: number; total: number; phaseColor: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.15);

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: "opacity 0.7s ease, transform 0.7s ease",
      paddingBottom: index < total - 1 ? "clamp(40px,6vh,72px)" : "0",
      marginBottom: index < total - 1 ? "clamp(40px,6vh,72px)" : "0",
      borderBottom: index < total - 1 ? `1px solid ${C.inkFaint}` : "none",
    }}>
      <div style={{ display: "flex", gap: "clamp(24px,4vw,56px)", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              border: `1px solid ${phaseColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", color: phaseColor, fontFamily: C.mono, flexShrink: 0,
            }}>
              {String(step.index).padStart(2, "0")}
            </div>
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: phaseColor, fontFamily: C.mono, opacity: 0.8 }}>{step.en}</div>
              <div style={{ fontSize: "15px", color: C.ink, fontFamily: C.serif, letterSpacing: "0.04em" }}>{step.label}</div>
            </div>
          </div>
          <TextLines lines={step.lines} visible={inView} />
        </div>
        <div style={{ flexShrink: 0, width: "130px", height: "130px" }}>
          <Diagram type={step.diagramType} visible={inView} phaseColor={phaseColor} />
        </div>
      </div>
    </div>
  );
}

// ── Featured: Scrollytelling ──
const PHASES_PER_STEP = 3;
const SCROLL_PER_PHASE = 520;

function FeaturedScrollytelling({ steps, phaseColor, caseData, overviewRef }: {
  steps: DisplayStep[];
  phaseColor: string;
  caseData: typeof CASES[0];
  overviewRef: React.RefObject<HTMLDivElement | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPhases = steps.length * PHASES_PER_STEP;

  const [currentPhase, setCurrentPhase] = useState(-1);
  const [showOverview, setShowOverview] = useState(false);

  const stepIdx = currentPhase < 0 ? 0 : Math.min(steps.length - 1, Math.floor(currentPhase / PHASES_PER_STEP));
  const phaseInStep = currentPhase < 0 ? -1 : currentPhase % PHASES_PER_STEP;

  const textVisible = phaseInStep >= 0;
  const imgVisible = phaseInStep >= 1;
  const diagVisible = phaseInStep >= 2;
  const [eyeVisible, setEyeVisible] = useState(false);

  useEffect(() => {
    if (diagVisible) {
      const t = setTimeout(() => setEyeVisible(true), 1000);
      return () => clearTimeout(t);
    } else {
      setEyeVisible(false);
    }
  }, [diagVisible, stepIdx]);

  const [renderedStep, setRenderedStep] = useState(0);
  const [textIn, setTextIn] = useState(false);

  useEffect(() => {
    if (stepIdx !== renderedStep) {
      setTextIn(false);
      setEyeVisible(false);
      const t = setTimeout(() => { setRenderedStep(stepIdx); setTextIn(true); }, 120);
      return () => clearTimeout(t);
    } else if (textVisible) {
      setTextIn(true);
    } else {
      setTextIn(false);
    }
  }, [stepIdx, renderedStep, textVisible]);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      if (scrolled <= 0) { setCurrentPhase(-1); return; }
      const phase = Math.min(totalPhases - 1, Math.floor(scrolled / SCROLL_PER_PHASE));
      setCurrentPhase(phase);

      const ov = overviewRef.current;
      if (ov) setShowOverview(ov.getBoundingClientRect().top < window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [totalPhases, overviewRef]);

  const dotLabels = [...steps.map(s => s.label), ...(caseData.overview ? ["プロジェクト概要"] : [])];

  const handleDotClick = (i: number) => {
    if (i === steps.length) { overviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const el = containerRef.current;
    if (!el) return;
    const containerTop = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: containerTop + i * PHASES_PER_STEP * SCROLL_PER_PHASE, behavior: "smooth" });
  };

  const dotActive = showOverview ? steps.length : stepIdx;
  const progress = (stepIdx + 1) / steps.length;
  const displayStep = steps[renderedStep];

  return (
    <>
      {/* Thumbnail bar */}
      <div style={{
        position: "sticky", top: `${NAV_H}px`, zIndex: 150,
        height: `${THUMB_H}px`,
        background: C.bg,
        borderBottom: `1px solid ${C.inkFaint}`,
        borderLeft: `4px solid ${phaseColor}`,
        display: "flex", alignItems: "center",
        padding: `0 clamp(48px,10vw,160px)`,
        gap: "clamp(16px,3vw,40px)",
      }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: phaseColor, animation: "pulse 2.2s ease infinite" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.4em", color: phaseColor, fontFamily: C.mono }}>
              CASE {String(caseData.id).padStart(2, "0")}
            </span>
          </div>
          <div style={{ fontSize: "clamp(12px,1.5vw,17px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.25, letterSpacing: "0.02em", maxWidth: "clamp(200px,28vw,360px)" }}>
            {caseData.title}
          </div>
        </div>
        <div style={{ width: "1px", height: "40px", background: C.inkFaint, flexShrink: 0 }} />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: "8px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>
            {dotLabels[dotActive]}
          </div>
          <DotNav labels={dotLabels} active={dotActive} onDotClick={handleDotClick} phaseColor={phaseColor} />
        </div>
        <div style={{ flexShrink: 0, fontSize: "11px", letterSpacing: "0.2em", color: phaseColor, fontFamily: C.mono, display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "48px", height: "2px", background: C.inkFaint, borderRadius: "1px", overflow: "hidden" }}>
            <div style={{ height: "100%", background: phaseColor, width: `${progress * 100}%`, transition: "width 0.4s ease" }} />
          </div>
          {showOverview ? `${String(steps.length + 1).padStart(2, "0")}/${String(dotLabels.length).padStart(2, "0")}` : `${String(stepIdx + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`}
        </div>
      </div>

      {/* Scrollytelling */}
      <div ref={containerRef} style={{ position: "relative", height: `${totalPhases * SCROLL_PER_PHASE + 600}px` }}>
        <div style={{
          position: "sticky",
          top: `${NAV_H + THUMB_H}px`,
          height: `calc(100vh - ${NAV_H + THUMB_H}px)`,
          background: C.surface,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ height: "2px", background: C.inkFaint, flexShrink: 0 }}>
            <div style={{ height: "100%", background: phaseColor, width: `${progress * 100}%`, transition: "width 0.45s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${phaseColor}50` }} />
          </div>

          <div style={{
            flex: 1, minHeight: 0,
            padding: "clamp(20px,3.5vh,44px) clamp(48px,10vw,160px)",
            display: "flex", flexDirection: "column",
            gap: "clamp(10px,1.5vh,18px)",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0, opacity: textIn ? 1 : 0, transition: "opacity 0.35s ease" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${phaseColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: phaseColor, fontFamily: C.mono, flexShrink: 0 }}>
                {String(displayStep.index).padStart(2, "0")}
              </div>
              <div>
                <div style={{ fontSize: "9px", letterSpacing: "0.4em", color: phaseColor, fontFamily: C.mono, opacity: 0.8 }}>{displayStep.en}</div>
                <div style={{ fontSize: "13px", color: C.ink, fontFamily: C.serif, letterSpacing: "0.04em" }}>{displayStep.label}</div>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "clamp(24px,4vw,56px)", alignItems: "flex-start", overflow: "hidden" }}>
              <div style={{ flex: "1 1 auto", minWidth: 0, paddingTop: "4px", display: "flex", flexDirection: "column", gap: "clamp(10px,1.5vh,16px)" }}>
                {/* 2E: Main copy (xl lines only) */}
                <TextLines lines={displayStep.lines.filter(l => l.size === "xl")} visible={textIn} />
                {/* 2F: Body text placeholder */}
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", opacity: textIn ? 1 : 0, transition: "opacity 0.5s ease 0.15s" }}>
                  <p style={{ fontSize: "14px", color: C.inkDim, lineHeight: 1.75, fontFamily: C.serif }}>
                    ——本文テキストがここに入ります——
                  </p>
                  <p style={{ fontSize: "14px", color: C.inkDim, lineHeight: 1.75, fontFamily: C.serif }}>
                    ——本文テキストがここに入ります——
                  </p>
                </div>
                {/* 2G: ARCHITECT'S EYE (below 2F) */}
                {displayStep.eye && (
                  <div style={{ marginTop: "24px" }}>
                    <ArchitectsEye text={displayStep.eye} visible={eyeVisible} phaseColor={phaseColor} />
                  </div>
                )}
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-end" }}>
                {/* 2H: sketch.png image */}
                <div style={{
                  width: "260px", height: "260px", flexShrink: 0,
                  opacity: imgVisible ? 1 : 0,
                  transform: imgVisible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
                  transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s",
                  position: "relative", overflow: "hidden",
                }}>
                  <img
                    src={`/cases/case${caseData.id}/sketch.png`}
                    alt="端末スケッチ"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                {/* 2I: Diagram placeholder */}
                <div style={{
                  width: "260px", height: "130px",
                  border: `1px solid ${C.inkFaint}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: diagVisible ? 1 : 0,
                  transform: diagVisible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity 0.55s ease, transform 0.6s ease",
                }}>
                  <p style={{ fontSize: "10px", letterSpacing: "0.3em", color: C.inkFaint, fontFamily: C.mono }}>
                    DIAGRAM PLACEHOLDER
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2J: Footer bar (expanded height) */}
          <div style={{ padding: `20px clamp(48px,10vw,160px)`, borderTop: `1px solid ${C.inkFaint}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg, flexShrink: 0 }}>
            <div style={{ fontSize: "12px", color: C.inkMid, fontFamily: C.serif, fontStyle: "italic" }}>{displayStep.label}</div>
            <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: C.inkFaint, fontFamily: C.mono, animation: "bounce 1.7s ease infinite" }}>↓ scroll</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ──
export default function CasePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const caseData = CASES.find(c => c.id === id);
  const overviewRef = useRef<HTMLDivElement>(null);

  if (!caseData) {
    return (
      <main style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", color: C.inkFaint, fontFamily: C.serif, marginBottom: "16px" }}>404</div>
          <div style={{ fontSize: "14px", color: C.inkDim, fontFamily: C.mono, marginBottom: "24px" }}>Case not found</div>
          <Link href="/cases" style={{ fontSize: "12px", color: C.accent, fontFamily: C.mono, textDecoration: "none" }}>← すべてのケースへ</Link>
        </div>
      </main>
    );
  }

  const phase = PHASES.find(p => p.id === caseData.phase);
  const phaseColor = phase?.color ?? C.accent;
  const isFeatured = !!caseData.overview;
  const displaySteps = buildDisplaySteps(caseData);

  // Prev/Next
  const caseIndex = CASES.findIndex(c => c.id === id);
  const prevCase = caseIndex > 0 ? CASES[caseIndex - 1] : null;
  const nextCase = caseIndex < CASES.length - 1 ? CASES[caseIndex + 1] : null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:auto; }
        body { background:${C.bg}; overflow-x:hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: `${NAV_H}px`,
        background: `${C.surface}f0`, backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.inkFaint}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 clamp(48px,10vw,160px)`,
      }}>
        <Link href="/cases" style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.inkDim, fontFamily: C.mono, textDecoration: "none" }}>← 号 / CASES</Link>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.3em", color: phaseColor, fontFamily: C.mono }}>{phase?.label.toUpperCase()}</div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: C.mono }}>{caseData.year}</div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: `calc(${NAV_H}px + 10vh) clamp(48px,10vw,160px) 10vh`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Background: sketch image + dark overlay */}
        <img
          src={`/cases/case${caseData.id}/sketch.png`}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.60)" }} />

        <div style={{ maxWidth: "700px", position: "relative", zIndex: 1, animation: "fadeUp 0.9s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: phaseColor, animation: "pulse 2.2s ease infinite" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.5em", color: "rgba(255,255,255,0.5)", fontFamily: C.mono }}>CASE {String(caseData.id).padStart(2, "0")}</span>
            <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontFamily: C.mono }}>— {caseData.year}</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,4vw,52px)", color: "#ffffff", fontFamily: C.serif, lineHeight: 1.3, letterSpacing: "0.02em", marginBottom: "20px" }}>
            {caseData.title}
          </h1>
          <p style={{ fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(255,255,255,0.6)", fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em", maxWidth: "500px", marginBottom: "32px" }}>
            {caseData.steps[0].text.split("\n")[0]}
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {caseData.tags.map(t => (
              <span key={t} style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", padding: "3px 10px", border: "1px solid rgba(255,255,255,0.15)", fontFamily: C.mono, letterSpacing: "0.15em" }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, animation: "fadeUp 1s ease 0.6s both" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.45em", color: "rgba(255,255,255,0.25)", fontFamily: C.mono }}>SCROLL</div>
          <div style={{ width: "1px", height: "36px", background: `linear-gradient(180deg, ${phaseColor}70, transparent)`, animation: "bounce 1.9s ease infinite" }} />
        </div>
      </section>

      {/* Content: Featured or Simple */}
      {isFeatured ? (
        <>
          <FeaturedScrollytelling steps={displaySteps} phaseColor={phaseColor} caseData={caseData} overviewRef={overviewRef} />
          <div ref={overviewRef}>
            <ProjectOverview caseData={caseData} phaseColor={phaseColor} />
          </div>
        </>
      ) : (
        <SimpleTimeline steps={displaySteps} phaseColor={phaseColor} />
      )}

      {/* Footer with Prev/Next */}
      <div style={{ padding: "clamp(40px,6vh,80px) clamp(48px,10vw,160px)", background: C.bg, borderTop: `1px solid ${C.inkFaint}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono }}>
            CASE {String(caseData.id).padStart(2, "0")} — {caseData.year}
          </div>
          <Link href="/cases"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "11px", letterSpacing: "0.35em", color: phaseColor, fontFamily: C.mono, textDecoration: "none", padding: "11px 26px", border: `1px solid ${phaseColor}40`, transition: "border-color 0.25s ease" }}
          >
            ← すべてのケースへ
          </Link>
        </div>

        {/* Prev / Next */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", borderTop: `1px solid ${C.inkFaint}`, paddingTop: "24px" }}>
          {prevCase ? (
            <Link href={`/cases/${prevCase.id}`} style={{ textDecoration: "none", padding: "16px 20px", border: `1px solid ${C.inkFaint}`, transition: "border-color 0.2s ease", display: "block" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>← PREV</div>
              <div style={{ fontSize: "13px", color: C.ink, fontFamily: C.serif, lineHeight: 1.5 }}>{prevCase.title}</div>
            </Link>
          ) : <div />}
          {nextCase ? (
            <Link href={`/cases/${nextCase.id}`} style={{ textDecoration: "none", padding: "16px 20px", border: `1px solid ${C.inkFaint}`, transition: "border-color 0.2s ease", display: "block", textAlign: "right" }}>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>NEXT →</div>
              <div style={{ fontSize: "13px", color: C.ink, fontFamily: C.serif, lineHeight: 1.5 }}>{nextCase.title}</div>
            </Link>
          ) : <div />}
        </div>
      </div>
    </>
  );
}
