export interface Phase {
  id: string;
  label: string;
  sub: string;
  color: string;
}

export const PHASES: Phase[] = [
  { id: "discovery",  label: "Discovery",  sub: "課題の発見",   color: "#4a7c59" },
  { id: "definition", label: "Definition", sub: "構造の設計",   color: "#2d6a9f" },
  { id: "design",     label: "Design",     sub: "解の具体化",   color: "#7a3b9e" },
  { id: "delivery",   label: "Delivery",   sub: "実装と検証",   color: "#b8740a" },
  { id: "growth",     label: "Growth",     sub: "拡大と最適化", color: "#8b1a1a" },
];
