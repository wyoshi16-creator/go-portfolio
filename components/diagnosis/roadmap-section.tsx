"use client";
import React, { useState } from "react";
import { C } from "@/lib/design-tokens";
import { PHASES } from "@/lib/phases";

interface RoadmapSectionProps {
  onGoToPortfolio: () => void;
}

const roadmapData: Record<string, { question: string; tools: string[]; output: string; desc: string }> = {
  discovery:  { question: "何が本当の問いか？", tools: ["行動観察", "ステークホルダーマップ", "5 Whys", "問い設定WS"], output: "問いの再定義", desc: "表面の依頼と本当の問いは違う。解くべき問いはこれで正しいか？を疑うことから始める。" },
  definition: { question: "どう解くべきか？",   tools: ["バリューチェーン分析", "ビジネスモデルキャンバス", "制約理論", "OKR設計"], output: "事業の骨格設計", desc: "問いが定まったら解法の構造を設計する。ここが曖昧なまま進むと後続のすべてが歪む。" },
  design:     { question: "何を作るか？",       tools: ["ジョブ理論", "プロトタイピング", "ユーザーテスト", "MVP設計"], output: "検証済み仮説", desc: "骨格を具体的な形に落とす。完璧なものより仮説を検証できるものを優先する。" },
  delivery:   { question: "どう届けるか？",     tools: ["スクラム", "OKR実行管理", "データ計測設計", "組織権限設計"], output: "動く事業", desc: "設計を市場に投入する。重要なのは速度より意思決定の質。" },
  growth:     { question: "次の問いは何か？",   tools: ["プラットフォーム設計", "LTV最適化", "隣接市場分析", "次の問い設定"], output: "自律する事業機械", desc: "事業が動き始めたら次の問いを見つける。自律化が本質だ。" },
};

export function RoadmapSection({ onGoToPortfolio }: RoadmapSectionProps) {
  const [activeId, setActiveId] = useState("discovery");
  const ph = PHASES.find(p => p.id === activeId);
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
