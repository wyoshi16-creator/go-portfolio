"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CASES } from "@/lib/cases-data";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";
import { useInView } from "@/lib/hooks/use-in-view";

// ── Gallery items ──
const galleryItems = CASES.map((c) => ({
  id: c.id,
  year: c.year,
  phase: c.phase,
  title: c.title,
  tags: c.tags,
  color: c.thumbnailColor,
  symbol: c.thumbnailSymbol ?? "",
  featured: c.featured,
  concept: c.overview?.concept ?? null,
}));

// ── Featured Card (2-column span) ──
function FeaturedCard({ item, index }: { item: typeof galleryItems[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const phase = PHASES.find((p) => p.id === item.phase);
  const phaseColor = phase?.color ?? C.accent;

  return (
    <div
      ref={ref}
      style={{
        gridColumn: "span 2",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`,
      }}
    >
      <Link href={`/cases/${item.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? C.bg : C.surface,
            border: `1px solid ${hovered ? C.inkMid : C.inkFaint}`,
            borderLeft: `4px solid ${phaseColor}`,
            padding: "32px 36px",
            cursor: "pointer",
            transition: "all 0.25s ease",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "32px",
            position: "relative",
            overflow: "hidden",
            boxShadow: hovered ? `0 4px 24px ${phaseColor}12` : "none",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {/* Background watermark */}
          <div style={{
            position: "absolute",
            right: "24px",
            bottom: "-8px",
            fontSize: "clamp(64px,10vw,120px)",
            fontFamily: C.serif,
            fontWeight: "bold",
            color: hovered ? `${phaseColor}12` : `${phaseColor}08`,
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            transition: "color 0.3s ease",
          }}>
            {item.symbol}
          </div>

          {/* Left: content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", minHeight: "140px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontSize: "10px", letterSpacing: "0.3em",
                    color: C.surface, fontFamily: C.mono,
                    textTransform: "uppercase",
                    background: phaseColor, padding: "2px 10px",
                  }}>
                    {item.phase}
                  </span>
                  <span style={{ fontSize: "10px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono }}>
                    {item.year}
                  </span>
                </div>
                <span style={{ fontSize: "9px", letterSpacing: "0.25em", color: phaseColor, fontFamily: C.mono, opacity: 0.6 }}>
                  FEATURED
                </span>
              </div>
              <div style={{
                fontSize: "clamp(17px, 2vw, 22px)",
                color: hovered ? C.ink : C.inkMid,
                fontFamily: C.serif,
                lineHeight: 1.5,
                letterSpacing: "0.02em",
                transition: "color 0.2s ease",
                marginBottom: "12px",
              }}>
                {item.title}
              </div>
              {item.concept && (
                <div style={{
                  fontSize: "12px",
                  color: C.inkDim,
                  fontFamily: C.serif,
                  lineHeight: 1.8,
                  maxWidth: "480px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.concept}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "16px" }}>
              {item.tags.slice(0, 4).map((t) => (
                <span key={t} style={{
                  fontSize: "9px", letterSpacing: "0.15em",
                  color: C.inkDim, padding: "3px 10px",
                  border: `1px solid ${C.inkFaint}`,
                  fontFamily: C.mono,
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: arrow indicator */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "40px", flexShrink: 0,
            opacity: hovered ? 1 : 0.3,
            transition: "opacity 0.2s ease",
          }}>
            <span style={{ fontSize: "18px", color: phaseColor, fontFamily: C.mono }}>→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Standard Card ──
function GalleryCard({ item, index }: { item: typeof galleryItems[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
            background: hovered ? C.bg : C.surface,
            border: `1px solid ${hovered ? C.inkMid : C.inkFaint}`,
            borderTop: `3px solid ${phaseColor}`,
            padding: "28px 24px 24px",
            cursor: "pointer",
            transition: "all 0.25s ease",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
            minHeight: "200px",
            boxShadow: hovered ? `0 4px 20px ${phaseColor}10` : "none",
            transform: hovered ? "translateY(-2px)" : "translateY(0)",
          }}
        >
          {/* Watermark symbol */}
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

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <span style={{
                fontSize: "11px", letterSpacing: "0.3em",
                color: phaseColor, fontFamily: C.mono,
                textTransform: "uppercase",
              }}>
                {item.phase}
              </span>
              <span style={{
                fontSize: "10px", letterSpacing: "0.2em",
                color: C.inkDim, fontFamily: C.mono,
              }}>
                {item.year}
              </span>
            </div>
            <div style={{
              fontSize: "clamp(14px, 1.6vw, 18px)",
              color: hovered ? C.ink : C.inkMid,
              fontFamily: C.serif,
              lineHeight: 1.6,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}>
              {item.title}
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "20px" }}>
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} style={{
                fontSize: "9px", letterSpacing: "0.15em",
                color: C.inkDim, padding: "3px 9px",
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

  const featuredItems = filtered.filter(c => c.featured);
  const standardItems = filtered.filter(c => !c.featured);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink }}>

      {/* Nav */}
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

      {/* Intro + Phase filter */}
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
          fontSize: "clamp(20px,2.4vw,28px)",
          color: C.ink, fontFamily: C.serif,
          lineHeight: 1.5, letterSpacing: "0.02em",
          marginBottom: "32px",
        }}>
          案件を選んで詳細をご覧ください。
        </div>

        {/* Phase filter */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActivePhase(null)}
            style={{
              fontSize: "10px", letterSpacing: "0.3em",
              fontFamily: C.mono, padding: "7px 18px",
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
                fontSize: "10px", letterSpacing: "0.3em",
                fontFamily: C.mono, padding: "7px 18px",
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

      {/* Featured section */}
      {featuredItems.length > 0 && (
        <div style={{
          padding: "clamp(24px,4vh,48px) clamp(24px,8vw,120px) 0",
        }}>
          <div style={{
            fontSize: "9px", letterSpacing: "0.5em",
            color: C.inkDim, fontFamily: C.mono, marginBottom: "16px",
          }}>
            FEATURED CASES
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}>
            {featuredItems.map((item, i) => (
              <FeaturedCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Standard grid */}
      {standardItems.length > 0 && (
        <div style={{
          padding: "clamp(32px,5vh,64px) clamp(24px,8vw,120px)",
        }}>
          {featuredItems.length > 0 && (
            <div style={{
              fontSize: "9px", letterSpacing: "0.5em",
              color: C.inkDim, fontFamily: C.mono, marginBottom: "16px",
            }}>
              ALL CASES
            </div>
          )}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {standardItems.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          padding: "clamp(80px,12vh,160px) clamp(24px,8vw,120px)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "14px", color: C.inkDim, fontFamily: C.serif, marginBottom: "12px" }}>
            該当するケースがありません
          </div>
          <button
            onClick={() => setActivePhase(null)}
            style={{
              fontSize: "11px", color: C.accent, fontFamily: C.mono,
              background: "none", border: `1px solid ${C.accent}40`,
              padding: "8px 20px", cursor: "pointer",
            }}
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </main>
  );
}
