"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CASES } from "@/lib/cases-data";

// トップページと共通のデザイントークン
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

const PHASES = [
  { id: "discovery",  label: "Discovery",  color: "#4a7c59" },
  { id: "definition", label: "Definition", color: "#2d6a9f" },
  { id: "design",     label: "Design",     color: "#7a3b9e" },
  { id: "delivery",   label: "Delivery",   color: "#b8740a" },
  { id: "growth",     label: "Growth",     color: "#8b1a1a" },
];

const galleryItems = CASES.map((c) => ({
  id:     c.id,
  year:   c.year,
  phase:  c.phase,
  title:  c.title,
  tags:   c.tags,
  color:  c.thumbnailColor,
  symbol: c.thumbnailSymbol ?? "",
}));

function useInView(ref, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function GalleryCard({ item, index }: { item: typeof galleryItems[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref);
  const phase = PHASES.find((p) => p.id === item.phase);
  const phaseColor = phase?.color ?? C.accent;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${(index % 4) * 0.07}s, transform 0.6s ease ${(index % 4) * 0.07}s`,
      }}
    >
      <Link href={`/cases/${item.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            aspectRatio: "1 / 1",
            background: hovered ? C.bg : C.surface,
            border: `1px solid ${hovered ? C.inkMid : C.inkFaint}`,
            borderTop: `3px solid ${phaseColor}`,
            padding: "28px 24px 24px",
            cursor: "pointer",
            transition: "background 0.2s ease, border-color 0.2s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 背景: symbolをウォーターマークとして */}
          <div style={{
            position: "absolute",
            right: "-8px",
            bottom: "-12px",
            fontSize: "clamp(52px,8vw,88px)",
            fontFamily: C.serif,
            fontWeight: "bold",
            color: hovered ? `${phaseColor}18` : `${phaseColor}0d`,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            transition: "color 0.3s ease",
          }}>
            {item.symbol}
          </div>

          {/* 上部: year + phase */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "16px",
            }}>
              <span style={{
                fontSize: "9px",
                letterSpacing: "0.35em",
                color: phaseColor,
                fontFamily: C.mono,
                textTransform: "uppercase",
              }}>
                {item.phase}
              </span>
              <span style={{
                fontSize: "9px",
                letterSpacing: "0.2em",
                color: C.inkDim,
                fontFamily: C.mono,
              }}>
                {item.year}
              </span>
            </div>

            {/* タイトル */}
            <div style={{
              fontSize: "clamp(13px, 1.4vw, 16px)",
              color: hovered ? C.ink : C.inkMid,
              fontFamily: C.serif,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}>
              {item.title}
            </div>
          </div>

          {/* 下部: tags */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} style={{
                fontSize: "8px",
                letterSpacing: "0.15em",
                color: C.inkDim,
                padding: "2px 7px",
                border: `1px solid ${C.inkFaint}`,
                fontFamily: C.mono,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function CasesGalleryPage() {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const filtered = activePhase
    ? galleryItems.filter((c) => c.phase === activePhase)
    : galleryItems;

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink }}>

      {/* Nav — トップページと同じスタイル */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 clamp(24px, 8vw, 120px)",
        height: "52px",
        background: `rgba(240,244,248,0.92)`,
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.inkFaint}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{
          fontSize: "11px", letterSpacing: "0.5em",
          color: C.inkDim, fontFamily: C.mono, textDecoration: "none",
        }}>
          ← 号
        </Link>
        <div style={{ fontSize: "10px", letterSpacing: "0.45em", color: C.inkMid, fontFamily: C.mono }}>
          CASES
        </div>
      </nav>

      {/* Intro + フェーズフィルター */}
      <div style={{
        padding: "clamp(40px,6vh,72px) clamp(24px,8vw,120px) clamp(24px,4vh,40px)",
        borderBottom: `1px solid ${C.inkFaint}`,
      }}>
        <div style={{
          fontSize: "11px", letterSpacing: "0.5em",
          color: C.inkDim, fontFamily: C.mono, marginBottom: "10px",
        }}>
          実績紹介 — {galleryItems.length} CASES
        </div>
        <div style={{
          fontSize: "clamp(18px,2.2vw,26px)",
          color: C.ink, fontFamily: C.serif,
          lineHeight: 1.5, letterSpacing: "0.02em",
          marginBottom: "32px",
        }}>
          案件を選んで詳細をご覧ください。
        </div>

        {/* フェーズフィルター */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActivePhase(null)}
            style={{
              fontSize: "9px", letterSpacing: "0.3em",
              fontFamily: C.mono, padding: "5px 14px",
              border: `1px solid ${activePhase === null ? C.ink : C.inkFaint}`,
              background: activePhase === null ? C.ink : "transparent",
              color: activePhase === null ? C.bg : C.inkDim,
              cursor: "pointer", transition: "all 0.15s ease",
            }}
          >
            ALL
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(activePhase === p.id ? null : p.id)}
              style={{
                fontSize: "9px", letterSpacing: "0.3em",
                fontFamily: C.mono, padding: "5px 14px",
                border: `1px solid ${activePhase === p.id ? p.color : C.inkFaint}`,
                borderTop: `2px solid ${p.color}`,
                background: activePhase === p.id ? `${p.color}14` : "transparent",
                color: activePhase === p.id ? p.color : C.inkDim,
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {p.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        padding: "clamp(32px,5vh,64px) clamp(24px,8vw,120px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "2px",
      }}>
        {filtered.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i} />
        ))}
      </div>

    </main>
  );
}
