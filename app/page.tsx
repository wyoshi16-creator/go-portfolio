// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CASES, STORY_TYPE_LABELS } from "@/lib/cases-data";

// ============================================================
// DESIGN TOKENS
// ============================================================
const C = {
  bg: "#f0f4f8",         // ブルーグレー系オフホワイト
  ink: "#0f1f2e",        // ディープネイビー
  inkMid: "#3a5470",     // ミッドブルー
  inkDim: "#7a9ab5",     // ライトブルーグレー
  inkFaint: "#c8daea",   // 薄いブルー
  surface: "#f7fafd",    // ほぼ白・青み
  surfaceAlt: "#e2edf5", // ライトブルー
  accent: "#1a6fc4",     // ビビッドブルー
  accentLight: "#ddeeff",
  mono: "'JetBrains Mono','Courier New',monospace",
  serif: "'Georgia','Times New Roman',serif",
};

// ============================================================
// PHASES
// ============================================================
const PHASES = [
  { id: "discovery",  label: "Discovery",  sub: "課題の発見",   color: "#4a7c59" },
  { id: "definition", label: "Definition", sub: "構造の設計",   color: "#2d6a9f" },
  { id: "design",     label: "Design",     sub: "解の具体化",   color: "#7a3b9e" },
  { id: "delivery",   label: "Delivery",   sub: "実装と検証",   color: "#b8740a" },
  { id: "growth",     label: "Growth",     sub: "拡大と最適化", color: "#8b1a1a" },
];

// ── スクロールによるフェードイン用hook ──
function useInView(ref, threshold = 0.2, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}

// ── パフォーマンス: 画面外でrAFを停止する共通Canvas hook ──
function useVisibleCanvas(canvasRef, drawFn) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId = null, t = 0, visible = false;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      if (!visible) { animId = null; return; }
      drawFn(ctx, canvas.width, canvas.height, t);
      t += 0.02;
      animId = requestAnimationFrame(loop);
    };
    const obs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !animId) animId = requestAnimationFrame(loop);
    }, { threshold: 0.01 });
    obs.observe(canvas);
    return () => {
      if (animId) cancelAnimationFrame(animId);
      obs.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);
}

// ── パフォーマンス: パーティクル生成（30粒子に削減・共通化）──
function makeParticles(n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004,
    r: Math.random() * 2 + 1, phase: Math.random() * Math.PI * 2,
    type: i < n / 2 ? "design" : "system",
  }));
}

// ── パフォーマンス: パーティクル描画（共通）30粒子×O(n²)=435回 ──
function drawParticleFrame(ctx, W, H, t, particles) {
  const lgD = ctx.createRadialGradient(W*0.25,H*0.5,0,W*0.25,H*0.5,W*0.4);
  lgD.addColorStop(0,"rgba(26,111,196,0.10)"); lgD.addColorStop(1,"rgba(26,111,196,0)");
  ctx.fillStyle=lgD; ctx.fillRect(0,0,W,H);
  const lgS = ctx.createRadialGradient(W*0.75,H*0.5,0,W*0.75,H*0.5,W*0.4);
  lgS.addColorStop(0,"rgba(15,31,46,0.08)"); lgS.addColorStop(1,"rgba(15,31,46,0)");
  ctx.fillStyle=lgS; ctx.fillRect(0,0,W,H);
  const lgC = ctx.createLinearGradient(W*0.4,0,W*0.6,0);
  lgC.addColorStop(0,"rgba(26,111,196,0)");
  lgC.addColorStop(0.5,`rgba(26,111,196,${0.06+Math.sin(t*0.8)*0.03})`);
  lgC.addColorStop(1,"rgba(26,111,196,0)");
  ctx.fillStyle=lgC; ctx.fillRect(0,0,W,H);
  particles.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1;
  });
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j];
      const dx=(a.x-b.x)*W,dy=(a.y-b.y)*H,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<130){
        ctx.strokeStyle=a.type===b.type?`rgba(26,111,196,${(1-dist/130)*0.12})`:`rgba(58,84,112,${(1-dist/130)*0.08})`;
        ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke();
      }
    }
  }
  particles.forEach(p=>{
    const pulse=Math.sin(t*1.5+p.phase)*0.5+0.5;
    ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r*(1+pulse*0.5),0,Math.PI*2);
    ctx.fillStyle=p.type==="design"?`rgba(26,111,196,${0.28+pulse*0.35})`:`rgba(15,31,46,${0.18+pulse*0.28})`;
    ctx.fill();
  });
}

function Typewriter({ text, speed = 22, onDone, style = {} }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [text]);
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => setIdx(i => i + 1), speed);
      return () => clearTimeout(t);
    } else if (onDone) onDone();
  }, [idx, text, speed, onDone]);
  return (
    <span style={style}>
      {text.slice(0, idx)}
      {idx < text.length && <span style={{ animation: "blink 0.7s step-end infinite", color: C.accent }}>_</span>}
    </span>
  );
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function PlaceholderImage({ delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.1, "0px 0px -60px 0px");
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(36px) scale(0.98)",
      transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
      marginTop: "24px", marginBottom: "8px",
      aspectRatio: "16/10", maxWidth: "100%", background: "linear-gradient(135deg, #e8ecf0 0%, #dde2e8 100%)",
      border: "2px dashed rgba(0,0,0,0.12)", borderRadius: "8px",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(0,0,0,0.25)", fontFamily: C.mono }}>IMAGE</span>
    </div>
  );
}

// ── Overview パラメーターレーダーグラフ（SVG手書き風） ──
function OverviewRadar({ caseId, phaseColor }) {
  const ref = useRef(null);
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
  const pts = (scale) => params.map((p, i) => ({
    x: cx + Math.cos(angles[i]) * r * p.value * scale,
    y: cy + Math.sin(angles[i]) * r * p.value * scale,
  }));
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const toPath = (points) => points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* グリッド */}
        {gridLevels.map((lv, gi) => (
          <polygon key={gi} points={angles.map(a => `${(cx + Math.cos(a) * r * lv).toFixed(1)},${(cy + Math.sin(a) * r * lv).toFixed(1)}`).join(" ")}
            fill="none" stroke={C.inkFaint} strokeWidth="0.8" opacity="0.6" />
        ))}
        {/* 軸線 */}
        {angles.map((a, i) => (
          <line key={i} x1={cx} y1={cy} x2={(cx + Math.cos(a) * r).toFixed(1)} y2={(cy + Math.sin(a) * r).toFixed(1)} stroke={C.inkFaint} strokeWidth="0.8" opacity="0.5" />
        ))}
        {/* データポリゴン */}
        <path d={toPath(pts(inView ? 1 : 0))} fill={phaseColor} fillOpacity="0.18" stroke={phaseColor} strokeWidth="1.5"
          style={{ transition: "d 1s cubic-bezier(0.16,1,0.3,1)", transitionDelay: "2.2s" }} />
        {/* データ点 */}
        {pts(inView ? 1 : 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={phaseColor} opacity={inView ? 0.8 : 0} style={{ transition: `opacity 0.4s ease ${2.4 + i * 0.08}s` }} />
        ))}
        {/* ラベル */}
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
      {/* 凡例 */}
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

// ── DESIGN SCOPE スキルミックス棒グラフ ──
function ScopeBarChart({ caseId, phaseColor }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.2);
  const skills = caseId === 1
    ? [
        { label: "構造設計", pct: 35, color: phaseColor },
        { label: "BizDev", pct: 25, color: "#2d6a9f" },
        { label: "PdM", pct: 18, color: "#7a3b9e" },
        { label: "UX設計", pct: 12, color: "#b8740a" },
        { label: "調査", pct: 10, color: "#4a7c59" },
      ]
    : [
        { label: "構造設計", pct: 30, color: phaseColor },
        { label: "BizDev", pct: 28, color: "#2d6a9f" },
        { label: "組織設計", pct: 22, color: "#7a3b9e" },
        { label: "PdM", pct: 12, color: "#b8740a" },
        { label: "調査", pct: 8, color: "#4a7c59" },
      ];
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
              transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${2.1 + i * 0.12}s`,
            }} />
          </div>
        </div>
      ))}
      {/* 積み上げ帯 */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: "monospace", marginBottom: "6px" }}>SKILL DISTRIBUTION</div>
        <div style={{ display: "flex", height: "12px", borderRadius: "2px", overflow: "hidden" }}>
          {skills.map((s, i) => (
            <div key={i} style={{
              width: inView ? `${s.pct}%` : "0%", background: s.color, height: "100%",
              transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${2.4 + i * 0.08}s`,
            }} title={`${s.label}: ${s.pct}%`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaceholderDiagram({ delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.1, "0px 0px -60px 0px");
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      marginTop: "20px", marginBottom: "8px", padding: "24px",
      background: "linear-gradient(180deg, #f5f7fa 0%, #eef1f5 100%)", borderRadius: "8px",
      border: "1px solid rgba(0,0,0,0.06)",
    }}>
      <svg width="100%" height="120" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <path d="M40 60 L100 60 L100 30 L160 30" stroke={C.accent} strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
        <path d="M100 60 L100 90 L160 90" stroke={C.inkFaint} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
        <circle cx="40" cy="60" r="14" fill={C.accent} fillOpacity="0.2" stroke={C.accent} strokeWidth="2" />
        <circle cx="100" cy="60" r="14" fill={C.accent} fillOpacity="0.15" stroke={C.accent} strokeWidth="1.5" />
        <circle cx="100" cy="30" r="12" fill={C.inkMid} fillOpacity="0.2" stroke={C.inkMid} strokeWidth="1.5" />
        <circle cx="100" cy="90" r="12" fill={C.inkDim} fillOpacity="0.2" stroke={C.inkDim} strokeWidth="1.5" />
        <circle cx="160" cy="30" r="14" fill={C.accent} fillOpacity="0.25" stroke={C.accent} strokeWidth="2" />
        <circle cx="160" cy="90" r="14" fill={C.inkMid} fillOpacity="0.2" stroke={C.inkMid} strokeWidth="1.5" />
      </svg>
      <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, marginTop: "8px", textAlign: "center" }}>DIAGRAM</div>
    </div>
  );
}

function PhasePipeline({ activePhase, subPhases = [], vertical = false }) {
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

// ============================================================
// PAGE 1 COMPONENTS
// ============================================================
function ContactForm({ diagnosisInput, onSent }) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(null);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true); setErr(null);
    try {
      const body = `差出人: ${name || "未記入"}\nメール: ${email || "未記入"}\n\n診断した課題:\n${diagnosisInput}\n\n問い・メッセージ:\n${message}`;
      await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `メール送信アシスタント。以下の内容をGmailで yoshi.wada.work@gmail.com 宛に送信してください。件名:「【事業診断からのご連絡】${name || "匿名"}様より」。必ずGmailのsend_emailツールを使って実際に送信してください。`,
          messages: [{ role: "user", content: body }],
          mcp_servers: [{ type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail-mcp" }],
        }),
      });
      setSent(true);
      if (onSent) setTimeout(onSent, 2000);
    } catch (e) {
      setErr("送信に失敗しました。直接 yoshi.wada.work@gmail.com までご連絡ください。");
    }
    setSending(false);
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "32px 0", animation: "fadeUp 0.5s ease" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <span style={{ color: C.bg, fontSize: "16px" }}>✓</span>
      </div>
      <div style={{ fontSize: "14px", color: C.ink, fontFamily: C.serif, marginBottom: "6px" }}>メッセージを受け取りました。</div>
      <div style={{ fontSize: "11px", color: C.inkDim, letterSpacing: "0.2em", fontFamily: C.mono }}>48時間以内にご連絡いたします。</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {diagnosisInput && (
        <div style={{ padding: "12px 16px", background: C.accentLight, borderLeft: `3px solid ${C.accent}`, marginBottom: "18px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.accent, fontFamily: C.mono, marginBottom: "3px" }}>診断した課題</div>
          <div style={{ fontSize: "11px", color: C.ink, fontFamily: C.serif, lineHeight: 1.7 }}>{diagnosisInput}</div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        {[["お名前（任意）", name, setName, "山田 太郎"], ["メール（任意）", email, setEmail, "your@email.com"]].map(([label, val, set, ph]) => (
          <div key={label}>
            <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "5px" }}>{label}</div>
            <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
              style={{ width: "100%", background: C.surface, border: `1px solid ${C.inkFaint}`, borderTop: `2px solid ${C.ink}`, padding: "9px 12px", color: C.ink, fontSize: "12px", fontFamily: C.serif, boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder="詳しい状況、聞いてみたいこと、一緒に解きたいことを自由にご記入ください。"
        rows={4}
        style={{ width: "100%", background: C.surface, border: `1px solid ${C.inkFaint}`, borderTop: `2px solid ${C.ink}`, padding: "12px 14px", color: C.ink, fontSize: "12px", fontFamily: C.serif, lineHeight: 1.8, resize: "none", boxSizing: "border-box", marginBottom: "12px" }} />
      {err && <div style={{ fontSize: "11px", color: C.accent, marginBottom: "10px" }}>{err}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSend} disabled={!message.trim() || sending} style={{
          background: message.trim() && !sending ? C.ink : C.surfaceAlt,
          border: "none", color: message.trim() && !sending ? C.bg : C.inkDim,
          padding: "10px 28px", fontSize: "11px", letterSpacing: "0.4em",
          cursor: message.trim() && !sending ? "pointer" : "default", fontFamily: C.mono,
        }}>
          {sending ? "送信中..." : "SEND →"}
        </button>
      </div>
    </div>
  );
}

// ── Page1 動的フェーズ工程表パネル ──
function PhaseMethodologyPanel({ animPhase }) {
  const [selected, setSelected] = useState("discovery");
  const ph = PHASES.find(p => p.id === selected);

  const details = {
    discovery:  {
      question: "何が本当の問いか？",
      desc: "依頼された問いを解く前に、問いそのものを疑う。「表面の症状」と「構造的原因」を分離し、解くべき問いを再設計する。",
      tools: ["行動観察", "ステークホルダーマップ", "5 Whys", "問い設定WS"],
      output: "問いの再定義",
      deliverable: "課題構造マップ / 問いの再設計書",
      expertise: [
        { skill: "構造発見", pct: 90 },
        { skill: "調査設計", pct: 75 },
        { skill: "仮説構築", pct: 80 },
      ],
    },
    definition: {
      question: "どう解くべきか？",
      desc: "問いが定まったら、解法の「骨格」を設計する。誰が・何を・どう提供するかの構造を確定させる。ここが曖昧なまま進むと後続のすべてが歪む。",
      tools: ["バリューチェーン分析", "ビジネスモデルキャンバス", "制約理論", "OKR設計"],
      output: "事業の骨格設計",
      deliverable: "ビジネスモデル図 / 構造設計書",
      expertise: [
        { skill: "構造設計", pct: 95 },
        { skill: "BizDev", pct: 70 },
        { skill: "システム思考", pct: 85 },
      ],
    },
    design: {
      question: "何を作るか？",
      desc: "骨格を具体的な形に落とす。完璧なものよりも、仮説を検証できるものを優先する。プロダクト・サービス・UXの具体化フェーズ。",
      tools: ["ジョブ理論", "プロトタイピング", "ユーザーテスト", "MVP設計"],
      output: "検証済み仮説",
      deliverable: "MVP仕様書 / UX設計書 / プロトタイプ",
      expertise: [
        { skill: "PdM", pct: 80 },
        { skill: "UX設計", pct: 70 },
        { skill: "仮説検証", pct: 85 },
      ],
    },
    delivery: {
      question: "どう届けるか？",
      desc: "設計を市場に投入する。重要なのは速度より「意思決定の質」。組織・オペレーション・計測の3軸を同時に動かす。",
      tools: ["スクラム", "OKR実行管理", "データ計測設計", "組織権限設計"],
      output: "動く事業",
      deliverable: "実装ロードマップ / 計測ダッシュボード",
      expertise: [
        { skill: "実行設計", pct: 75 },
        { skill: "組織設計", pct: 70 },
        { skill: "計測設計", pct: 65 },
      ],
    },
    growth: {
      question: "次の問いは何か？",
      desc: "事業が動き始めたら、次の問いを見つける。スケールの設計・隣接市場への展開・「自律する事業機械」としての完成形を描く。",
      tools: ["プラットフォーム設計", "LTV最適化", "隣接市場分析", "次の問い設定"],
      output: "自律する事業機械",
      deliverable: "グロース戦略書 / スケールロードマップ",
      expertise: [
        { skill: "戦略設計", pct: 85 },
        { skill: "グロース", pct: 80 },
        { skill: "LTV設計", pct: 70 },
      ],
    },
  };

  const d = details[selected];

  return (
    <div>
      {/* フェーズ選択バー（横並び・クリック可能） */}
      <div style={{ display: "flex", gap: "0", marginBottom: "0", borderBottom: `2px solid ${C.ink}` }}>
        {PHASES.map((p, idx) => {
          const isSelected = selected === p.id;
          const isAnim = animPhase === p.id;
          return (
            <button key={p.id} onClick={() => setSelected(p.id)} style={{
              flex: 1, padding: "12px 4px 10px",
              background: isSelected ? p.color : isAnim ? `${p.color}20` : C.surface,
              border: "none", borderRight: idx < PHASES.length - 1 ? `1px solid ${C.inkFaint}` : "none",
              cursor: "pointer", transition: "background 0.25s",
              position: "relative",
            }}>
              {isSelected && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: p.color }} />}
              <div style={{ fontSize: "11px", letterSpacing: "0.1em", color: isSelected ? "#fff" : C.inkMid, fontFamily: "'JetBrains Mono','Courier New',monospace", fontWeight: isSelected ? "bold" : "normal", transition: "color 0.2s" }}>
                {p.label.toUpperCase()}
              </div>
              <div style={{ fontSize: "11px", color: isSelected ? "rgba(255,255,255,0.75)" : C.inkDim, fontFamily: "'Georgia','Times New Roman',serif", marginTop: "2px", transition: "color 0.2s" }}>
                {p.sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* 詳細パネル */}
      {ph && d && (
        <div key={selected} style={{ background: C.surface, border: `1px solid ${C.inkFaint}`, borderTop: "none", animation: "fadeUp 0.28s ease" }}>
          {/* ヘッダー行 */}
          <div style={{ borderLeft: `4px solid ${ph.color}`, padding: "14px 18px", borderBottom: `1px solid ${C.inkFaint}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: ph.color, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "4px" }}>{ph.label.toUpperCase()} — {ph.sub}</div>
              <div style={{ fontSize: "14px", color: C.ink, fontFamily: "'Georgia','Times New Roman',serif", lineHeight: 1.6 }}>{d.desc}</div>
            </div>
            <div style={{ flexShrink: 0, padding: "6px 12px", background: `${ph.color}12`, border: `1px solid ${ph.color}30`, textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: ph.color, fontFamily: "'JetBrains Mono','Courier New',monospace", letterSpacing: "0.15em", marginBottom: "2px" }}>KEY QUESTION</div>
              <div style={{ fontSize: "12px", color: C.ink, fontFamily: "'Georgia','Times New Roman',serif" }}>{d.question}</div>
            </div>
          </div>

          {/* 3カラム：Tools / Expertise比率 / Output */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
            {/* Tools */}
            <div style={{ padding: "14px 16px", borderRight: `1px solid ${C.inkFaint}` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "10px" }}>TOOLS</div>
              {d.tools.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: ph.color, flexShrink: 0 }} />
                  <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "'Georgia','Times New Roman',serif" }}>{t}</div>
                </div>
              ))}
            </div>

            {/* Expertise比率 */}
            <div style={{ padding: "14px 16px", borderRight: `1px solid ${C.inkFaint}` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "10px" }}>MY EXPERTISE</div>
              {d.expertise.map((e, i) => (
                <div key={i} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                    <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "'Georgia','Times New Roman',serif" }}>{e.skill}</div>
                    <div style={{ fontSize: "11px", color: ph.color, fontFamily: "'JetBrains Mono','Courier New',monospace" }}>{e.pct}%</div>
                  </div>
                  <div style={{ height: "4px", background: C.surfaceAlt, borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${e.pct}%`, background: ph.color, borderRadius: "2px", transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Output */}
            <div style={{ padding: "14px 16px", background: `${ph.color}06` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: ph.color, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "10px" }}>OUTPUT</div>
              <div style={{ fontSize: "16px", color: C.ink, fontFamily: "'Georgia','Times New Roman',serif", lineHeight: 1.4, marginBottom: "10px" }}>{d.output}</div>
              <div style={{ borderTop: `1px solid ${ph.color}20`, paddingTop: "10px" }}>
                <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "4px" }}>DELIVERABLE</div>
                <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "'Georgia','Times New Roman',serif", lineHeight: 1.7 }}>{d.deliverable}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapSection({ onGoToPortfolio }) {
  const [activeId, setActiveId] = useState("discovery");
  const ph = PHASES.find(p => p.id === activeId);
  const roadmapData = {
    discovery:  { question: "何が本当の問いか？", tools: ["行動観察", "ステークホルダーマップ", "5 Whys", "問い設定WS"], output: "問いの再定義", desc: "表面の依頼と本当の問いは違う。解くべき問いはこれで正しいか？を疑うことから始める。" },
    definition: { question: "どう解くべきか？",   tools: ["バリューチェーン分析", "ビジネスモデルキャンバス", "制約理論", "OKR設計"], output: "事業の骨格設計", desc: "問いが定まったら解法の構造を設計する。ここが曖昧なまま進むと後続のすべてが歪む。" },
    design:     { question: "何を作るか？",       tools: ["ジョブ理論", "プロトタイピング", "ユーザーテスト", "MVP設計"], output: "検証済み仮説", desc: "骨格を具体的な形に落とす。完璧なものより仮説を検証できるものを優先する。" },
    delivery:   { question: "どう届けるか？",     tools: ["スクラム", "OKR実行管理", "データ計測設計", "組織権限設計"], output: "動く事業", desc: "設計を市場に投入する。重要なのは速度より意思決定の質。" },
    growth:     { question: "次の問いは何か？",   tools: ["プラットフォーム設計", "LTV最適化", "隣接市場分析", "次の問い設定"], output: "自律する事業機械", desc: "事業が動き始めたら次の問いを見つける。自律化が本質だ。" },
  };
  const data = roadmapData[activeId];

  return (
    <div>
      <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.inkDim, fontFamily: C.mono, marginBottom: "16px" }}>
        C — 地図を手に入れる
      </div>
      <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif, marginBottom: "20px", lineHeight: 1.7 }}>
        事業設計の5フェーズ工程表。
      </div>
      <div style={{ display: "flex", gap: "1px", background: C.inkFaint, marginBottom: "18px" }}>
        {PHASES.map(p => (
          <button key={p.id} onClick={() => setActiveId(p.id)} style={{
            flex: 1, padding: "10px 2px", background: activeId === p.id ? p.color : C.surface,
            border: "none", cursor: "pointer", transition: "background 0.2s",
          }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: activeId === p.id ? "#fff" : C.inkDim, fontFamily: C.mono }}>
              {p.label.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
      {ph && data && (
        <div key={activeId} style={{ animation: "fadeUp 0.3s ease" }}>
          <div style={{ padding: "18px 20px", background: C.surface, border: `1px solid ${C.inkFaint}`, borderLeft: `4px solid ${ph.color}`, marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "16px", color: ph.color, fontFamily: C.serif }}>{ph.label}</div>
              <div style={{ fontSize: "11px", color: ph.color, fontFamily: C.serif, padding: "4px 10px", background: `${ph.color}12`, border: `1px solid ${ph.color}30` }}>{data.question}</div>
            </div>
            <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.8 }}>{data.desc}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div style={{ padding: "14px 16px", background: C.surfaceAlt, border: `1px solid ${C.inkFaint}` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>TOOLS</div>
              {data.tools.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "5px" }}>
                  <div style={{ width: "3px", height: "3px", borderRadius: "50%", background: ph.color, flexShrink: 0 }} />
                  <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif }}>{t}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", background: `${ph.color}08`, border: `1px solid ${ph.color}25` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: ph.color, fontFamily: C.mono, marginBottom: "8px" }}>OUTPUT</div>
              <div style={{ fontSize: "13px", color: C.ink, fontFamily: C.serif, lineHeight: 1.6 }}>{data.output}</div>
            </div>
          </div>
        </div>
      )}
      <div style={{ borderTop: `1px solid ${C.inkFaint}`, paddingTop: "16px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onGoToPortfolio} style={{
          background: C.ink, border: "none", color: C.bg,
          padding: "11px 24px", fontSize: "11px", letterSpacing: "0.35em",
          cursor: "pointer", fontFamily: C.mono,
        }}>
          和田 祥明を知る →
        </button>
      </div>
    </div>
  );
}

function DiagnosisPage({ onGoToPortfolio }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [animPhase, setAnimPhase] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const [ctaMode, setCtaMode] = useState(null); // null | "chat" | "roadmap"
  const MAX = 50;

  const EXAMPLES = [
    "新機能をリリースしても売上が変わらない",
    "チームはがんばっているのに成果が出ない",
    "顧客インタビューをしても何を作ればいいかわからない",
    "PMF前後でやることが変わって組織が混乱している",
  ];

  const MAX_CHARS = 300;
  const MIN_CHARS = 15;

  // イタズラ防止バリデーション
  const validateInput = (text) => {
    const t = text.trim();
    if (t.length < MIN_CHARS) return `${MIN_CHARS}文字以上入力してください（現在${t.length}文字）`;
    if (t.length > MAX_CHARS) return `${MAX_CHARS}文字以内で入力してください`;
    // 同一文字の繰り返し（aaaa...）
    if (/(.)\1{9,}/.test(t)) return "有効な内容を入力してください";
    // URLっぽい文字列
    if (/https?:\/\//.test(t)) return "URLは入力できません";
    // 英数字のみ（日本語が全くない場合も警告）
    const jpChars = t.match(/[\u3040-\u30ff\u3400-\u9fff]/g);
    if (!jpChars || jpChars.length < 3) return "日本語で事業課題を入力してください";
    return null;
  };

  const handleDiagnose = async () => {
    if (!input.trim() || loading) return;
    if (requestCount >= MAX) { setError("本日の診断上限に達しました。"); return; }
    const validationError = validateInput(input);
    if (validationError) { setError(validationError); return; }
    setLoading(true); setResult(null); setError(null);
    const phaseIds = PHASES.map(p => p.id);
    let i = 0;
    const interval = setInterval(() => { setAnimPhase(phaseIds[i % phaseIds.length]); i++; }, 300);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        clearInterval(interval); setAnimPhase(null);
        setError(data?.error || "解析に失敗しました。もう一度お試しください。");
        setLoading(false);
        return;
      }
      clearInterval(interval); setAnimPhase(null);
      setResult(data); setRequestCount(c => c + 1);
    } catch (e) {
      clearInterval(interval); setAnimPhase(null);
      setError("解析に失敗しました。もう一度お試しください。");
    }
    setLoading(false);
  };

  const phase = result ? PHASES.find(p => p.id === result.phase) : null;
  const subPhases = result ? (result.sub_phases || []).filter(id => id !== result.phase) : [];

  const [showInsight, setShowInsight] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (!result) { setShowInsight(false); setShowQ(false); setShowAction(false); setShowCTA(false); setCtaMode(null); }
  }, [result]);

  return (
    <div style={{ background: C.surface, minHeight: "100vh", fontFamily: C.mono, color: C.ink }}>
      {/* ── TOP BAR ── */}
      <div style={{ height: "3px", background: C.ink }} />
      <div style={{ height: "2px", background: `linear-gradient(90deg, ${C.accent}, ${C.accent}80, transparent)` }} />
      <div style={{ borderBottom: `1px solid ${C.inkFaint}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.accent, padding: "4px 10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "white", animation: "pulse 1.5s ease infinite" }} />
            <span style={{ fontSize: "10px", letterSpacing: "0.4em", color: "white", fontFamily: C.mono }}>AI</span>
          </div>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.5em", color: C.inkDim, marginBottom: "2px" }}>BUSINESS STRUCTURE DIAGNOSTIC</div>
            <div style={{ fontSize: "18px", color: C.ink, fontFamily: C.serif, letterSpacing: "0.04em", lineHeight: 1 }}>事業の詰まりを、構造で読む。</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim }}>Yoshi Wada / Business Designer</div>
          <div style={{ fontSize: "11px", color: C.inkFaint, marginTop: "2px" }}>{MAX - requestCount} diagnoses remaining</div>
        </div>
      </div>

      {/* ── SUB HERO ── */}
      <div style={{ borderBottom: `1px solid ${C.inkFaint}`, padding: "36px 32px 32px", background: C.surface }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "clamp(17px,2.2vw,24px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.6, letterSpacing: "0.04em", marginBottom: "16px", animation: "fadeUp 0.7s ease" }}>
                あなたの事業の問いは、<br />正しく設定されていますか？
              </div>
              <div style={{ borderLeft: `2px solid ${C.accent}`, paddingLeft: "14px" }}>
                {["症状を語るのではなく、", "構造を読む。", "問いを再設計する。"].map((l, i) => (
                  <div key={i} style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9, animation: `fadeUp 0.6s ease ${0.2 + i * 0.1}s both` }}>{l}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeUp 0.8s ease 0.3s both" }}>
              {[
                { label: "問いの再設計", desc: "依頼された問いを解く前に、問いそのものを疑う" },
                { label: "構造の可視化", desc: "5フェーズで事業のボトルネックを特定する" },
                { label: "次の一手", desc: "抽象的な診断ではなく、行動可能な形で返す" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.accent, flexShrink: 0, marginTop: "6px" }} />
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.ink, fontFamily: C.mono, marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "36px 28px" }}>
        {!result ? (
          <div style={{ animation: "fadeUp 0.5s ease" }}>

            {/* ── AI診断インフォバー ── */}
            <div style={{ marginBottom: "24px", padding: "12px 16px", background: `${C.accent}08`, border: `1px solid ${C.accent}30`, borderLeft: `3px solid ${C.accent}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                {PHASES.map(ph => <div key={ph.id} style={{ width: "4px", height: "4px", borderRadius: "50%", background: animPhase === ph.id ? ph.color : C.inkFaint, transition: "background 0.3s" }} />)}
              </div>
              <div style={{ fontSize: "11px", color: C.accent, fontFamily: C.serif, lineHeight: 1.6 }}>
                事業の状況を入力すると、AIが5フェーズの構造モデルで診断します。
              </div>
            </div>

            {/* ── チャットエリア ── */}
            <div style={{ marginBottom: "14px" }}>
              {/* 注意事項 */}
              <div style={{ marginBottom: "16px", padding: "12px 14px", background: C.surfaceAlt, border: `1px solid ${C.inkFaint}`, borderLeft: `3px solid ${C.inkDim}` }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, marginBottom: "6px" }}>ご入力の前に</div>
                <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9 }}>
                  ・<strong>個人情報・企業名・固有名詞は入力しないでください</strong><br />
                  ・事業課題・組織の状況を日本語でご記入ください<br />
                  ・15〜300文字を目安に、状況を簡潔に説明してください
                </div>
              </div>

              {/* textarea ラベル */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", letterSpacing: "0.35em", color: C.ink, fontFamily: C.mono, fontWeight: "bold" }}>DESCRIBE YOUR SITUATION</div>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${C.accent}50, transparent)` }} />
              </div>

              {/* textarea 本体 — 強調スタイル */}
              <textarea value={input} onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder="今、事業のどこで詰まっていますか？&#10;症状・状況・感じていること、何でも構いません。&#10;（個人情報・企業名は含めないでください）"
                rows={5} maxLength={MAX_CHARS}
                style={{
                  width: "100%", background: C.bg,
                  border: `1px solid ${C.inkFaint}`,
                  borderTop: `3px solid ${C.accent}`,
                  padding: "18px 20px", color: C.ink, fontSize: "13px",
                  fontFamily: C.serif, lineHeight: 1.9, resize: "none",
                  boxSizing: "border-box",
                  outline: "none",
                  boxShadow: input.trim().length >= MIN_CHARS ? `0 0 0 1px ${C.accent}30` : "none",
                  transition: "box-shadow 0.3s ease",
                }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <div style={{ fontSize: "11px", color: input.trim().length < MIN_CHARS ? C.inkDim : C.accent, fontFamily: C.mono }}>
                  {input.trim().length < MIN_CHARS && input.length > 0 ? `あと${MIN_CHARS - input.trim().length}文字以上` : input.trim().length >= MIN_CHARS ? "✓ 入力OK — 診断可能です" : ""}
                </div>
                <div style={{ fontSize: "11px", color: input.length > MAX_CHARS * 0.9 ? C.accent : C.inkDim, fontFamily: C.mono }}>
                  {input.length} / {MAX_CHARS}
                </div>
              </div>
            </div>

            {/* EXAMPLES */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.28em", color: C.inkFaint, marginBottom: "7px" }}>例文を選ぶ</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => setInput(ex)} style={{ background: "none", border: `1px solid ${C.inkFaint}`, padding: "4px 10px", fontSize: "11px", color: C.inkMid, cursor: "pointer", fontFamily: C.serif, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.inkFaint; e.currentTarget.style.color = C.inkMid; }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* 送信ボタン */}
            <div>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", background: `${C.accent}06`, border: `1px solid ${C.accent}20` }}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {PHASES.map((ph, i) => <div key={ph.id} style={{ width: "6px", height: "6px", borderRadius: "50%", background: animPhase === ph.id ? ph.color : C.inkFaint, transition: "background 0.2s", transform: animPhase === ph.id ? "scale(1.4)" : "scale(1)" }} />)}
                  </div>
                  <div style={{ fontSize: "11px", color: C.accent, letterSpacing: "0.3em" }}>AIが構造を読んでいます...</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif, textAlign: "right", marginBottom: "8px", opacity: input.trim().length >= MIN_CHARS ? 1 : 0, transition: "opacity 0.4s" }}>
                    送信後、AIがリアルタイムで回答します
                  </div>
                  <button onClick={handleDiagnose} disabled={!input.trim() || input.trim().length < MIN_CHARS}
                    style={{
                      width: "100%", background: input.trim().length >= MIN_CHARS ? C.ink : C.surfaceAlt,
                      border: "none", color: input.trim().length >= MIN_CHARS ? C.bg : C.inkDim,
                      padding: "16px", fontSize: "12px", letterSpacing: "0.45em",
                      cursor: input.trim().length >= MIN_CHARS ? "pointer" : "default",
                      fontFamily: C.mono, transition: "all 0.3s ease",
                    }}
                    onMouseEnter={e => { if (input.trim().length >= MIN_CHARS) e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    AI診断を開始する →
                  </button>
                </div>
              )}
            </div>
            {error && <div style={{ marginTop: "12px", fontSize: "11px", color: C.accent, textAlign: "right" }}>{error}</div>}

            {/* ── MY METHODOLOGY（チャット欄の下） ── */}
            <div style={{ marginTop: "48px", borderTop: `1px solid ${C.inkFaint}`, paddingTop: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.inkDim }}>MY METHODOLOGY</div>
                <div style={{ flex: 1, height: "1px", background: C.inkFaint }} />
              </div>
              <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif, marginBottom: "16px" }}>AIの診断ロジックの裏側 — クリックして各フェーズの解像度を確認する</div>
              <PhaseMethodologyPanel animPhase={animPhase} />
            </div>

          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.5s ease" }}>
            <PhasePipeline activePhase={result.phase} subPhases={subPhases} />
            {/* Phase header */}
            {phase && (
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "18px 22px", background: C.surface, border: `1px solid ${C.inkFaint}`, borderLeft: `4px solid ${phase.color}`, marginBottom: "18px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "5px" }}>BOTTLENECK IDENTIFIED</div>
                  <div style={{ fontSize: "17px", color: phase.color, fontFamily: C.serif, marginBottom: "3px" }}>{phase.label} Phase</div>
                  <div style={{ fontSize: "11px", color: C.inkMid, letterSpacing: "0.15em", fontFamily: C.mono }}>{phase.sub}</div>
                </div>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `${phase.color}15`, border: `2px solid ${phase.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: phase.color }} />
                </div>
              </div>
            )}
            {/* Reading */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>STRUCTURAL READING</div>
              <div style={{ fontSize: "13px", color: C.ink, fontFamily: C.serif, lineHeight: 1.9, padding: "14px 18px", background: C.accentLight }}>
                <Typewriter text={result.reading} onDone={() => setShowInsight(true)} />
              </div>
            </div>
            {showInsight && (
              <div style={{ marginBottom: "16px", animation: "fadeUp 0.4s ease" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>THE REAL QUESTION</div>
                <div style={{ fontSize: "16px", color: C.accent, fontFamily: C.serif, lineHeight: 1.8, padding: "14px 18px", background: C.surface, border: `1px solid ${C.inkFaint}`, borderLeft: `3px solid ${C.accent}` }}>
                  <Typewriter text={result.real_question} speed={28} onDone={() => setShowQ(true)} />
                </div>
              </div>
            )}
            {showQ && (
              <div style={{ marginBottom: "16px", animation: "fadeUp 0.4s ease" }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "8px" }}>NEXT MOVE</div>
                <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9, padding: "14px 18px", background: C.surface, border: `1px solid ${C.inkFaint}` }}>
                  <Typewriter text={result.next_move} speed={18} onDone={() => setShowAction(true)} />
                </div>
              </div>
            )}
            {/* Yoshi note + CTA */}
            {showAction && (
              <div style={{ animation: "fadeUp 0.6s ease" }}>
                <div style={{ padding: "18px 20px", background: C.surfaceAlt, border: `1px solid ${C.inkFaint}`, marginBottom: "20px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", color: C.bg, fontFamily: C.mono }}>W</span>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "6px" }}>YOSHI WADA — Business Designer</div>
                      <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9 }}>{result.yoshi_note}</div>
                    </div>
                  </div>
                </div>
                {/* MAIN CTA */}
                {!ctaMode && (
                  <div style={{ animation: "fadeUp 0.4s ease" }}>
                    <button onClick={() => onGoToPortfolio()} style={{
                      display: "block", width: "100%", padding: "16px", background: C.ink, border: "none", color: C.bg,
                      fontSize: "11px", letterSpacing: "0.4em", cursor: "pointer", fontFamily: C.mono,
                      marginBottom: "10px", transition: "opacity 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      和田 祥明を知る →
                    </button>
                    <div style={{ display: "flex", justifyContent: "center", gap: "28px" }}>
                      <button onClick={() => setCtaMode("chat")} style={{ background: "none", border: "none", fontSize: "11px", color: C.inkDim, cursor: "pointer", fontFamily: C.serif, letterSpacing: "0.05em", textDecoration: "underline", textDecorationColor: C.inkFaint }}>
                        まず話したい
                      </button>
                      <button onClick={() => setCtaMode("roadmap")} style={{ background: "none", border: "none", fontSize: "11px", color: C.inkDim, cursor: "pointer", fontFamily: C.serif, letterSpacing: "0.05em", textDecoration: "underline", textDecorationColor: C.inkFaint }}>
                        工程表を先に見たい
                      </button>
                    </div>
                  </div>
                )}
                {/* SUB A: Chat */}
                {ctaMode === "chat" && (
                  <div style={{ animation: "fadeUp 0.4s ease" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "14px" }}>A — まず話したい</div>
                    <ContactForm diagnosisInput={input} onSent={() => onGoToPortfolio()} />
                    <div style={{ marginTop: "14px", borderTop: `1px solid ${C.inkFaint}`, paddingTop: "14px" }}>
                      <button onClick={() => onGoToPortfolio()} style={{ display: "block", width: "100%", padding: "13px", background: "none", border: `1px solid ${C.ink}`, color: C.ink, fontSize: "11px", letterSpacing: "0.35em", cursor: "pointer", fontFamily: C.mono }}>
                        和田 祥明を知る →
                      </button>
                    </div>
                    <button onClick={() => setCtaMode(null)} style={{ marginTop: "10px", background: "none", border: "none", fontSize: "11px", color: C.inkDim, cursor: "pointer", fontFamily: C.mono, letterSpacing: "0.2em" }}>← 戻る</button>
                  </div>
                )}
                {/* SUB C: Roadmap */}
                {ctaMode === "roadmap" && (
                  <div style={{ animation: "fadeUp 0.4s ease" }}>
                    <RoadmapSection onGoToPortfolio={() => onGoToPortfolio()} />
                    <button onClick={() => setCtaMode(null)} style={{ marginTop: "10px", background: "none", border: "none", fontSize: "11px", color: C.inkDim, cursor: "pointer", fontFamily: C.mono, letterSpacing: "0.2em" }}>← 戻る</button>
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: "28px", paddingTop: "18px", borderTop: `1px solid ${C.inkFaint}`, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => { setResult(null); setInput(""); }} style={{ background: "none", border: `1px solid ${C.inkFaint}`, color: C.inkMid, padding: "7px 16px", fontSize: "11px", letterSpacing: "0.3em", cursor: "pointer", fontFamily: C.mono }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.inkFaint}>
                ← NEW DIAGNOSIS
              </button>
            </div>
          </div>
        )}
        {/* 下部: ポートフォリオページへ（診断をスキップして移動） */}
        <div style={{ borderTop: `1px solid ${C.inkFaint}`, paddingTop: "28px", marginTop: "36px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={onGoToPortfolio}
            style={{
              background: "none",
              border: `2px solid ${C.ink}`,
              color: C.ink,
              padding: "12px 32px",
              fontSize: "11px",
              letterSpacing: "0.35em",
              cursor: "pointer",
              fontFamily: C.mono,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.ink;
              e.currentTarget.style.color = C.bg;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = C.ink;
            }}
          >
            和田 祥明を知る（ポートフォリオ） →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE 2: PORTFOLIO COMPONENTS
// ============================================================

// --- HERO ---
function HeroSection() {
  const canvasRef = useRef(null);
  const lines = [
    "あなたの事業の問いは、",
    "正しく設定されていますか？",
  ];
  const subLines = [
    "「売上が伸びない」は、問いではない。",
    "「チームが動かない」も、問いではない。",
    "症状の裏に、本当の問いがある。",
  ];

  useVisibleCanvas(canvasRef, (ctx, W, H, t) => {
    ctx.clearRect(0, 0, W, H);
    // ── 背景グラデーション
    const grad = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.7);
    grad.addColorStop(0, "rgba(26,111,196,0.08)");
    grad.addColorStop(1, "rgba(15,31,46,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // ── 格子
    const cols = 16, rows = 10;
    const cw = W / cols, ch = H / rows;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const wave = Math.sin(t * 0.5 + c * 0.4 + r * 0.6) * 0.5 + 0.5;
        ctx.strokeStyle = `rgba(26,111,196,${wave * 0.13 + 0.03})`;
        ctx.lineWidth = wave * 0.8 + 0.3;
        if (c < cols) { ctx.beginPath(); ctx.moveTo(c * cw, r * ch); ctx.lineTo((c + 1) * cw, r * ch); ctx.stroke(); }
        if (r < rows) { ctx.beginPath(); ctx.moveTo(c * cw, r * ch); ctx.lineTo(c * cw, (r + 1) * ch); ctx.stroke(); }
        if (wave > 0.78) {
          const glow = ctx.createRadialGradient(c * cw, r * ch, 0, c * cw, r * ch, 6);
          glow.addColorStop(0, `rgba(100,180,255,${(wave - 0.78) * 0.9})`);
          glow.addColorStop(1, "rgba(100,180,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(c * cw, r * ch, 6, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // ── 斜め光線
    for (let i = 0; i < 3; i++) {
      const x = ((t * 40 + i * (W / 3)) % (W + H)) - H * 0.5;
      ctx.save(); ctx.translate(x, 0); ctx.rotate(Math.PI / 6);
      const lg = ctx.createLinearGradient(0, 0, 0, H * 1.4);
      lg.addColorStop(0, "rgba(26,111,196,0)");
      lg.addColorStop(0.5, `rgba(26,111,196,${0.06 - i * 0.01})`);
      lg.addColorStop(1, "rgba(26,111,196,0)");
      ctx.strokeStyle = lg; ctx.lineWidth = 40;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H * 1.4); ctx.stroke();
      ctx.restore();
    }
  });

  return (
    <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10vw", position: "relative", background: C.bg }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: C.ink }} />
      <div style={{ position: "absolute", top: "3px", left: 0, right: 0, height: "1px", background: C.accent }} />
      <div style={{ maxWidth: "680px", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "32px", animation: "fadeUp 0.6s ease" }}>
          YOSHI WADA — BUSINESS DESIGNER — FUKUOKA
        </div>
        <div style={{ fontSize: "clamp(28px,4vw,48px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.35, letterSpacing: "0.04em", marginBottom: "32px" }}>
          {lines.map((l, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <div style={{ animation: `slideUp 0.7s ease ${i * 0.2}s both` }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ borderLeft: `2px solid ${C.accent}`, paddingLeft: "20px" }}>
          {subLines.map((l, i) => (
            <div key={i} style={{ fontSize: "13px", color: C.inkMid, fontFamily: C.serif, lineHeight: 2, letterSpacing: "0.04em", animation: `fadeUp 0.6s ease ${0.8 + i * 0.15}s both` }}>
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", animation: "bounce 1.5s ease infinite", zIndex: 1 }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, textAlign: "center", marginBottom: "6px" }}>SCROLL</div>
        <div style={{ width: "1px", height: "32px", background: C.inkFaint, margin: "0 auto" }} />
      </div>
    </section>
  );
}

// --- PHILOSOPHY ---
function PhilosophySection() {
  const canvasRef = useRef(null);

  const philParticles = useRef(makeParticles(30));
  useVisibleCanvas(canvasRef, (ctx, W, H, t) => {
    ctx.clearRect(0, 0, W, H);
    drawParticleFrame(ctx, W, H, t, philParticles.current);
  });

  return (
    <section style={{ padding: "100px 10vw", background: C.surface, borderTop: `1px solid ${C.inkFaint}`, position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "48px" }}>
            02 — PHILOSOPHY
          </div>
        </FadeIn>

        {/* Predictable vs Unpredictable */}
        <FadeIn delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: C.inkFaint, marginBottom: "48px" }}>
            <div style={{ background: C.bg, padding: "32px 28px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "16px" }}>PREDICTABLE</div>
              <div style={{ fontSize: "15px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.8, marginBottom: "16px" }}>
                市場が安定している。<br />
                競合の動きが読める。<br />
                解くべき問いが明確だ。
              </div>
              <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.1em", padding: "10px 14px", background: C.surfaceAlt, borderLeft: `2px solid ${C.inkDim}` }}>
                戦略思考で解ける
              </div>
            </div>
            <div style={{ background: C.ink, padding: "32px 28px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "16px" }}>UNPREDICTABLE</div>
              <div style={{ fontSize: "15px", color: C.bg, fontFamily: C.serif, lineHeight: 1.8, marginBottom: "16px" }}>
                市場が変化し続けている。<br />
                顧客の言葉が信頼できない。<br />
                問い自体が間違っているかもしれない。
              </div>
              <div style={{ fontSize: "11px", color: C.accent, fontFamily: C.mono, letterSpacing: "0.1em", padding: "10px 14px", background: "rgba(200,90,30,0.12)", borderLeft: `2px solid ${C.accent}` }}>
                デザイン思考×システム思考が必要
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Dual-core */}
        <FadeIn delay={0.2}>
          <div style={{ marginBottom: "48px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.accent, fontFamily: C.mono, marginBottom: "16px" }}>DUAL-CORE PROCESSING</div>
            <div style={{ fontSize: "clamp(18px,2.5vw,26px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.6, letterSpacing: "0.04em", marginBottom: "20px" }}>
              デザイン思考は「意味」を処理する。<br />
              システム思考は「構造」を処理する。<br />
              この2つを同時に走らせることが、<br />
              予測不可能な問いを解く唯一の方法だ。
            </div>
          </div>
        </FadeIn>

        {/* 5 phase overview — placeholder for dynamic explanation */}
        <FadeIn delay={0.3}>
          <div style={{ padding: "28px 32px", background: C.bg, border: `1px solid ${C.inkFaint}`, borderTop: `3px solid ${C.accent}` }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>
              BUSINESS ARCHITECTURE — 5 PHASE FRAMEWORK
            </div>
            <div style={{ display: "flex", gap: "1px", background: C.inkFaint, marginBottom: "16px" }}>
              {PHASES.map((ph, i) => (
                <div key={ph.id} style={{ flex: 1, padding: "16px 10px", background: C.surface, textAlign: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ph.color, margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: C.inkMid, fontFamily: C.mono }}>{ph.label.toUpperCase()}</div>
                  <div style={{ fontSize: "11px", color: C.inkDim, marginTop: "3px", fontFamily: C.serif }}>{ph.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif, lineHeight: 1.8, letterSpacing: "0.06em", fontStyle: "italic" }}>
              ※ このフレームワークの詳細説明、デザイン思考が担う領域の可視化、<br />
              各思考モデルの解説は今後このセクションに追加予定。
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// --- SCROLLYTELLING CASES ---
// ── ダイアグラムタイプの自動判定 ──
function getDiagramType(label, index, total) {
  if (label.includes("アウトカム") || index === total - 1) return "outcome";
  if (label.includes("構造") || label.includes("発見") || label.includes("解剖")) return "structure";
  if (label.includes("転換") || label.includes("再設計") || label.includes("再構築")) return "transform";
  if (label.includes("ビフォー") || label.includes("対比") || label.includes("世界")) return "before_after";
  if (label.includes("違和感") || label.includes("予感") || label.includes("破壊")) return "tension";
  if (label.includes("依頼") || label.includes("提示") || label.includes("表面")) return "question";
  if (label.includes("実装") || label.includes("適用") || label.includes("突破")) return "flow";
  return index % 3 === 0 ? "structure" : index % 3 === 1 ? "transform" : "flow";
}

// ── 映画字幕式テキストアニメーション ──
function CinematicText({ text, isActive, phaseColor }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) { setVisibleCount(0); return; }
    setVisibleCount(0);
    const timers = lines.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), i * 320 + 100)
    );
    return () => timers.forEach(clearTimeout);
  }, [isActive, text]);

  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isEmpty = line.trim() === "";
        const isVisible = i < visibleCount;
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) ||
          (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isEmpty ? "0.5em" : isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : C.ink,
            fontFamily: C.serif,
            lineHeight: isEmpty ? 0.8 : 1.9,
            letterSpacing: "0.04em",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-14px)",
            transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.04}s`,
            marginBottom: isEmpty ? "8px" : "0",
            textShadow: isHighlight ? `0 0 16px ${phaseColor}40` : "none",
          }}>
            {line || "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}

// ── ダイアグラム: 構造図（ボックス＋矢印）──
function DiagramStructure({ phaseColor, isActive }) {
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

// ── ダイアグラム: 変換フロー ──
function DiagramTransform({ phaseColor, isActive }) {
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

// ── ダイアグラム: アウトカム数値 ──
function DiagramOutcome({ step, phaseColor, isActive }) {
  const metrics = [];
  const text = step.text;
  const patterns = [
    { re: /([0-9.]+)倍/, unit: "倍", label: "成長倍率" },
    { re: /([0-9]+)%/, unit: "%", label: "改善率" },
    { re: /×([0-9.]+)/, unit: "×", label: "スケール" },
    { re: /([0-9.]+)倍/, unit: "倍", label: "LTV改善" },
  ];
  const found = text.match(/[\d.]+[倍×%]/g) || [];
  found.slice(0, 3).forEach((m, i) => {
    const num = parseFloat(m);
    const unit = m.replace(/[\d.]/g, "");
    const labels = ["主要指標", "改善率", "副次効果"];
    metrics.push({ value: m, num, unit, label: labels[i] || "指標" });
  });
  if (metrics.length === 0) metrics.push({ value: "↑", num: null, label: "改善達成" });

  return (
    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          flex: 1, padding: "16px 12px", border: `1px solid ${phaseColor}40`,
          background: `${phaseColor}10`, textAlign: "center",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 0.7s ease ${i*0.2}s, transform 0.7s ease ${i*0.2}s`,
        }}>
          <div style={{ fontSize: "clamp(22px,3vw,32px)", color: phaseColor, fontFamily: C.mono, fontWeight: "bold", letterSpacing: "-0.02em" }}>
            {m.value}
          </div>
          <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.2em", marginTop: "6px" }}>
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ダイアグラム: ビフォーアフター ──
function DiagramBeforeAfter({ phaseColor, isActive }) {
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

// ── ダイアグラム: 緊張・違和感 ──
function DiagramTension({ phaseColor, isActive }) {
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

// ── ダイアグラム: 問い・依頼 ──
function DiagramQuestion({ phaseColor, isActive }) {
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

// ── ダイアグラム: 実装フロー ──
function DiagramFlow({ phaseColor, isActive }) {
  const steps = ["設計", "検証", "調整", "実装"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{
            flex: 1, padding: "10px 6px", textAlign: "center",
            background: i === steps.length-1 ? `${phaseColor}20` : C.surfaceAlt,
            border: `1px solid ${i === steps.length-1 ? phaseColor : C.inkFaint}`,
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateY(0)" : "translateY(12px)",
            transition: `opacity 0.5s ease ${i*0.15}s, transform 0.5s ease ${i*0.15}s`,
          }}>
            <div style={{ fontSize: "11px", color: i === steps.length-1 ? phaseColor : C.inkMid, fontFamily: C.mono, letterSpacing: "0.15em" }}>{s}</div>
          </div>
          {i < steps.length-1 && (
            <div style={{ color: phaseColor, fontSize: "11px", opacity: isActive ? 0.5 : 0, transition: `opacity 0.5s ease ${i*0.15+0.3}s` }}>›</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── ダイアグラムディスパッチャー ──
function CinematicDiagram({ type, step, phaseColor, isActive }) {
  const props = { phaseColor, isActive };
  switch(type) {
    case "outcome":     return <DiagramOutcome {...props} step={step} />;
    case "structure":   return <DiagramStructure {...props} />;
    case "transform":   return <DiagramTransform {...props} />;
    case "before_after":return <DiagramBeforeAfter {...props} />;
    case "tension":     return <DiagramTension {...props} />;
    case "question":    return <DiagramQuestion {...props} />;
    case "flow":        return <DiagramFlow {...props} />;
    default:            return <DiagramStructure {...props} />;
  }
}

// ── ビフォースライド（最初のstep専用） ──
function BeforeSlide({ step, phaseColor, isActive, caseData, total }) {
  const isCase1 = caseData?.id === 1;
  const lines = step.text.split("\n").filter(l => l.trim() !== "" || step.text.includes("\n\n"));
  const allLines = step.text.split("\n");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isActive) { setVisibleCount(0); return; }
    const timers = allLines.map((_, i) => setTimeout(() => setVisibleCount(i + 1), i * 380 + 200));
    return () => timers.forEach(clearTimeout);
  }, [isActive, step.text]);

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", borderBottom: `1px solid ${C.inkFaint}` }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 50%, ${phaseColor}05 0%, transparent 65%)`, pointerEvents: "none" }} />
      {/* B. アクティブ左ライン強化 */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isActive ? "5px" : "2px", background: phaseColor, opacity: isActive ? 1 : 0.15, transition: "opacity 0.8s ease, width 0.4s ease", boxShadow: isActive ? `3px 0 14px ${phaseColor}60` : "none" }} />

      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "80px clamp(24px,5vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: isCase1 ? "1fr 1fr" : "1fr", gap: "clamp(24px,5vw,60px)", width: "100%", alignItems: "center" }} className="case-step-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "28px", padding: "6px 14px", border: `1px solid ${phaseColor}40`, background: `${phaseColor}08`, opacity: isActive ? 1 : 0, transition: "opacity 0.6s ease 0.1s" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: phaseColor, animation: isActive ? "pulse 1.5s ease infinite" : "none" }} />
              <span style={{ fontSize: "11px", letterSpacing: "0.35em", color: phaseColor, fontFamily: C.mono }}>01 与件と背景</span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              {allLines.map((line, i) => {
                const isEmpty = !line.trim();
                const isQuote = line.startsWith("「") || line.startsWith("『");
                return (
                  <div key={i} style={{ overflow: "hidden", lineHeight: isEmpty ? 0.7 : 2, marginBottom: isEmpty ? "8px" : 0 }}>
                    <div style={{
                      fontSize: isQuote ? "clamp(16px,2.2vw,22px)" : isEmpty ? "12px" : "clamp(14px,1.8vw,18px)",
                      color: isQuote ? C.ink : C.inkMid,
                      fontFamily: C.serif, letterSpacing: "0.04em", fontStyle: isQuote ? "italic" : "normal",
                      transform: i < visibleCount ? "translateX(0)" : "translateX(-100%)",
                      opacity: i < visibleCount ? 1 : 0,
                      transition: `transform 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s, opacity 0.4s ease ${i * 0.08}s`,
                    }}>{line || "\u00A0"}</div>
                  </div>
                );
              })}
            </div>
            <ArchitectsEye text="依頼の言葉を、そのまま受け取らない。" phaseColor={phaseColor} show={isActive && visibleCount >= allLines.length} />
          </div>
          {isCase1 && (
            <div style={{ opacity: isActive ? 1 : 0, transform: isActive ? "translateX(0) scale(1)" : "translateX(30px) scale(0.97)", transition: "opacity 1.2s ease 0.6s, transform 1.2s ease 0.6s" }}>
              <div style={{ aspectRatio: "4/3", background: C.surfaceAlt, border: `1px solid ${C.inkFaint}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                  <div style={{ fontSize: "40px", opacity: 0.1 }}>📋</div>
                  <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono }}>CASE IMAGE</div>
                  <div style={{ fontSize: "11px", color: C.inkFaint, fontFamily: C.serif }}>依頼書・現場写真など</div>
                </div>
              </div>
              <div style={{ marginTop: "10px", fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.2em", textAlign: "right" }}>2019 — MEDICAL / MR TOOL</div>
            </div>
          )}
        </div>
      </div>
      <StepFooter index={0} total={total} label={step.label} phaseColor={phaseColor} isActive={isActive} />
    </div>
  );
}

// ── Before/After二分割（最後のstep専用）── CounterUp アニメーション
function OutcomeSlide({ step, phaseColor, isActive, total, stepIndex }) {
  const [revealed, setRevealed] = useState(false);
  const [counts, setCounts] = useState([]);

  // 数値を抽出してカウントアップ
  const rawMetrics = [];
  const found = step.text.match(/[\d.]+[倍×%]/g) || [];
  found.slice(0, 3).forEach((m, i) => {
    const num = parseFloat(m);
    const unit = m.replace(/[\d.]/g, "");
    rawMetrics.push({ display: m, num, unit, label: ["主要成果", "副次効果", "組織変化"][i] || "指標" });
  });

  useEffect(() => {
    if (!isActive) { setRevealed(false); setCounts(rawMetrics.map(() => 0)); return; }
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, [isActive]);

  useEffect(() => {
    if (!revealed || rawMetrics.length === 0) return;
    const timers = rawMetrics.map((m, mi) =>
      setTimeout(() => {
        const steps = 40;
        let s = 0;
        const iv = setInterval(() => {
          s++;
          setCounts(prev => {
            const next = [...prev];
            next[mi] = parseFloat((m.num * (s / steps)).toFixed(1));
            return next;
          });
          if (s >= steps) clearInterval(iv);
        }, 30);
      }, mi * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, [revealed]);

  const afterLines = step.text.split("\n").filter(l => l.trim()).slice(0, 5);
  const beforeLines = ["問いが曖昧だった", "構造が見えていなかった", "表面の症状を追っていた"];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: C.bg, display: "flex", flexDirection: "column", borderBottom: `1px solid ${C.inkFaint}` }}>
      {/* B. アクティブ左ライン強化 */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: isActive ? "5px" : "2px", background: phaseColor, opacity: isActive ? 1 : 0.15, transition: "opacity 0.8s ease, width 0.4s ease", boxShadow: isActive ? `3px 0 14px ${phaseColor}60` : "none", zIndex: 3 }} />
      {/* 中央縦線 */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: "1px", background: `linear-gradient(180deg, transparent, ${phaseColor}40, transparent)`, transform: revealed ? "scaleY(1)" : "scaleY(0)", transformOrigin: "center", transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)", zIndex: 2 }} />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {/* BEFORE */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px clamp(20px,4vw,60px)", background: C.surfaceAlt, opacity: revealed ? 1 : 0, transform: revealed ? "translateX(0)" : "translateX(-30px)", transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "28px" }}>BEFORE</div>
          {beforeLines.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px", opacity: revealed ? 1 : 0, transition: `opacity 0.6s ease ${0.4 + i * 0.15}s` }}>
              <span style={{ color: C.inkFaint, fontSize: "14px", marginTop: "2px", flexShrink: 0 }}>✕</span>
              <div style={{ fontSize: "14px", color: C.inkDim, fontFamily: C.serif, lineHeight: 1.7, fontStyle: "italic" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* AFTER */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px clamp(20px,4vw,60px)", background: `${phaseColor}06`, opacity: revealed ? 1 : 0, transform: revealed ? "translateX(0)" : "translateX(30px)", transition: "opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: phaseColor, fontFamily: C.mono, marginBottom: "28px" }}>AFTER</div>

          {rawMetrics.length > 0 && (
            <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
              {rawMetrics.map((m, i) => (
                <div key={i} style={{ padding: "12px 16px", border: `1px solid ${phaseColor}30`, background: C.surface, opacity: revealed ? 1 : 0, transition: `opacity 0.5s ease ${0.5 + i * 0.15}s` }}>
                  <div style={{ fontSize: "clamp(20px,2.8vw,32px)", color: phaseColor, fontFamily: C.mono, fontWeight: "bold", letterSpacing: "-0.02em", transition: "all 0.05s linear" }}>
                    {counts[i] !== undefined ? `${counts[i]}${m.unit}` : m.display}
                  </div>
                  <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.15em", marginTop: "4px" }}>{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {afterLines.map((l, i) => (
            <div key={i} style={{ fontSize: "clamp(13px,1.6vw,15px)", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9, opacity: revealed ? 1 : 0, transition: `opacity 0.6s ease ${0.5 + i * 0.12}s` }}>{l}</div>
          ))}

          <ArchitectsEye text="アウトカムは終点ではなく、次の問いの起点だ。" phaseColor={phaseColor} show={revealed} />
        </div>
      </div>

      <StepFooter index={stepIndex} total={total} label={step.label} phaseColor={phaseColor} isActive={isActive} />
    </div>
  );
}

// ── A. ステップ区切りバー — スクロールで左→右にラインが伸び番号が出現 ──
function StepDivider({ index, total, phaseColor }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.8);
  return (
    <div ref={ref} style={{ position: "relative", height: "48px", background: "#1e1a16", display: "flex", alignItems: "center", overflow: "hidden", borderTop: `1px solid ${phaseColor}18` }}>
      {/* ライン左→右 */}
      <div style={{
        position: "absolute", left: 0, top: "50%", height: "1px",
        background: `linear-gradient(90deg, ${phaseColor}80, ${phaseColor}20, transparent)`,
        width: inView ? "100%" : "0%",
        transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
      }} />
      {/* ステップ番号 */}
      <div style={{
        position: "absolute", left: "clamp(24px,5vw,80px)",
        display: "flex", alignItems: "center", gap: "10px",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
      }}>
        <span style={{ fontSize: "11px", letterSpacing: "0.5em", color: phaseColor, fontFamily: C.mono, opacity: 0.9 }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div style={{ width: "1px", height: "12px", background: `${phaseColor}40` }} />
        <span style={{ fontSize: "10px", letterSpacing: "0.3em", color: `${phaseColor}60`, fontFamily: C.mono }}>
          SCENE CHANGE
        </span>
      </div>
    </div>
  );
}

// ── B. ARCHITECT'S EYE 共通コンポーネント ──
function ArchitectsEye({ text, phaseColor, show }) {
  return (
    <div style={{
      opacity: show ? 1 : 0, transition: "opacity 0.8s ease 0.5s",
      padding: "14px 18px", borderLeft: `3px solid ${phaseColor}`,
      background: `${phaseColor}08`, marginTop: "24px",
    }}>
      <div style={{ fontSize: "11px", color: phaseColor, fontFamily: C.mono, letterSpacing: "0.2em", marginBottom: "4px", opacity: 0.8 }}>ARCHITECT'S EYE</div>
      <div style={{ fontSize: "13px", color: C.inkMid, fontFamily: C.serif, fontStyle: "italic", lineHeight: 1.7 }}>{text}</div>
    </div>
  );
}

// ── C. ステップフッター 共通コンポーネント ──
function StepFooter({ index, total, label, phaseColor, isActive }) {
  return (
    <div style={{ padding: "0 clamp(24px,5vw,80px) 32px", display: "flex", alignItems: "center", gap: "12px", opacity: isActive ? 0.65 : 0.25, transition: "opacity 0.6s ease" }}>
      <div style={{ fontSize: "11px", letterSpacing: "0.45em", color: phaseColor, fontFamily: C.mono, flexShrink: 0 }}>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${phaseColor}50, transparent)` }} />
      <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, flexShrink: 0 }}>{label}</div>
    </div>
  );
}

// ── Step 02: GlitchReveal — 文字が乱れてからロック ──
function GlitchText({ text, isActive, phaseColor }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [phase, setPhase] = useState("hidden"); // hidden → glitch → stable
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@%&";
  const [glitched, setGlitched] = useState([]);

  useEffect(() => {
    if (!isActive) { setPhase("hidden"); setGlitched([]); return; }
    setPhase("glitch");
    setGlitched(lines.map(l => l.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")));
    const t1 = setInterval(() => {
      setGlitched(lines.map(l => l.split("").map(() => CHARS[Math.floor(Math.random() * CHARS.length)]).join("")));
    }, 60);
    const t2 = setTimeout(() => { clearInterval(t1); setPhase("stable"); }, 700);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, [isActive, text]);

  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) || (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : phase === "glitch" ? phaseColor + "aa" : C.ink,
            fontFamily: phase === "glitch" ? C.mono : C.serif,
            lineHeight: 1.9, letterSpacing: phase === "glitch" ? "0.08em" : "0.04em",
            opacity: phase === "hidden" ? 0 : 1,
            transition: phase === "stable" ? `color 0.3s ease ${i * 0.06}s, font-family 0.1s, letter-spacing 0.3s` : "none",
            textShadow: phase === "glitch" ? `0 0 8px ${phaseColor}60, 2px 0 ${phaseColor}40, -2px 0 rgba(255,0,128,0.3)` : "none",
          }}>
            {phase === "glitch" ? (glitched[i] || line) : (line || "\u00A0")}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 03: FocusBlur — ぼかしが解けて鮮明化 ──
function FocusBlurText({ text, isActive, phaseColor }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!isActive) { setFocused(false); return; }
    const t = setTimeout(() => setFocused(true), 150);
    return () => clearTimeout(t);
  }, [isActive]);
  return (
    <div style={{ minHeight: `${lines.length * 2.4}em` }}>
      {lines.map((line, i) => {
        const isHighlight = line.startsWith("——") || /^[0-9×.%→↑↓倍]/.test(line.trim()) || (i === lines.length - 1 && lines.length > 2);
        return (
          <div key={i} style={{
            fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)",
            color: isHighlight ? phaseColor : C.ink,
            fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em",
            filter: focused ? "blur(0px)" : `blur(${6 + i * 1.5}px)`,
            opacity: focused ? 1 : 0.2,
            transition: `filter 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, opacity 0.7s ease ${i * 0.1}s`,
          }}>
            {line || "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 04: SplitReveal — 上下に開く ──
function SplitRevealText({ text, isActive, phaseColor }) {
  const lines = text.split("\n").filter(l => l.trim() !== "");
  const mid = Math.ceil(lines.length / 2);
  const top = lines.slice(0, mid);
  const bot = lines.slice(mid);
  return (
    <div style={{ minHeight: `${lines.length * 2.4}em`, position: "relative", overflow: "hidden" }}>
      <div style={{ transform: isActive ? "translateY(0)" : "translateY(-40px)", opacity: isActive ? 1 : 0, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s, opacity 0.6s ease 0.1s" }}>
        {top.map((line, i) => {
          const isHighlight = /^[0-9×.%→↑↓倍]/.test(line.trim());
          return <div key={i} style={{ fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)", color: isHighlight ? phaseColor : C.ink, fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em" }}>{line}</div>;
        })}
      </div>
      <div style={{ height: "1px", background: `linear-gradient(90deg, ${phaseColor}60, transparent)`, opacity: isActive ? 1 : 0, transition: "opacity 0.5s ease 0.5s", margin: "8px 0" }} />
      <div style={{ transform: isActive ? "translateY(0)" : "translateY(40px)", opacity: isActive ? 1 : 0, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.25s, opacity 0.6s ease 0.25s" }}>
        {bot.map((line, i) => {
          const isHighlight = line.startsWith("——") || (i === bot.length - 1 && lines.length > 2);
          return <div key={i} style={{ fontSize: isHighlight ? "clamp(16px,2.2vw,22px)" : "clamp(14px,1.9vw,19px)", color: isHighlight ? phaseColor : C.ink, fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em" }}>{line}</div>;
        })}
      </div>
    </div>
  );
}

// ── Step 05: CinematicLine（既存流用、ライト色対応済み）──
// → CinematicText をそのまま使う

// ── ステップ別 ARCHITECT'S EYE テキスト ──
const ARCHITECTS_EYE_TEXT = [
  "依頼の言葉を、そのまま受け取らない。",       // 01
  "違和感こそが、構造を見つける手がかりだ。",    // 02
  "問いの形を変えると、答えの景色が変わる。",    // 03
  "設計とは、制約を武器に変えることだ。",        // 04
  "実装は思考の結晶化である。",                  // 05
];

// ── ステップ番号→テキストアニメーション種別を返す ──
function getTextAnimation(index, total) {
  if (index === 0) return "mask";       // 01: MaskSlide（BeforeSlideで実装済み）
  if (index === total - 1) return "counter"; // 06: CounterUp（OutcomeSlideで実装済み）
  const map = { 1: "glitch", 2: "focus", 3: "split", 4: "cinematic" };
  return map[index] || "cinematic";
}

// ── CaseStep（振り分けハブ） ──
function CaseStep({ step, index, total, phaseColor, isActive, caseData }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.3);
  const diagramType = getDiagramType(step.label, index, total);
  const active = isActive && inView;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const textAnim = getTextAnimation(index, total);

  if (isFirst) return <div ref={ref}><BeforeSlide step={step} phaseColor={phaseColor} isActive={active} caseData={caseData} total={total} /></div>;
  if (isLast) return <div ref={ref}><OutcomeSlide step={step} phaseColor={phaseColor} isActive={active} total={total} stepIndex={index} /></div>;

  const TextComponent =
    textAnim === "glitch"    ? <GlitchText    text={step.text} isActive={active} phaseColor={phaseColor} /> :
    textAnim === "focus"     ? <FocusBlurText text={step.text} isActive={active} phaseColor={phaseColor} /> :
    textAnim === "split"     ? <SplitRevealText text={step.text} isActive={active} phaseColor={phaseColor} /> :
                               <CinematicText text={step.text} isActive={active} phaseColor={phaseColor} />;

  return (
    <div ref={ref} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: active ? C.surface : C.bg, transition: "background 0.8s ease", borderBottom: `1px solid ${C.inkFaint}` }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 50%, rgba(15,31,46,0.03) 100%)", opacity: active ? 1 : 0.3, transition: "opacity 1s ease" }} />
      {/* B. アクティブ左ライン強化 */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: active ? "5px" : "2px", background: phaseColor, opacity: active ? 1 : 0.15, transition: "opacity 0.8s ease, width 0.4s ease", boxShadow: active ? `3px 0 14px ${phaseColor}60` : "none" }} />
      <div style={{ flex: 1, width: "100%", padding: "80px clamp(24px,5vw,80px)", position: "relative", zIndex: 1 }}>
        {/* C. ラベルヘッダー — ラインが伸びてからテキスト出現 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.45em", color: phaseColor, fontFamily: C.mono, opacity: active ? 1 : 0.4, transition: "opacity 0.5s ease 0.3s", flexShrink: 0 }}>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
          <div style={{ height: "1px", background: `linear-gradient(90deg, ${phaseColor}60, transparent)`, width: active ? "100%" : "0%", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s", flex: 1 }} />
          <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: C.mono, opacity: active ? 1 : 0, transition: "opacity 0.5s ease 0.5s", flexShrink: 0 }}>{step.label}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,5vw,60px)", alignItems: "start" }} className="case-step-grid">
          <div>
            {TextComponent}
            <ArchitectsEye text={ARCHITECTS_EYE_TEXT[index] || "構造を見る。問いを疑う。"} phaseColor={phaseColor} show={active} />
          </div>
          <div style={{ opacity: active ? 1 : 0, transform: active ? "translateX(0)" : "translateX(24px)", transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.inkDim, fontFamily: C.mono, marginBottom: "12px" }}>{diagramType.toUpperCase().replace("_", " ")}</div>
            <CinematicDiagram type={diagramType} step={step} phaseColor={phaseColor} isActive={active} />
          </div>
        </div>
      </div>
      <StepFooter index={index} total={total} label={step.label} phaseColor={phaseColor} isActive={active} />
    </div>
  );
}

const FIXED_BAR_HEIGHT = 80;

function FeaturedCase({ caseData, isActive }) {
  const phase = PHASES.find(p => p.id === caseData.phase);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [fixedBarVisible, setFixedBarVisible] = useState(false);
  const stepRefs = useRef([]);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);
  const canvasRef = useRef(null);

  // ── パフォーマンス最適化: 画面外停止 + 30粒子 ──
  const fcParticles = useRef(makeParticles(30));
  useVisibleCanvas(canvasRef, (ctx, W, H, t) => {
    ctx.clearRect(0, 0, W, H);
    drawParticleFrame(ctx, W, H, t, fcParticles.current);
  });

  useEffect(() => {
    const observers = caseData.steps.map((_, i) => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) setActiveStepIdx(i);
      }, { threshold: 0.5 });
      if (stepRefs.current[i]) obs.observe(stepRefs.current[i]);
      return obs;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [caseData]);

  useEffect(() => {
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;
    if (!headerEl || !bodyEl) return;
    let headerOut = false;
    let bodyIn = false;
    const update = () => setFixedBarVisible(headerOut && bodyIn);
    const headerObs = new IntersectionObserver(([e]) => {
      headerOut = !e.isIntersecting;
      update();
    }, { threshold: 0 });
    const bodyObs = new IntersectionObserver(([e]) => {
      bodyIn = e.isIntersecting;
      update();
    }, { threshold: 0 });
    headerObs.observe(headerEl);
    bodyObs.observe(bodyEl);
    return () => { headerObs.disconnect(); bodyObs.disconnect(); };
  }, []);

  const activePhaseForStep = caseData.phase;

  const sideMargin = "clamp(24px, 6vw, 100px)";

  const FixedBarContent = () => (
    <div style={{ display: "flex", width: "100%", maxWidth: "100vw" }}>
      <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", borderLeft: `1px solid ${C.inkFaint}` }}>
        <div style={{ width: "120px", flexShrink: 0, background: caseData.thumbnailColor || C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.25)", fontFamily: C.serif, fontWeight: "bold" }}>{caseData.thumbnailSymbol}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "14px 24px 14px 20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono }}>{caseData.year}</span>
            <span style={{ fontSize: "clamp(14px,1.8vw,18px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.3, letterSpacing: "0.02em" }}>{caseData.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <PhasePipeline activePhase={activePhaseForStep} subPhases={[]} vertical={false} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono }}>
                STEP {String(activeStepIdx + 1).padStart(2, "0")} / {String(caseData.steps.length).padStart(2, "0")}
              </span>
              <div style={{ width: "60px", height: "3px", background: C.inkFaint, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: phase?.color || C.accent, width: `${((activeStepIdx + 1) / caseData.steps.length) * 100}%`, transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
    </div>
  );

  return (
    <div style={{ width: "100%", overflowX: "hidden", position: "relative" }}>
      {/* 粒子Canvas — Philosophy と同じ背景 */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
      {/* 追尾バー: position:fixed + 表示時はスペーサーでレイアウトずれ防止 */}
      {fixedBarVisible && (
        <>
          <div style={{ position: "fixed", top: 52, left: 0, right: 0, zIndex: 25, background: C.surface, borderBottom: `1px solid ${C.inkFaint}`, boxShadow: "0 4px 20px rgba(15,31,46,0.08)", minHeight: FIXED_BAR_HEIGHT, display: "flex", alignItems: "stretch" }}>
            <FixedBarContent />
          </div>
          <div style={{ height: FIXED_BAR_HEIGHT, flexShrink: 0 }} aria-hidden />
        </>
      )}

      {/* ── 初回表示：サムネイル＋タイトル＋タグ（スクロールで上に流れたら fixed バーを表示） ── */}
      <div ref={headerRef} style={{ display: "flex", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
        <div style={{ flex: 1, minWidth: 0, borderLeft: `1px solid ${C.inkFaint}`, overflow: "hidden" }}>
          <div style={{ height: "160px", background: caseData.thumbnailColor || C.ink, position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 48px" }}>
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`grid-${caseData.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${caseData.id})`}/>
            </svg>
            {/* CASE01：タイトル+タグ。他のケースはthumbnailSymbol */}
            {caseData.id === 1 ? (
              <div style={{ position: "absolute", left: "40px", top: "50%", transform: "translateY(-50%)", maxWidth: "65%" }}>
                <div style={{ fontSize: "clamp(14px,1.8vw,20px)", color: "rgba(255,255,255,0.92)", fontFamily: C.serif, lineHeight: 1.4, letterSpacing: "0.03em", marginBottom: "10px" }}>
                  {caseData.title}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {caseData.tags.map(t => (
                    <span key={t} style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", padding: "2px 8px", border: "1px solid rgba(255,255,255,0.25)", fontFamily: C.mono, letterSpacing: "0.1em" }}>{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "clamp(40px,6vw,72px)", color: "rgba(255,255,255,0.12)", fontFamily: C.serif, fontWeight: "bold", position: "absolute", left: "40px", bottom: "-8px", lineHeight: 1 }}>{caseData.thumbnailSymbol}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", fontFamily: C.mono }}>{caseData.year}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)", fontFamily: C.mono, padding: "3px 8px", border: "1px solid rgba(255,255,255,0.2)" }}>{STORY_TYPE_LABELS[caseData.storyType]}</div>
            </div>
          </div>
          <div style={{ padding: "14px 48px 18px", background: C.bg, borderBottom: `1px solid ${C.inkFaint}` }}>
            <div style={{ fontSize: "13px", color: C.inkDim, fontFamily: C.serif, fontStyle: "italic", letterSpacing: "0.04em" }}>
              ここには案件概要が入ります。
            </div>
          </div>
        </div>
        <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
      </div>

      <div ref={bodyRef} style={{ position: "relative", zIndex: 1 }}>

      {/* ── SCROLLYTELLING: ステップ（ダーク額縁 × 白コンテンツ） ── */}
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
        <div style={{ flex: 1, minWidth: 0, borderLeft: `1px solid ${C.inkFaint}` }}>
          {caseData.steps.map((step, i) => (
            <div key={i}>
              {i > 0 && <StepDivider index={i} total={caseData.steps.length} phaseColor={phase?.color || C.accent} />}
              <div ref={el => { stepRefs.current[i] = el; }}>
                <CaseStep step={step} index={i} total={caseData.steps.length} phaseColor={phase?.color || C.accent} isActive={activeStepIdx === i} caseData={caseData} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: sideMargin, flexShrink: 0, background: "#1e1a16" }} />
      </div>

      {/* ── Overview Gate — まとめへの入口 ── */}
      {caseData.overview && (
        <OverviewGate caseId={caseData.id} phaseColor={phase?.color || C.accent} overview={caseData.overview} year={caseData.year} phase={caseData.phase} sideMargin={sideMargin} />
      )}

      </div>
    </div>
  );
}

function ArchiveCard({ caseData, onClick }) {
  const phase = PHASES.find(p => p.id === caseData.phase);
  const isPlaceholder = caseData.title.includes("プレースホルダー");
  return (
    <button onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.inkFaint}`, borderTop: `3px solid ${phase?.color || C.inkFaint}`,
      padding: "20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
      opacity: isPlaceholder ? 0.5 : 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.background = C.bg; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.inkFaint; e.currentTarget.style.background = C.surface; }}
    >
      <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: phase?.color, fontFamily: C.mono, marginBottom: "6px" }}>
        {caseData.year} — {caseData.phase.toUpperCase()}
      </div>
      <div style={{ fontSize: "12px", color: C.ink, fontFamily: C.serif, lineHeight: 1.5, marginBottom: "10px" }}>
        {caseData.title}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {caseData.tags.map(t => (
          <span key={t} style={{ fontSize: "11px", color: C.inkDim, padding: "2px 7px", border: `1px solid ${C.inkFaint}`, fontFamily: C.mono, letterSpacing: "0.1em" }}>{t}</span>
        ))}
      </div>
    </button>
  );
}

// ── Overview Gate — スクロールトリガーでOverviewを開示 ──
function OverviewGate({ caseId, phaseColor, overview, year, phase, sideMargin }) {
  const triggerRef = useRef(null);
  const inView = useInView(triggerRef, 0.5);
  const contentRef = useRef(null);

  return (
    <div ref={triggerRef}>
      {/* Overview本体 — inViewでフェードイン */}
      <div style={{ display: "flex", width: "100%", opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s" }}>
          <div style={{ width: sideMargin, flexShrink: 0, background: C.surfaceAlt }} />
          <div style={{ flex: 1, minWidth: 0, background: C.surface, borderLeft: `1px solid ${C.inkFaint}`, borderBottom: `1px solid ${C.inkFaint}` }}>

            {/* ヘッダー */}
            <div style={{ padding: "20px 40px 16px", borderBottom: `2px solid ${C.ink}`, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono }}>PROJECT OVERVIEW</div>
              <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono }}>{year} — {phase.toUpperCase()}</div>
            </div>

            {/* 2カラム：左=テキスト / 右=レーダーグラフ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "0", borderBottom: `1px solid ${C.inkFaint}` }}>
              <div style={{ padding: "24px 32px", borderRight: `1px solid ${C.inkFaint}` }}>
                <h2 style={{ fontSize: "clamp(15px,2vw,22px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.4, fontWeight: "700", margin: "0 0 24px" }}>
                  {caseId === 1
                    ? "「ノベルティ」として来た依頼が、新薬販売の構造設計になった"
                    : overview.projectTitle}
                </h2>
                {(caseId === 1 ? [
                  { label: "Context", sub: "背景", num: "01", text: "製薬メーカーのMR（医薬情報担当者）が、担当医師にアプローチできていない。アポイントが取れない、資料が渡らない、という表面的な「ノベルティ不足」として依頼が来た。" },
                  { label: "Concept", sub: "再定義", num: "02", text: "問題は「ノベルティの質」ではなく「予算の分断」だった。ノベルティ・営業支援・中長期の3予算が完全に縦割りで、誰も統合しようとしていなかった構造が本質だった。" },
                  { label: "Strategy", sub: "戦略", num: "03", text: "3予算を統合できる「SDカード更新型デバイス」を設計。MRが使え、医師が受け取れ、製薬メーカーが承認できる——三者が動ける唯一の形を起点に、承認フローを逆算設計した。" },
                  { label: "Value", sub: "提供価値", num: "04", text: "「ノベルティ予算」でありながら「営業支援ツール」として機能し、長期的なMR-医師関係を構築できる。依頼の問いを変えることで、単品受注が事業構造の再設計に昇華した。" },
                ] : [
                  { label: "Context", sub: "背景", num: "01", text: overview.context },
                  { label: "Concept", sub: "核心", num: "02", text: overview.concept },
                  { label: "Strategy", sub: "戦略", num: "03", text: overview.strategy },
                  { label: "Value", sub: "提供価値", num: "04", text: overview.value },
                ]).map((item, idx) => (
                  <div key={item.label} style={{ display: "flex", gap: "16px", paddingBottom: "18px", marginBottom: "18px", borderBottom: idx < 3 ? `1px solid ${C.inkFaint}` : "none" }}>
                    <div style={{ flexShrink: 0, textAlign: "right", width: "32px" }}>
                      <div style={{ fontSize: "18px", color: C.inkFaint, fontFamily: C.mono, lineHeight: 1 }}>{item.num}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", letterSpacing: "0.2em", color: C.accent, fontFamily: C.mono, fontWeight: "bold" }}>{item.label}</span>
                        <span style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif }}>{item.sub}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9 }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "24px 20px", background: C.bg }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>PARAMETER</div>
                <OverviewRadar caseId={caseId} phaseColor={phaseColor} />
              </div>
            </div>

            {/* DESIGN SCOPE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "0" }}>
              <div style={{ padding: "24px 32px", borderRight: `1px solid ${C.inkFaint}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.4em", color: C.ink, fontFamily: C.mono, fontWeight: "bold" }}>DESIGN SCOPE</div>
                  <div style={{ flex: 1, height: "1px", background: C.inkFaint }} />
                  <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono }}>{overview.scope.length} ROLES</div>
                </div>
                {(caseId === 1 ? [
                  { role: "Business Research", desc: "「ノベルティ」という表層ではなく、MR-医師間の構造的断絶を特定。承認プロセスの壁とコスト感度の違いを三者ヒアリングで可視化した。" },
                  { role: "Business Architect", desc: "3つに分断された予算（ノベルティ・営業支援・中長期）を統合できる唯一の接点を特定し、デバイス仕様を逆算。問いそのものを「ノベルティ改善」から「販売促進の構造設計」へ転換した。" },
                  { role: "BizDev", desc: "製薬メーカー・MR・医師の三者が同時にYESを出せる承認フローを設計。ノベルティ予算内で完結しながら、営業支援予算の機能を内包するスキームを構築。" },
                  { role: "PdM", desc: "SDカード更新UIという制約を武器に変換。更新コストを最小化しながら、情報の鮮度を保つ仕組みをプロダクト仕様として落とし込んだ。" },
                  { role: "Stakeholder Design", desc: "MRの行動変容（渡しやすさ）、医師の受容性（受け取りやすさ）、メーカーの承認容易性——三者のJTBDを同時に満たす設計ポイントを特定・言語化。" },
                ] : overview.scope).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", paddingBottom: "16px", marginBottom: "16px", borderBottom: i < (caseId === 1 ? 4 : overview.scope.length - 1) ? `1px solid ${C.inkFaint}` : "none" }}>
                    <div style={{ flexShrink: 0, width: "32px", textAlign: "right" }}>
                      <div style={{ fontSize: "18px", color: C.inkFaint, fontFamily: C.mono, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", letterSpacing: "0.15em", color: C.ink, fontFamily: C.mono, fontWeight: "bold", marginBottom: "6px" }}>{item.role}</div>
                      <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.8 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "24px 20px", background: C.bg }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>SKILL MIX</div>
                <ScopeBarChart caseId={caseId} phaseColor={phaseColor} />
              </div>
            </div>

          </div>
          <div style={{ width: sideMargin, flexShrink: 0, background: C.surfaceAlt }} />
        </div>
    </div>
  );
}

// ── Cases Gate — 実績紹介への入口儀式 ──
function CasesGate({ onEnter }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.4);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(onEnter, 600);
  };

  return (
    <div ref={ref} style={{
      minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 6vw", position: "relative", overflow: "hidden",
    }}>
      {/* 背景ライン装飾 */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 60%, rgba(180,140,60,0.04) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", left: "6vw", right: "6vw", top: "50%",
        height: "1px", background: `linear-gradient(90deg, transparent, rgba(180,140,60,0.15), transparent)`,
        transform: "translateY(-50%)", pointerEvents: "none",
      }} />

      {/* ゲートカード本体 */}
      <div style={{
        maxWidth: "520px", width: "100%", textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
      }}>
        {/* 上部ライン */}
        <div style={{
          width: "1px", height: "48px", background: `linear-gradient(180deg, transparent, rgba(180,140,60,0.4))`,
          margin: "0 auto 32px",
        }} />

        {/* ラベル */}
        <div style={{
          fontSize: "11px", letterSpacing: "0.5em", color: "rgba(180,140,60,0.5)",
          fontFamily: C.mono, marginBottom: "24px",
        }}>
          ENTER CASE RECORDS
        </div>

        {/* メインコピー */}
        <div style={{
          fontSize: "clamp(16px,2.2vw,22px)", color: "rgba(255,245,230,0.88)",
          fontFamily: C.serif, lineHeight: 1.8, letterSpacing: "0.06em",
          marginBottom: "40px",
        }}>
          ここから先は、実績紹介へ入ります。
        </div>

        {/* ボタン */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: clicked ? "rgba(180,140,60,0.15)" : hovered ? "rgba(180,140,60,0.08)" : "transparent",
            border: `1px solid ${hovered || clicked ? "rgba(180,140,60,0.6)" : "rgba(180,140,60,0.25)"}`,
            color: hovered || clicked ? "rgba(255,245,210,0.9)" : "rgba(180,140,60,0.6)",
            padding: "14px 40px", cursor: "pointer",
            fontFamily: C.mono, fontSize: "11px", letterSpacing: "0.45em",
            transition: "all 0.35s ease",
            opacity: clicked ? 0 : 1,
            transform: clicked ? "scale(0.97)" : "scale(1)",
            display: "inline-flex", alignItems: "center", gap: "12px",
          }}
        >
          <span style={{
            display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
            background: hovered ? "rgba(180,140,60,0.8)" : "rgba(180,140,60,0.3)",
            transition: "background 0.35s ease",
            animation: hovered ? "pulse 1.2s ease infinite" : "none",
          }} />
          進む
          <span style={{
            opacity: hovered ? 1 : 0.4, transition: "opacity 0.35s ease",
            fontSize: "14px", letterSpacing: 0,
          }}>›</span>
        </button>

        {/* 下部ライン */}
        <div style={{
          width: "1px", height: "48px", background: `linear-gradient(180deg, rgba(180,140,60,0.4), transparent)`,
          margin: "32px auto 0",
        }} />
      </div>
    </div>
  );
}

function CasesSection() {
  const featuredCases = CASES.filter(c => c.featured);
  const archiveCases = CASES.filter(c => !c.featured);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const archiveExpandedRef = useRef(null);
  const casesBodyRef = useRef(null);
  const allTags = ["ALL", ...Array.from(new Set(CASES.flatMap(c => c.tags)))];
  const filteredArchive = activeFilter === "ALL" ? archiveCases : archiveCases.filter(c => c.tags.includes(activeFilter));

  useEffect(() => {
    if (selectedArchive && archiveExpandedRef.current) {
      archiveExpandedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedArchive]);

  const handleGateEnter = () => {
    window.location.href = "/cases";
  };

  return (
    <section style={{ background: "#1e1a16", borderTop: `1px solid ${C.inkFaint}` }}>
      <div style={{ padding: "80px 6vw 40px", maxWidth: "900px" }}>
        <FadeIn>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: "rgba(180,160,130,0.7)", fontFamily: C.mono, marginBottom: "16px" }}>03 — CASES</div>
          <div style={{ fontSize: "clamp(20px,3vw,32px)", color: "rgba(255,245,230,0.9)", fontFamily: C.serif, lineHeight: 1.4, marginBottom: "8px" }}>
            予測不可能な問いを、どう解いてきたか。
          </div>
          <div style={{ fontSize: "11px", color: "rgba(180,160,130,0.6)", fontFamily: C.serif, letterSpacing: "0.06em" }}>
            精選3件を深く読む。残り7件はアーカイブで。
          </div>
        </FadeIn>
      </div>

      {/* Gate — 実績紹介への入口 */}
      {!gateOpen && <CasesGate onEnter={handleGateEnter} />}

      {/* Featured cases — scrollytelling */}
      <div ref={casesBodyRef} style={{
        overflow: "hidden", maxHeight: gateOpen ? "none" : 0,
        opacity: gateOpen ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}>
      {featuredCases.map((c, i) => (
        <div key={c.id}>
          <div style={{ padding: "20px 6vw 0", borderTop: `1px solid ${C.inkFaint}` }}>
            <FadeIn>
              <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono }}>
                CASE {String(i + 1).padStart(2, "0")} OF {String(featuredCases.length).padStart(2, "0")}
              </div>
            </FadeIn>
          </div>
          <FeaturedCase caseData={c} />
        </div>
      ))}

      {/* Archive */}
      <div style={{ padding: "60px 6vw", borderTop: `1px solid ${C.inkFaint}` }}>
        <FadeIn>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "24px" }}>ARCHIVE — ALL CASES</div>
          {/* Tag filter */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "24px" }}>
            {allTags.slice(0, 12).map(tag => (
              <button key={tag} onClick={() => setActiveFilter(tag)} style={{
                background: activeFilter === tag ? C.ink : "none",
                border: `1px solid ${activeFilter === tag ? C.ink : C.inkFaint}`,
                color: activeFilter === tag ? C.bg : C.inkMid,
                padding: "4px 12px", fontSize: "11px", letterSpacing: "0.15em",
                cursor: "pointer", fontFamily: C.mono, transition: "all 0.15s",
              }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "1px", background: C.inkFaint }}>
            {filteredArchive.map(c => (
              <ArchiveCard key={c.id} caseData={c} onClick={() => setSelectedArchive(selectedArchive?.id === c.id ? null : c)} />
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Expanded archive case — FadeIn外に出してFeaturedCaseの追尾バーが正しく動くように */}
      {selectedArchive && (
        <div ref={archiveExpandedRef} style={{ animation: "fadeUp 0.4s ease", borderTop: `1px solid ${C.inkFaint}` }}>
          <FeaturedCase key={selectedArchive.id} caseData={selectedArchive} />
          <div style={{ padding: "16px 6vw 40px" }}>
            <button onClick={() => setSelectedArchive(null)} style={{ background: "none", border: `1px solid ${C.inkFaint}`, fontSize: "11px", color: C.inkDim, cursor: "pointer", fontFamily: C.mono, letterSpacing: "0.2em", padding: "6px 14px" }}>
              ← 閉じる
            </button>
          </div>
        </div>
      )}
      </div>{/* /casesBody */}
    </section>
  );
}

// --- PROFILE ---
function ProfileSection() {
  return (
    <section style={{ padding: "100px 10vw", background: C.surface, borderTop: `1px solid ${C.inkFaint}` }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "40px" }}>04 — PROFILE</div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "22px", color: C.bg, fontFamily: C.serif }}>W</span>
            </div>
            <div>
              <div style={{ fontSize: "20px", color: C.ink, fontFamily: C.serif, marginBottom: "4px", letterSpacing: "0.06em" }}>和田 祥明</div>
              <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.mono, letterSpacing: "0.25em", marginBottom: "24px" }}>
                Independent Researcher / Business Architect — Fukuoka
              </div>
              <div style={{ fontSize: "13px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9, letterSpacing: "0.04em", marginBottom: "24px" }}>
                情報の劣化を構造で止める。<br />
                依頼された問いを解く前に、問いそのものを設計し直す。<br /><br />
                デザイン思考とシステム思考のDual-core processingを実践。<br />
                予測不可能な市場において、事業を自律的に動く構造に変える。
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {["事業設計", "新規事業", "組織設計", "MVP", "スクラム", "BizDev", "エンタープライズ営業", "SI", "アブダクション推論"].map(t => (
                  <span key={t} style={{ fontSize: "11px", color: C.inkDim, padding: "3px 9px", border: `1px solid ${C.inkFaint}`, fontFamily: C.mono, letterSpacing: "0.1em" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// --- CONTACT ---
function ContactSection() {
  return (
    <section style={{ padding: "100px 10vw 80px", background: C.bg, borderTop: `1px solid ${C.inkFaint}` }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: "11px", letterSpacing: "0.5em", color: C.inkDim, fontFamily: C.mono, marginBottom: "20px" }}>05 — CONTACT</div>
          <div style={{ fontSize: "clamp(20px,3vw,32px)", color: C.ink, fontFamily: C.serif, lineHeight: 1.4, marginBottom: "12px" }}>
            この問いを、<br />一緒に解きませんか。
          </div>
          <div style={{ fontSize: "11px", color: C.inkDim, fontFamily: C.serif, letterSpacing: "0.06em", marginBottom: "40px" }}>
            事業の構造的な問いであれば、業種・規模を問わず対話します。
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <ContactForm diagnosisInput="" />
        </FadeIn>
      </div>
    </section>
  );
}

// ── GLOBAL NAV for Portfolio ──
function PortfolioNav({ onGoToDiagnosis }) {
  const [active, setActive] = useState("TOP");
  const [menuOpen, setMenuOpen] = useState(false);
  const sections = ["TOP", "PHILOSOPHY", "CASES", "PROFILE", "CONTACT"];

  useEffect(() => {
    const handleScroll = () => {
      const anchors = sections.map(s => document.getElementById(`section-${s}`));
      const scrollY = window.scrollY + window.innerHeight * 0.4;
      let current = "TOP";
      anchors.forEach(el => {
        if (el && el.offsetTop <= scrollY) current = el.getAttribute("data-section");
      });
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (sectionId) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, pointerEvents: "none" }}>
      {/* Left: W icon + Page1戻るボタン */}
      <div style={{ position: "absolute", top: "14px", left: "20px", pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
          <span style={{ fontSize: "13px", color: C.bg, fontFamily: C.serif, letterSpacing: "-0.02em" }}>W</span>
        </div>
        <button onClick={onGoToDiagnosis} style={{
          background: `${C.bg}e8`, border: `1px solid ${C.inkFaint}`, padding: "5px 12px",
          cursor: "pointer", fontFamily: C.mono, fontSize: "11px", letterSpacing: "0.25em",
          color: C.inkMid, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: "6px",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.color = C.ink; e.currentTarget.style.borderColor = C.ink; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.inkMid; e.currentTarget.style.borderColor = C.inkFaint; }}
        >
          ← DIAGNOSE
        </button>
      </div>

      {/* Right: current section indicator + menu */}
      <div style={{ position: "absolute", top: "16px", right: "20px", pointerEvents: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.35em", color: C.inkDim, fontFamily: C.mono, background: `${C.bg}e0`, padding: "4px 10px", backdropFilter: "blur(8px)", border: `1px solid ${C.inkFaint}` }}>
          {active}
        </div>
        <button onClick={() => setMenuOpen(v => !v)} style={{ background: `${C.bg}e0`, border: `1px solid ${C.inkFaint}`, padding: "6px 10px", cursor: "pointer", fontFamily: C.mono, fontSize: "11px", letterSpacing: "0.3em", color: C.ink, backdropFilter: "blur(8px)" }}>
          {menuOpen ? "✕" : "≡ MENU"}
        </button>
        {menuOpen && (
          <div style={{ position: "absolute", top: "40px", right: 0, background: C.bg, border: `1px solid ${C.inkFaint}`, borderTop: `2px solid ${C.ink}`, minWidth: "160px", animation: "fadeUp 0.2s ease", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            {sections.map(s => (
              <button key={s} onClick={() => scrollTo(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", borderBottom: `1px solid ${C.inkFaint}`, fontSize: "11px", letterSpacing: "0.25em", color: active === s ? C.accent : C.ink, fontFamily: C.mono, cursor: "pointer" }}>
                {s}
                {active === s && <span style={{ float: "right", color: C.accent }}>◆</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioPage({ onGoToDiagnosis }) {
  return (
    <div style={{ background: C.bg, fontFamily: C.mono, color: C.ink }}>
      <div id="section-TOP" data-section="TOP"><HeroSection /></div>
      <div id="section-PHILOSOPHY" data-section="PHILOSOPHY"><PhilosophySection /></div>
      <div id="section-CASES" data-section="CASES"><CasesSection /></div>
      <div id="section-PROFILE" data-section="PROFILE"><ProfileSection /></div>
      <div id="section-CONTACT" data-section="CONTACT"><ContactSection /></div>
      <div style={{ height: "3px", background: C.ink }} />
    </div>
  );
}

// ============================================================
// ROOT — PAGE MANAGER
// ============================================================
export default function App() {
  const [page, setPage] = useState("diagnosis");
  const [transitioning, setTransitioning] = useState(false);

  const goToPortfolio = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setPage("portfolio");
      setTransitioning(false);
      window.scrollTo({ top: 0 });
    }, 500);
  }, []);

  const goToDiagnosis = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setPage("diagnosis");
      setTransitioning(false);
      window.scrollTo({ top: 0 });
    }, 400);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes orbFloat { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,28px) scale(1.12)} }
        @keyframes countUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus, input:focus { outline: none; }
        textarea::placeholder, input::placeholder { color: #7a9ab5; font-style: italic; }
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #7a9ab5; border-radius: 2px; }
        ::-webkit-scrollbar-track { background: #e2edf5; }
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          .case-step-grid { grid-template-columns: 1fr !important; }
          .overview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {page === "portfolio" && <PortfolioNav onGoToDiagnosis={goToDiagnosis} />}
      <div style={{
        opacity: transitioning ? 0 : 1,
        ...(page === "diagnosis"
          ? { transform: transitioning ? "translateX(-3%)" : "translateX(0)", transition: "transform 0.5s ease, opacity 0.5s ease" }
          : { transition: "opacity 0.5s ease" }
        ),
      }}>
        {page === "diagnosis" && <DiagnosisPage onGoToPortfolio={goToPortfolio} />}
        {page === "portfolio" && <PortfolioPage onGoToDiagnosis={goToDiagnosis} />}
      </div>
    </div>
  );
}
