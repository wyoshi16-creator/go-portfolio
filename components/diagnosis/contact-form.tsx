"use client";
import React, { useState } from "react";
import { C } from "@/lib/design-tokens";

interface ContactFormProps {
  diagnosisInput: string;
  onSent?: () => void;
}

export function ContactForm({ diagnosisInput, onSent }: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
        {([["お名前（任意）", name, setName, "山田 太郎"], ["メール（任意）", email, setEmail, "your@email.com"]] as const).map(([label, val, set, ph]) => (
          <div key={label as string}>
            <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: C.inkDim, fontFamily: C.mono, marginBottom: "5px" }}>{label as string}</div>
            <input value={val as string} onChange={e => (set as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} placeholder={ph as string}
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
