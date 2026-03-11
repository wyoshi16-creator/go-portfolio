"use client";

import { useEffect, useRef, useState } from "react";

// ── Design tokens ──
const C = {
  bg:         "#f0f4f8",
  ink:        "#0f1f2e",
  inkMid:     "#3a5470",
  inkDim:     "#7a9ab5",
  inkFaint:   "#c8daea",
  surface:    "#f7fafd",
  surfaceAlt: "#e2edf5",
  accent:     "#1a6fc4",
  mono:       "'JetBrains Mono','Courier New',monospace",
  serif:      "'Georgia','Times New Roman',serif",
};
const PC = "#4a7c59";
const NAV_H   = 52;
const THUMB_H = 88;

// ─────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────
function useInView(ref: React.RefObject<HTMLElement>, threshold = 0.2, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold, rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return inView;
}

// ─────────────────────────────────────────
// FadeIn (同page.tsx)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// OverviewRadar（page.tsxから完全移植）
// ─────────────────────────────────────────
function OverviewRadar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const params = [
    { label: "構造発見", value: 0.95 },
    { label: "BizDev",   value: 0.72 },
    { label: "PdM",      value: 0.60 },
    { label: "組織設計", value: 0.45 },
    { label: "財務設計", value: 0.55 },
    { label: "UX設計",   value: 0.50 },
  ];
  const n = params.length;
  const cx = 110, cy = 110, r = 80;
  const angles = params.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);
  const pts = (scale: number) => params.map((p, i) => ({
    x: cx + Math.cos(angles[i]) * r * p.value * scale,
    y: cy + Math.sin(angles[i]) * r * p.value * scale,
  }));
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const toPath = (points: {x:number;y:number}[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";

  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {gridLevels.map((lv, gi) => (
          <polygon key={gi}
            points={angles.map(a=>`${(cx+Math.cos(a)*r*lv).toFixed(1)},${(cy+Math.sin(a)*r*lv).toFixed(1)}`).join(" ")}
            fill="none" stroke={C.inkFaint} strokeWidth="0.8" opacity="0.6"/>
        ))}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy}
            x2={(cx+Math.cos(a)*r).toFixed(1)} y2={(cy+Math.sin(a)*r).toFixed(1)}
            stroke={C.inkFaint} strokeWidth="0.8" opacity="0.5"/>
        ))}
        <path d={toPath(pts(inView ? 1 : 0))}
          fill={PC} fillOpacity="0.18" stroke={PC} strokeWidth="1.5"
          style={{ transition:"d 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay:"0.3s" }}/>
        {pts(inView ? 1 : 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={PC}
            opacity={inView ? 0.8 : 0}
            style={{ transition:`opacity 0.4s ease ${0.5+i*0.08}s` }}/>
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
      <div style={{ display:"flex", flexDirection:"column", gap:"6px", width:"100%" }}>
        {params.map((p, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <div style={{
              width: inView ? `${p.value*100}%` : "0%", height:"3px",
              background:PC, borderRadius:"1px",
              opacity: inView ? 0.7 : 0,
              transition:`opacity 0.4s ease ${0.7+i*0.07}s, width 0.8s ease ${0.4+i*0.07}s`,
            }}/>
            <div style={{ fontSize:"11px", color:C.inkDim, fontFamily:"monospace", flexShrink:0, minWidth:"30px" }}>
              {Math.round(p.value*100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ScopeBarChart（page.tsxから完全移植）
// ─────────────────────────────────────────
function ScopeBarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.2);
  const skills = [
    { label:"構造設計", pct:35, color:PC },
    { label:"BizDev",   pct:25, color:"#2d6a9f" },
    { label:"PdM",      pct:18, color:"#7a3b9e" },
    { label:"UX設計",   pct:12, color:"#b8740a" },
    { label:"調査",     pct:10, color:"#4a7c59" },
  ];
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      {skills.map((s, i) => (
        <div key={i}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
            <div style={{ fontSize:"11px", color:C.inkMid, fontFamily:"monospace" }}>{s.label}</div>
            <div style={{ fontSize:"11px", color:s.color, fontFamily:"monospace" }}>{s.pct}%</div>
          </div>
          <div style={{ height:"6px", background:C.inkFaint, borderRadius:"3px", overflow:"hidden" }}>
            <div style={{
              height:"100%", background:s.color, borderRadius:"3px",
              width: inView ? `${s.pct}%` : "0%",
              transition:`width 0.9s cubic-bezier(0.16,1,0.3,1) ${0.2+i*0.12}s`,
            }}/>
          </div>
        </div>
      ))}
      <div style={{ marginTop:"8px" }}>
        <div style={{ fontSize:"11px", letterSpacing:"0.2em", color:C.inkDim, fontFamily:"monospace", marginBottom:"6px" }}>
          SKILL DISTRIBUTION
        </div>
        <div style={{ display:"flex", height:"12px", borderRadius:"2px", overflow:"hidden" }}>
          {skills.map((s, i) => (
            <div key={i} style={{
              width: inView ? `${s.pct}%` : "0%", background:s.color, height:"100%",
              transition:`width 1s cubic-bezier(0.16,1,0.3,1) ${0.5+i*0.08}s`,
            }} title={`${s.label}: ${s.pct}%`}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Dot Navigation
// ─────────────────────────────────────────
const DOT_LABELS = ["依頼の表面","最初の違和感","構造の発見","設計の転換","実装の形","アウトカム","プロジェクト概要"];

function DotNav({ active, onDotClick }: { active: number; onDotClick: (i:number)=>void }) {
  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      {DOT_LABELS.map((label, i) => {
        const isActive = i === active;
        const isPast   = i < active;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            {i > 0 && (
              <div style={{
                width:"clamp(10px,1.8vw,24px)", height:"1px",
                background: isPast||isActive ? PC : C.inkFaint,
                transition:"background 0.35s ease",
              }}/>
            )}
            <div onClick={()=>onDotClick(i)} title={label} style={{
              cursor:"pointer", flexShrink:0,
              width:  isActive ? "10px" : "6px",
              height: isActive ? "10px" : "6px",
              borderRadius:"50%",
              background: isActive ? PC : isPast ? `${PC}80` : C.inkFaint,
              border: isActive ? `2px solid ${PC}` : "none",
              transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            }}/>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────
// SVG Diagrams
// ─────────────────────────────────────────
function Diagram({ type, visible }: { type:string; visible:boolean }) {
  const base: React.CSSProperties = {
    width:"100%", height:"100%",
    opacity: visible ? 1 : 0,
    transform: visible ? "scale(1)" : "scale(0.92)",
    transition:"opacity 0.6s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)",
  };
  if (type==="question") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="100" cy="100" r="60" fill="none" stroke={PC} strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
      <circle cx="100" cy="100" r="40" fill="none" stroke={PC} strokeWidth="1" opacity="0.5"/>
      <text x="100" y="108" textAnchor="middle" fontSize="32" fill={PC} fontFamily="Georgia,serif" opacity="0.9">?</text>
      <text x="100" y="172" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">SURFACE</text>
    </svg>
  );
  if (type==="tension") return (
    <svg viewBox="0 0 200 200" style={base}>
      <line x1="40" y1="100" x2="160" y2="100" stroke={PC} strokeWidth="1" opacity="0.3"/>
      {[0,1,2].map(i=>(
        <g key={i}>
          <circle cx={60+i*40} cy="100" r="16" fill="none" stroke={PC} strokeWidth="1" opacity={0.3+i*0.25}/>
          <circle cx={60+i*40} cy="100" r="4" fill={PC} opacity={0.3+i*0.25}/>
        </g>
      ))}
      <text x="100" y="158" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">FRICTION</text>
    </svg>
  );
  if (type==="structure") return (
    <svg viewBox="0 0 200 200" style={base}>
      {[0,1,2].map(i=>(
        <g key={i}>
          <rect x="30" y={38+i*44} width="140" height="28" rx="2" fill="none" stroke={PC} strokeWidth="1" opacity={0.25+i*0.15}/>
          <rect x="30" y={38+i*44} width={40+i*15} height="28" rx="2" fill={PC} opacity={0.08+i*0.06}/>
          <text x="42" y={58+i*44} fontSize="9" fill={PC} fontFamily={C.mono} opacity="0.6">{["NOVELTY","SALES   ","MID-TERM"][i]}</text>
        </g>
      ))}
      <line x1="170" y1="52" x2="170" y2="150" stroke={PC} strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
      <text x="100" y="180" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">SILOS</text>
    </svg>
  );
  if (type==="transform") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="70" cy="80" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4"/>
      <circle cx="130" cy="80" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4"/>
      <circle cx="100" cy="130" r="28" fill="none" stroke={PC} strokeWidth="1" opacity="0.4"/>
      <path d="M82 92 L118 92 L100 120 Z" fill={PC} opacity="0.15"/>
      <circle cx="100" cy="100" r="6" fill={PC} opacity="0.6"/>
      <text x="70" y="84" textAnchor="middle" fontSize="7" fill={PC} fontFamily={C.mono} opacity="0.6">NOV</text>
      <text x="130" y="84" textAnchor="middle" fontSize="7" fill={PC} fontFamily={C.mono} opacity="0.6">SAL</text>
      <text x="100" y="134" textAnchor="middle" fontSize="7" fill={PC} fontFamily={C.mono} opacity="0.6">MID</text>
      <text x="100" y="178" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">UNIFIED</text>
    </svg>
  );
  if (type==="flow") return (
    <svg viewBox="0 0 200 200" style={base}>
      {["MR","Dr","Pharma"].map((label,i)=>(
        <g key={i}>
          <rect x="65" y={30+i*52} width="70" height="32" rx="2" fill="none" stroke={PC} strokeWidth="1" opacity={0.35+i*0.15}/>
          <text x="100" y={51+i*52} textAnchor="middle" fontSize="10" fill={PC} fontFamily={C.mono} opacity="0.7">{label}</text>
          {i<2&&<path d={`M100 ${62+i*52} L100 ${72+i*52} M96 ${68+i*52} L100 ${73+i*52} L104 ${68+i*52}`} fill="none" stroke={PC} strokeWidth="1" opacity="0.3"/>}
        </g>
      ))}
      <text x="100" y="182" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">SD CARD UX</text>
    </svg>
  );
  if (type==="outcome") return (
    <svg viewBox="0 0 200 200" style={base}>
      <circle cx="100" cy="90" r="50" fill="none" stroke={PC} strokeWidth="1" opacity="0.2"/>
      <circle cx="100" cy="90" r="35" fill="none" stroke={PC} strokeWidth="1" opacity="0.35"/>
      <circle cx="100" cy="90" r="20" fill={PC} opacity="0.12"/>
      <circle cx="100" cy="90" r="6" fill={PC} opacity="0.7"/>
      {[0,72,144,216,288].map((deg,i)=>{
        const rad=(deg-90)*Math.PI/180;
        return <circle key={i} cx={100+50*Math.cos(rad)} cy={90+50*Math.sin(rad)} r="3" fill={PC} opacity="0.5"/>;
      })}
      <text x="100" y="165" textAnchor="middle" fontSize="9" fill={PC} fontFamily={C.mono} letterSpacing="3" opacity="0.5">OUTCOME</text>
    </svg>
  );
  return null;
}

// ─────────────────────────────────────────
// Step data  4フェーズ: text / image / diagram / eye(自動)
// ─────────────────────────────────────────
type Line = { text:string; size:string; style?:string; mono?:boolean };
const STEPS: { index:number; label:string; en:string; lines:Line[]; eye:string; diagramLabel:string; diagramType:string }[] = [
  { index:1, label:"依頼の表面", en:"THE SURFACE REQUEST",
    lines:[
      {text:"「ノベルティを作ってほしい」",size:"xl",style:"italic"},
      {text:"",size:"gap"},
      {text:"普通のデザイナーはここで動き出す。",size:"md"},
      {text:"私は、動かなかった。",size:"md"},
    ],
    eye:"依頼を額面通りに受け取ることは、依頼者の本当の問いを殺すことと同じだ。",
    diagramLabel:"SURFACE", diagramType:"question" },
  { index:2, label:"最初の違和感", en:"FIRST FRICTION",
    lines:[
      {text:"なぜ医師はMRを避けるのか。",size:"xl"},
      {text:"",size:"gap"},
      {text:"ノベルティの問題ではない。",size:"md"},
      {text:"何かもっと根本的な構造がある。",size:"md"},
    ],
    eye:"問いを疑うことが、設計の始まりだ。表層の問題を解いても、構造は変わらない。",
    diagramLabel:"FRICTION", diagramType:"tension" },
  { index:3, label:"構造の発見", en:"STRUCTURAL DISCOVERY",
    lines:[
      {text:"問題は「モノ」ではなかった。",size:"xl"},
      {text:"",size:"gap"},
      {text:"3つの予算が完全に分断されていた。",size:"md"},
      {text:"",size:"gap"},
      {text:"ノベルティ予算",size:"sm",mono:true},
      {text:"営業支援予算",size:"sm",mono:true},
      {text:"中長期予算",size:"sm",mono:true},
      {text:"",size:"gap"},
      {text:"誰もこれを統合しようとしていなかった。",size:"md"},
    ],
    eye:"組織の「見えない壁」は、予算の分断として現れる。構造を見る目が、解を生む。",
    diagramLabel:"SILOS", diagramType:"structure" },
  { index:4, label:"設計の転換", en:"DESIGN PIVOT",
    lines:[
      {text:"3つを統合した瞬間、",size:"xl"},
      {text:"解が見えた。",size:"xl"},
      {text:"",size:"gap"},
      {text:"予算の壁を壊すことが",size:"md"},
      {text:"本当の仕事だった。",size:"md"},
    ],
    eye:"アブダクション推論。「こうすれば説明できる」という仮説が、新しい問いの形を作る。",
    diagramLabel:"UNIFIED", diagramType:"transform" },
  { index:5, label:"実装の形", en:"IMPLEMENTATION FORM",
    lines:[
      {text:"SDカード更新UXという制約設計。",size:"xl"},
      {text:"",size:"gap"},
      {text:"MRが使える。",size:"md"},
      {text:"医師が受け取れる。",size:"md"},
      {text:"製薬メーカーが承認できる。",size:"md"},
      {text:"",size:"gap"},
      {text:"三者が動ける形を作った。",size:"md"},
    ],
    eye:"制約は敵ではない。制約の中に、三者が動ける唯一の形が隠れていた。",
    diagramLabel:"SD CARD UX", diagramType:"flow" },
  { index:6, label:"アウトカム", en:"OUTCOME",
    lines:[
      {text:"新薬販売促進。",size:"xl"},
      {text:"",size:"gap"},
      {text:"医師・MR・製薬メーカー、",size:"md"},
      {text:"三者の課題を同時解決。",size:"md"},
      {text:"",size:"gap"},
      {text:"ノベルティの依頼が、",size:"md"},
      {text:"事業構造の再設計になった。",size:"md"},
    ],
    eye:"問いを設計し直すことで、解のスケールが変わった。これが「号」の仕事の核心だ。",
    diagramLabel:"OUTCOME", diagramType:"outcome" },
];

// 3スクロールフェーズ/step (text=0 / image=1 / diagram=2)
// EYEはdiagram表示から1秒後に自動表示
const PHASES_PER_STEP  = 3;
const TOTAL_PHASES     = STEPS.length * PHASES_PER_STEP;
const SCROLL_PER_PHASE = 520;

// ─────────────────────────────────────────
// TextLines
// ─────────────────────────────────────────
function TextLines({ lines, visible }: { lines:Line[]; visible:boolean }) {
  return (
    <div>
      {lines.map((line, i) => {
        if (line.size==="gap") return <div key={i} style={{ height:"clamp(10px,1.8vh,20px)" }}/>;
        const delay = i * 0.06;
        return (
          <div key={i} style={{ overflow:"hidden", marginBottom:"2px" }}>
            <div style={{
              fontSize: line.size==="xl" ? "clamp(20px,2.6vw,32px)" : line.size==="md" ? "clamp(14px,1.6vw,18px)" : "clamp(12px,1.2vw,14px)",
              color:    line.size==="xl" ? C.ink : line.size==="md" ? C.inkMid : C.inkDim,
              fontFamily: line.mono ? C.mono : C.serif,
              lineHeight: line.size==="xl" ? 1.35 : 1.85,
              letterSpacing: line.style==="italic" ? "0.02em" : line.mono ? "0.15em" : "0.03em",
              fontStyle: line.style==="italic" ? "italic" : "normal",
              transform: visible ? "translateY(0)" : "translateY(110%)",
              opacity:   visible ? 1 : 0,
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

// ─────────────────────────────────────────
// Placeholder image 400×400
// ─────────────────────────────────────────
function PlaceholderImg({ label, visible }: { label:string; visible:boolean }) {
  return (
    <div style={{
      width:"260px", height:"260px", flexShrink:0,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
      transition:"opacity 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.05s",
    }}>
      <div style={{
        width:"100%", height:"100%",
        background:C.surfaceAlt, border:`1px solid ${C.inkFaint}`,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden",
      }}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.5}}>
          <defs><pattern id="ig" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke={C.inkFaint} strokeWidth="1"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#ig)"/>
        </svg>
        <div style={{position:"relative",textAlign:"center"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.4em",color:C.inkDim,fontFamily:C.mono,marginBottom:"6px"}}>IMAGE PLACEHOLDER</div>
          <div style={{fontSize:"11px",letterSpacing:"0.3em",color:PC,fontFamily:C.mono}}>{label}</div>
          <div style={{marginTop:"6px",fontSize:"10px",color:C.inkFaint,fontFamily:C.mono}}>400 × 400</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ARCHITECT'S EYE（テキスト直下）
// ─────────────────────────────────────────
function ArchitectsEye({ text, visible }: { text:string; visible:boolean }) {
  return (
    <div style={{
      padding:"12px 16px",
      borderLeft:`3px solid ${PC}`,
      background:`${PC}0a`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition:"opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div style={{fontSize:"8px",letterSpacing:"0.35em",color:PC,fontFamily:C.mono,marginBottom:"5px",opacity:0.8}}>
        ARCHITECT'S EYE
      </div>
      <div style={{fontSize:"clamp(11px,1.3vw,13px)",color:C.inkMid,fontFamily:C.serif,fontStyle:"italic",lineHeight:1.85,letterSpacing:"0.03em"}}>
        {text}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PROJECT OVERVIEW（page.tsx OverviewGate構造を移植）
// ─────────────────────────────────────────
const OVERVIEW_ITEMS = [
  { num:"01", label:"Context", sub:"背景",
    text:"製薬メーカーのMR（医薬情報担当者）が、担当医師にアプローチできていない。アポイントが取れない、資料が渡らない、という表面的な「ノベルティ不足」として依頼が来た。" },
  { num:"02", label:"Concept", sub:"再定義",
    text:"問題は「ノベルティの質」ではなく「予算の分断」だった。ノベルティ・営業支援・中長期の3予算が完全に縦割りで、誰も統合しようとしていなかった構造が本質だった。" },
  { num:"03", label:"Strategy", sub:"戦略",
    text:"3予算を統合できる「SDカード更新型デバイス」を設計。MRが使え、医師が受け取れ、製薬メーカーが承認できる——三者が動ける唯一の形を起点に、承認フローを逆算設計した。" },
  { num:"04", label:"Value", sub:"提供価値",
    text:"「ノベルティ予算」でありながら「営業支援ツール」として機能し、長期的なMR-医師関係を構築できる。依頼の問いを変えることで、単品受注が事業構造の再設計に昇華した。" },
];
const SCOPE_ITEMS = [
  { role:"Business Research",  desc:"「ノベルティ」という表層ではなく、MR-医師間の構造的断絶を特定。承認プロセスの壁とコスト感度の違いを三者ヒアリングで可視化した。" },
  { role:"Business Architect", desc:"3つに分断された予算（ノベルティ・営業支援・中長期）を統合できる唯一の接点を特定し、デバイス仕様を逆算。問いそのものを「ノベルティ改善」から「販売促進の構造設計」へ転換した。" },
  { role:"BizDev",             desc:"製薬メーカー・MR・医師の三者が同時にYESを出せる承認フローを設計。ノベルティ予算内で完結しながら、営業支援予算の機能を内包するスキームを構築。" },
  { role:"PdM",                desc:"SDカード更新UIという制約を武器に変換。更新コストを最小化しながら、情報の鮮度を保つ仕組みをプロダクト仕様として落とし込んだ。" },
  { role:"Stakeholder Design", desc:"MRの行動変容（渡しやすさ）、医師の受容性（受け取りやすさ）、メーカーの承認容易性——三者のJTBDを同時に満たす設計ポイントを特定・言語化。" },
];

function ProjectOverview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.1);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition:"opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
      background:C.surface,
      borderTop:`1px solid ${C.inkFaint}`,
    }}>
      {/* ヘッダー */}
      <div style={{
        padding:`12px clamp(48px,10vw,160px)`,
        borderBottom:`2px solid ${C.ink}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:C.bg,
      }}>
        <div style={{fontSize:"11px",letterSpacing:"0.5em",color:C.inkDim,fontFamily:C.mono}}>PROJECT OVERVIEW</div>
        <div style={{fontSize:"11px",color:C.inkDim,fontFamily:C.mono}}>2019 — DISCOVERY</div>
      </div>

      {/* 上段: Context〜Value (左) + Radar (右) */}
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 280px", gap:"0",
        borderBottom:`1px solid ${C.inkFaint}`,
      }}>
        {/* 左: タイトル + items */}
        <div style={{ padding:"24px 32px", borderRight:`1px solid ${C.inkFaint}` }}>
          <FadeIn>
            <h2 style={{fontSize:"clamp(15px,2vw,22px)",color:C.ink,fontFamily:C.serif,lineHeight:1.4,marginBottom:"24px"}}>
              「ノベルティ」として来た依頼が、新薬販売の構造設計になった
            </h2>
          </FadeIn>
          {OVERVIEW_ITEMS.map((item, idx) => (
            <FadeIn key={item.label} delay={idx*0.08}>
              <div style={{
                display:"flex", gap:"16px",
                paddingBottom:"18px", marginBottom:"18px",
                borderBottom: idx<3 ? `1px solid ${C.inkFaint}` : "none",
              }}>
                <div style={{flexShrink:0,textAlign:"right",width:"32px"}}>
                  <div style={{fontSize:"18px",color:C.inkFaint,fontFamily:C.mono,lineHeight:1}}>{item.num}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"6px"}}>
                    <span style={{fontSize:"13px",letterSpacing:"0.2em",color:PC,fontFamily:C.mono,fontWeight:"bold"}}>{item.label}</span>
                    <span style={{fontSize:"11px",color:C.inkDim,fontFamily:C.serif}}>{item.sub}</span>
                  </div>
                  <div style={{fontSize:"12px",color:C.inkMid,fontFamily:C.serif,lineHeight:1.9}}>{item.text}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        {/* 右: Radar */}
        <div style={{ padding:"24px 20px", background:C.bg }}>
          <div style={{fontSize:"11px",letterSpacing:"0.3em",color:C.inkDim,fontFamily:C.mono,marginBottom:"20px"}}>PARAMETER</div>
          <OverviewRadar/>
        </div>
      </div>

      {/* 下段: DESIGN SCOPE (左) + SKILL MIX (右) */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"0" }}>
        {/* 左: Scope */}
        <div style={{ padding:"24px 32px", borderRight:`1px solid ${C.inkFaint}` }}>
          <FadeIn>
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px"}}>
              <div style={{fontSize:"11px",letterSpacing:"0.4em",color:C.ink,fontFamily:C.mono,fontWeight:"bold"}}>DESIGN SCOPE</div>
              <div style={{flex:1,height:"1px",background:C.inkFaint}}/>
              <div style={{fontSize:"11px",color:C.inkDim,fontFamily:C.mono}}>{SCOPE_ITEMS.length} ROLES</div>
            </div>
          </FadeIn>
          {SCOPE_ITEMS.map((item, i) => (
            <FadeIn key={i} delay={i*0.07}>
              <div style={{
                display:"flex", gap:"16px",
                paddingBottom:"16px", marginBottom:"16px",
                borderBottom: i<SCOPE_ITEMS.length-1 ? `1px solid ${C.inkFaint}` : "none",
              }}>
                <div style={{flexShrink:0,width:"32px",textAlign:"right"}}>
                  <div style={{fontSize:"18px",color:C.inkFaint,fontFamily:C.mono,lineHeight:1}}>{String(i+1).padStart(2,"0")}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"12px",letterSpacing:"0.15em",color:C.ink,fontFamily:C.mono,fontWeight:"bold",marginBottom:"6px"}}>{item.role}</div>
                  <div style={{fontSize:"11px",color:C.inkMid,fontFamily:C.serif,lineHeight:1.8}}>{item.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        {/* 右: Skill Mix */}
        <div style={{ padding:"24px 20px", background:C.bg }}>
          <div style={{fontSize:"11px",letterSpacing:"0.3em",color:C.inkDim,fontFamily:C.mono,marginBottom:"20px"}}>SKILL MIX</div>
          <ScopeBarChart/>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────
export default function CasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef  = useRef<HTMLDivElement>(null);

  const [currentPhase, setCurrentPhase] = useState(-1); // -1 = hero(before sticky)
  const [showOverview, setShowOverview] = useState(false);

  const stepIdx     = currentPhase < 0 ? 0 : Math.min(STEPS.length-1, Math.floor(currentPhase/PHASES_PER_STEP));
  const phaseInStep = currentPhase < 0 ? -1 : currentPhase % PHASES_PER_STEP;

  // text visible: phase 0+
  // image visible: phase 1+
  // diagram visible: phase 2+
  // eye: diagram表示から1秒後に自動表示
  const textVisible  = phaseInStep >= 0;
  const imgVisible   = phaseInStep >= 1;
  const diagVisible  = phaseInStep >= 2;
  const [eyeVisible, setEyeVisible] = useState(false);

  useEffect(() => {
    if (diagVisible) {
      const t = setTimeout(() => setEyeVisible(true), 1000);
      return () => clearTimeout(t);
    } else {
      setEyeVisible(false);
    }
  }, [diagVisible, stepIdx]);

  // ステップ切り替え時テキスト再アニメ
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
      const phase = Math.min(TOTAL_PHASES-1, Math.floor(scrolled/SCROLL_PER_PHASE));
      setCurrentPhase(phase);

      const ov = overviewRef.current;
      if (ov) setShowOverview(ov.getBoundingClientRect().top < window.innerHeight*0.5);
    };
    window.addEventListener("scroll", onScroll, {passive:true});
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDotClick = (i: number) => {
    if (i===6) { overviewRef.current?.scrollIntoView({behavior:"smooth",block:"start"}); return; }
    const el = containerRef.current;
    if (!el) return;
    const containerTop = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top: containerTop + i*PHASES_PER_STEP*SCROLL_PER_PHASE, behavior:"smooth"});
  };

  const dotActive   = showOverview ? 6 : stepIdx;
  const progress    = (stepIdx+1) / STEPS.length;
  const displayStep = STEPS[renderedStep];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:auto; }
        body { background:${C.bg}; overflow-x:hidden; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:200,
        height:`${NAV_H}px`,
        background:`${C.surface}f0`, backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${C.inkFaint}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:`0 clamp(48px,10vw,160px)`,
      }}>
        <a href="/cases" style={{fontSize:"11px",letterSpacing:"0.4em",color:C.inkDim,fontFamily:C.mono,textDecoration:"none"}}>← 号 / CASES</a>
        <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.3em",color:PC,fontFamily:C.mono}}>DISCOVERY</div>
          <div style={{fontSize:"10px",letterSpacing:"0.25em",color:C.inkDim,fontFamily:C.mono}}>2019</div>
        </div>
      </nav>

      {/* ── HERO（フルスクリーン、スクロールで上に流れる） ── */}
      <section style={{
        minHeight:"100vh",
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:`calc(${NAV_H}px + 10vh) clamp(48px,10vw,160px) 10vh`,
        background:C.bg,
        borderBottom:`1px solid ${C.inkFaint}`,
        position:"relative", overflow:"hidden",
      }}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.035,pointerEvents:"none"}}>
          <defs><pattern id="bg-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={C.ink} strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)"/>
        </svg>
        <div style={{maxWidth:"700px",position:"relative",animation:"fadeUp 0.9s ease both"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px"}}>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:PC,animation:"pulse 2.2s ease infinite"}}/>
            <span style={{fontSize:"10px",letterSpacing:"0.5em",color:PC,fontFamily:C.mono}}>CASE 01</span>
            <span style={{fontSize:"10px",letterSpacing:"0.2em",color:C.inkDim,fontFamily:C.mono}}>— 2019</span>
          </div>
          <h1 style={{fontSize:"clamp(24px,4vw,52px)",color:C.ink,fontFamily:C.serif,lineHeight:1.3,letterSpacing:"0.02em",marginBottom:"20px",whiteSpace:"pre-line"}}>
            {"朝の10分を解放する\n「温度」のビジネスアーキテクチャ"}
          </h1>
          <p style={{fontSize:"clamp(13px,1.5vw,16px)",color:C.inkMid,fontFamily:C.serif,lineHeight:1.9,letterSpacing:"0.04em",maxWidth:"500px",marginBottom:"32px"}}>
            「ノベルティを作ってほしい」という依頼が、事業構造の再設計になった。
          </p>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {["医療","Discovery","組織設計","新規事業"].map(t=>(
              <span key={t} style={{fontSize:"10px",color:C.inkDim,padding:"3px 10px",border:`1px solid ${C.inkFaint}`,fontFamily:C.mono,letterSpacing:"0.15em"}}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{position:"absolute",bottom:"28px",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",animation:"fadeUp 1s ease 0.6s both"}}>
          <div style={{fontSize:"9px",letterSpacing:"0.45em",color:C.inkFaint,fontFamily:C.mono}}>SCROLL</div>
          <div style={{width:"1px",height:"36px",background:`linear-gradient(180deg, ${PC}70, transparent)`,animation:"bounce 1.9s ease infinite"}}/>
        </div>
      </section>

      {/* ── THUMBNAIL BAR（sticky, NAV直下に常駐） ── */}
      <div style={{
        position:"sticky", top:`${NAV_H}px`, zIndex:150,
        height:`${THUMB_H}px`,
        background:C.bg,
        borderBottom:`1px solid ${C.inkFaint}`,
        borderLeft:`4px solid ${PC}`,
        display:"flex", alignItems:"center",
        padding:`0 clamp(48px,10vw,160px)`,
        gap:"clamp(16px,3vw,40px)",
      }}>
        {/* ケース情報 */}
        <div style={{flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
            <div style={{width:"6px",height:"6px",borderRadius:"50%",background:PC,animation:"pulse 2.2s ease infinite"}}/>
            <span style={{fontSize:"10px",letterSpacing:"0.4em",color:PC,fontFamily:C.mono}}>CASE 01</span>
          </div>
          <div style={{fontSize:"clamp(12px,1.5vw,17px)",color:C.ink,fontFamily:C.serif,lineHeight:1.25,letterSpacing:"0.02em",maxWidth:"clamp(200px,28vw,360px)"}}>
            朝の10分を解放する「温度」のビジネスアーキテクチャ
          </div>
        </div>
        <div style={{width:"1px",height:"40px",background:C.inkFaint,flexShrink:0}}/>
        {/* ドットナビ */}
        <div style={{flex:1,overflow:"hidden"}}>
          <div style={{fontSize:"8px",letterSpacing:"0.3em",color:C.inkDim,fontFamily:C.mono,marginBottom:"8px"}}>
            {DOT_LABELS[dotActive]}
          </div>
          <DotNav active={dotActive} onDotClick={handleDotClick}/>
        </div>
        {/* カウンター */}
        <div style={{flexShrink:0,fontSize:"11px",letterSpacing:"0.2em",color:PC,fontFamily:C.mono,display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{width:"48px",height:"2px",background:C.inkFaint,borderRadius:"1px",overflow:"hidden"}}>
            <div style={{height:"100%",background:PC,width:`${progress*100}%`,transition:"width 0.4s ease"}}/>
          </div>
          {showOverview ? "07/07" : `${String(stepIdx+1).padStart(2,"0")} / 0${STEPS.length}`}
        </div>
      </div>

      {/* ── SCROLLYTELLING ── */}
      <div ref={containerRef} style={{ position:"relative", height:`${TOTAL_PHASES*SCROLL_PER_PHASE+600}px` }}>
        <div style={{
          position:"sticky",
          top:`${NAV_H+THUMB_H}px`,
          height:`calc(100vh - ${NAV_H+THUMB_H}px)`,
          background:C.surface,
          display:"flex", flexDirection:"column",
          overflow:"hidden",
        }}>
          {/* Progress bar */}
          <div style={{height:"2px",background:C.inkFaint,flexShrink:0}}>
            <div style={{height:"100%",background:PC,width:`${progress*100}%`,transition:"width 0.45s cubic-bezier(0.16,1,0.3,1)",boxShadow:`0 0 8px ${PC}50`}}/>
          </div>

          {/* コンテンツエリア */}
          <div style={{
            flex:1, minHeight:0,
            padding:"clamp(20px,3.5vh,44px) clamp(48px,10vw,160px)",
            display:"flex", flexDirection:"column",
            gap:"clamp(10px,1.5vh,18px)",
            overflow:"hidden",
          }}>
            {/* ステップラベル */}
            <div style={{display:"flex",alignItems:"center",gap:"12px",flexShrink:0,opacity:textIn?1:0,transition:"opacity 0.35s ease"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",border:`1px solid ${PC}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:PC,fontFamily:C.mono,flexShrink:0}}>
                {String(displayStep.index).padStart(2,"0")}
              </div>
              <div>
                <div style={{fontSize:"9px",letterSpacing:"0.4em",color:PC,fontFamily:C.mono,opacity:0.8}}>{displayStep.en}</div>
                <div style={{fontSize:"13px",color:C.ink,fontFamily:C.serif,letterSpacing:"0.04em"}}>{displayStep.label}</div>
              </div>
            </div>

            {/* テキスト + 右カラム(画像+図) */}
            <div style={{flex:1,minHeight:0,display:"flex",gap:"clamp(24px,4vw,56px)",alignItems:"flex-start",overflow:"hidden"}}>
              {/* テキスト + EYE縦並び */}
              <div style={{flex:"1 1 auto",minWidth:0,paddingTop:"4px",display:"flex",flexDirection:"column",gap:"clamp(10px,1.5vh,16px)"}}>
                <TextLines lines={displayStep.lines} visible={textIn}/>
                {/* ARCHITECT'S EYE: テキストの直下 */}
                <ArchitectsEye text={displayStep.eye} visible={eyeVisible}/>
              </div>

              {/* 右: 画像 + 図 縦並び */}
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:"12px",alignItems:"flex-end"}}>
                <PlaceholderImg label={displayStep.diagramLabel} visible={imgVisible}/>
                <div style={{width:"130px",height:"130px",opacity:diagVisible?1:0,transform:diagVisible?"translateY(0)":"translateY(16px)",transition:"opacity 0.55s ease, transform 0.6s ease"}}>
                  <Diagram type={displayStep.diagramType} visible={diagVisible}/>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{padding:`8px clamp(48px,10vw,160px)`,borderTop:`1px solid ${C.inkFaint}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bg,flexShrink:0}}>
            <div style={{fontSize:"12px",color:C.inkMid,fontFamily:C.serif,fontStyle:"italic"}}>{displayStep.label}</div>
            <div style={{fontSize:"9px",letterSpacing:"0.2em",color:C.inkFaint,fontFamily:C.mono,animation:"bounce 1.7s ease infinite"}}>↓ scroll</div>
          </div>
        </div>
      </div>

      {/* ── PROJECT OVERVIEW ── */}
      <div ref={overviewRef}>
        <ProjectOverview/>
      </div>

      {/* ── Footer ── */}
      <div style={{padding:"clamp(40px,6vh,80px) clamp(48px,10vw,160px)",background:C.bg,borderTop:`1px solid ${C.inkFaint}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:"11px",letterSpacing:"0.3em",color:C.inkDim,fontFamily:C.mono}}>CASE 01 — 2019</div>
        <a href="/cases"
          style={{display:"inline-flex",alignItems:"center",gap:"10px",fontSize:"11px",letterSpacing:"0.35em",color:PC,fontFamily:C.mono,textDecoration:"none",padding:"11px 26px",border:`1px solid ${PC}40`,transition:"border-color 0.25s ease"}}
          onMouseEnter={e=>(e.currentTarget.style.borderColor=PC)}
          onMouseLeave={e=>(e.currentTarget.style.borderColor=`${PC}40`)}
        >
          ← すべてのケースへ
        </a>
      </div>
    </>
  );
}
