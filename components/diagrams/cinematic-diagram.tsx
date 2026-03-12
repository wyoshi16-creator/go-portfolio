"use client";
import { DiagramOutcome } from "./diagram-outcome";
import { DiagramStructure } from "./diagram-structure";
import { DiagramTransform } from "./diagram-transform";
import { DiagramBeforeAfter } from "./diagram-before-after";
import { DiagramTension } from "./diagram-tension";
import { DiagramQuestion } from "./diagram-question";
import { DiagramFlow } from "./diagram-flow";

interface Step { text: string; label: string; }

export function CinematicDiagram({ type, step, phaseColor, isActive }: { type: string; step: Step; phaseColor: string; isActive: boolean }) {
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
