import type { MugenStageDefinition } from "../model/MugenStage";
import type { DemoFighterDefinition } from "./demoFighters";
import { MatchWorld } from "./MatchWorld";
import type { RuntimeTraceGate, RuntimeTraceInputFrame } from "./RuntimeTrace";
import { expandRuntimeTraceScript, runRuntimeTrace } from "./RuntimeTrace";
import type { RuntimeTraceArtifact } from "./RuntimeTraceArtifact";
import { createRuntimeTraceArtifact } from "./RuntimeTraceArtifact";

export type MatchTraceArtifactInput = {
  p1: DemoFighterDefinition;
  p2: DemoFighterDefinition;
  stage: MugenStageDefinition;
  generatedAt?: string;
};

export function createMatchSmokeTraceArtifact(input: MatchTraceArtifactInput): RuntimeTraceArtifact {
  const script = createMatchSmokeScript(input.p1);
  const trace = runRuntimeTrace(new MatchWorld({ p1: input.p1, p2: input.p2, stage: input.stage }), script, {
    label: `${input.p1.id}-vs-${input.p2.id}-smoke`,
  });
  const gates = createMatchSmokeGates(input.p1);
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: input.generatedAt,
    target: {
      id: `${input.p1.id}-vs-${input.p2.id}-${input.stage.id}-trace`,
      label: `${input.p1.displayName} vs ${input.p2.displayName} on ${input.stage.displayName}`,
      source: artifactSource(input.p1, input.p2),
      notes: [
        input.p1.source === "imported"
          ? "Imported smoke script presses MUGEN x to exercise the current CMD State -1 bridge when available."
          : "Native smoke script verifies a deterministic playable match surface without claiming imported MUGEN compatibility.",
      ],
    },
    gates,
  });
}

function createMatchSmokeScript(p1: DemoFighterDefinition): RuntimeTraceInputFrame[] {
  if (p1.source === "imported") {
    return expandRuntimeTraceScript([
      { label: "imported-x", frames: 12, p1: ["x"], p2: [] },
      { label: "settle", frames: 2, p1: [], p2: [] },
    ]);
  }
  return expandRuntimeTraceScript([
    { label: "native-idle", frames: 2, p1: [], p2: [] },
    { label: "native-step-forward", frames: 4, p1: ["F"], p2: [] },
    { label: "native-neutral", frames: 2, p1: [], p2: [] },
  ]);
}

function createMatchSmokeGates(p1: DemoFighterDefinition): RuntimeTraceGate[] {
  if (p1.source === "imported") {
    return [
      {
        label: "imported-x-route-smoke",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredActiveCommands: ["x"],
      },
    ];
  }
  return [
    {
      label: "native-runtime-smoke",
      requiredActorSources: ["demo"],
      requiredActorKinds: ["player"],
    },
  ];
}

function artifactSource(p1: DemoFighterDefinition, p2: DemoFighterDefinition): RuntimeTraceArtifact["target"]["source"] {
  const sources = new Set([p1.source ?? "demo", p2.source ?? "demo"]);
  if (sources.has("imported") && sources.size > 1) {
    return "mixed";
  }
  if (sources.has("imported")) {
    return "imported";
  }
  if (sources.has("demo")) {
    return "native";
  }
  return "unknown";
}
