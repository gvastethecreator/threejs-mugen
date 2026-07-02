import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { rememberRuntimeHelperTarget, type RuntimeHelper } from "./HelperSystem";
import type { RuntimeProjectile } from "./ProjectileSystem";
import type { RuntimeTargetWorld } from "./TargetSystem";

export type RuntimeHelperProjectileTargetOwner = {
  id: string;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "helpers">;
};

export type RuntimeHelperProjectileTargetDefender = {
  id: string;
};

export type RuntimeHelperProjectileTargetInput = {
  owner: RuntimeHelperProjectileTargetOwner;
  defender: RuntimeHelperProjectileTargetDefender;
  projectile: RuntimeProjectile;
  targetWorld: RuntimeTargetWorld;
};

export type RuntimeHelperProjectileTargetResult =
  | { remembered: true; helper: RuntimeHelper; targetId: number | undefined }
  | { remembered: false; reason: "owner-projectile" | "missing-helper" };

export class RuntimeHelperProjectileTargetWorld {
  remember(input: RuntimeHelperProjectileTargetInput): RuntimeHelperProjectileTargetResult {
    if (input.projectile.parentId === input.owner.id) {
      return { remembered: false, reason: "owner-projectile" };
    }

    const helper = input.owner.effectActorWorld
      .helpers(input.owner.id)
      .find((candidate) => candidate.serialId === input.projectile.parentId);
    if (!helper) {
      return { remembered: false, reason: "missing-helper" };
    }

    rememberRuntimeHelperTarget(helper, input.defender.id, input.projectile.targetId, input.targetWorld);
    return { remembered: true, helper, targetId: input.projectile.targetId };
  }
}
