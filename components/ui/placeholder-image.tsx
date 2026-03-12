"use client";
import { useRef } from "react";
import { useInView } from "@/lib/hooks/use-in-view";
import { C } from "@/lib/design-tokens";

export function PlaceholderImage({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
