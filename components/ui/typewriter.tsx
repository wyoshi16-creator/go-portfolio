"use client";
import { useState, useEffect } from "react";
import { C } from "@/lib/design-tokens";

export function Typewriter({ text, speed = 22, onDone, style = {} }: { text: string; speed?: number; onDone?: () => void; style?: React.CSSProperties }) {
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
