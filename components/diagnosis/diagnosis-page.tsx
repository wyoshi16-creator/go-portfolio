"use client";
import React, { useState, useEffect, useCallback } from "react";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";
import { Typewriter } from "@/components/ui/typewriter";
import { PhasePipeline } from "@/components/charts/phase-pipeline";
import { ContactForm } from "./contact-form";
import { PhaseMethodologyPanel } from "./phase-methodology-panel";
import { RoadmapSection } from "./roadmap-section";

interface DiagnosisPageProps {
  onGoToPortfolio: () => void;
}

export function DiagnosisPage({ onGoToPortfolio }: DiagnosisPageProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [ctaMode, setCtaMode] = useState<string | null>(null);
  const MAX = 50;

  const EXAMPLES = [
    "新機能をリリースしても売上が変わらない",
    "チームはがんばっているのに成果が出ない",
    "顧客インタビューをしても何を作ればいいかわからない",
    "PMF前後でやることが変わって組織が混乱している",
  ];

  const MAX_CHARS = 300;
  const MIN_CHARS = 15;

  const validateInput = (text: string) => {
    const t = text.trim();
    if (t.length < MIN_CHARS) return `${MIN_CHARS}文字以上入力してください（現在${t.length}文字）`;
    if (t.length > MAX_CHARS) return `${MAX_CHARS}文字以内で入力してください`;
    if (/(.)\1{9,}/.test(t)) return "有効な内容を入力してください";
    if (/https?:\/\//.test(t)) return "URLは入力できません";
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
  const subPhases = result ? (result.sub_phases || []).filter((id: string) => id !== result.phase) : [];

  const [showInsight, setShowInsight] = useState(false);
  const [showQ, setShowQ] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (!result) { setShowInsight(false); setShowQ(false); setShowAction(false); setShowCTA(false); setCtaMode(null); }
  }, [result]);

  return (
    <div style={{ background: C.surface, minHeight: "100vh", fontFamily: C.mono, color: C.ink }}>
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
            <div style={{ marginBottom: "24px", padding: "12px 16px", background: `${C.accent}08`, border: `1px solid ${C.accent}30`, borderLeft: `3px solid ${C.accent}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                {PHASES.map(ph => <div key={ph.id} style={{ width: "4px", height: "4px", borderRadius: "50%", background: animPhase === ph.id ? ph.color : C.inkFaint, transition: "background 0.3s" }} />)}
              </div>
              <div style={{ fontSize: "11px", color: C.accent, fontFamily: C.serif, lineHeight: 1.6 }}>
                事業の状況を入力すると、AIが5フェーズの構造モデルで診断します。
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ marginBottom: "16px", padding: "12px 14px", background: C.surfaceAlt, border: `1px solid ${C.inkFaint}`, borderLeft: `3px solid ${C.inkDim}` }}>
                <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: C.inkDim, fontFamily: C.mono, marginBottom: "6px" }}>ご入力の前に</div>
                <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: C.serif, lineHeight: 1.9 }}>
                  ・<strong>個人情報・企業名・固有名詞は入力しないでください</strong><br />
                  ・事業課題・組織の状況を日本語でご記入ください<br />
                  ・15〜300文字を目安に、状況を簡潔に説明してください
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "12px", letterSpacing: "0.35em", color: C.ink, fontFamily: C.mono, fontWeight: "bold" }}>DESCRIBE YOUR SITUATION</div>
                <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${C.accent}50, transparent)` }} />
              </div>

              <textarea value={input} onChange={e => setInput(e.target.value.slice(0, MAX_CHARS))}
                placeholder={"今、事業のどこで詰まっていますか？\n症状・状況・感じていること、何でも構いません。\n（個人情報・企業名は含めないでください）"}
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

            <div>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", background: `${C.accent}06`, border: `1px solid ${C.accent}20` }}>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {PHASES.map((ph) => <div key={ph.id} style={{ width: "6px", height: "6px", borderRadius: "50%", background: animPhase === ph.id ? ph.color : C.inkFaint, transition: "background 0.2s", transform: animPhase === ph.id ? "scale(1.4)" : "scale(1)" }} />)}
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
