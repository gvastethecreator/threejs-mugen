import type { DemoFighterDefinition } from "./demoFighters";

export const RUNTIME_DEFAULT_HIT_FLAG = "MAF";

export function runtimeDefaultHitFlagForSource(
  source: DemoFighterDefinition["source"],
): string | undefined {
  return source === "imported" ? RUNTIME_DEFAULT_HIT_FLAG : undefined;
}
