import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export type RuntimeHitDefPriorityProfile = RuntimeCompatibilityProfile;

export type RuntimeHitDefSpritePrioritySource = "authored" | "mugen-1.1-default" | "preserve-current";

export type RuntimeResolvedHitDefSpritePriority = {
  value: number;
  source: RuntimeHitDefSpritePrioritySource;
  supported: boolean;
};

export type RuntimeResolvedHitDefSpritePriorities = {
  profile: RuntimeHitDefPriorityProfile;
  p1: RuntimeResolvedHitDefSpritePriority;
  p2: RuntimeResolvedHitDefSpritePriority;
};

export function resolveRuntimeHitDefSpritePriorities(input: {
  profile: RuntimeHitDefPriorityProfile;
  authored: { p1?: number; p2?: number };
  current: { p1: number; p2: number };
}): RuntimeResolvedHitDefSpritePriorities {
  return {
    profile: input.profile,
    p1: resolvePriority(input.profile, input.authored.p1, input.current.p1, 1),
    p2: resolvePriority(input.profile, input.authored.p2, input.current.p2, 0),
  };
}

function resolvePriority(
  profile: RuntimeHitDefPriorityProfile,
  authored: number | undefined,
  current: number,
  mugenDefault: number,
): RuntimeResolvedHitDefSpritePriority {
  if (authored !== undefined) {
    return { value: authored, source: "authored", supported: true };
  }
  if (profile === "mugen-1.1") {
    return { value: mugenDefault, source: "mugen-1.1-default", supported: true };
  }
  return { value: current, source: "preserve-current", supported: false };
}
