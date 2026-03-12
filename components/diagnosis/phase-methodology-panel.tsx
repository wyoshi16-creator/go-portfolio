"use client";
import React, { useState } from "react";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";

interface PhaseMethodologyPanelProps {
  animPhase: string | null;
}

const details: Record<string, {
  question: string;
  desc: string;
  tools: string[];
  output: string;
  deliverable: string;
  expertise: { skill: string; pct: number }[];
}> = {
  discovery: {
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

export function PhaseMethodologyPanel({ animPhase }: PhaseMethodologyPanelProps) {
  const [selected, setSelected] = useState("discovery");
  const ph = PHASES.find(p => p.id === selected);
  const d = details[selected];

  return (
    <div>
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

      {ph && d && (
        <div key={selected} style={{ background: C.surface, border: `1px solid ${C.inkFaint}`, borderTop: "none", animation: "fadeUp 0.28s ease" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
            <div style={{ padding: "14px 16px", borderRight: `1px solid ${C.inkFaint}` }}>
              <div style={{ fontSize: "11px", letterSpacing: "0.25em", color: C.inkDim, fontFamily: "'JetBrains Mono','Courier New',monospace", marginBottom: "10px" }}>TOOLS</div>
              {d.tools.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "7px", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: ph.color, flexShrink: 0 }} />
                  <div style={{ fontSize: "11px", color: C.inkMid, fontFamily: "'Georgia','Times New Roman',serif" }}>{t}</div>
                </div>
              ))}
            </div>

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
