import type { RuntimeProjectile } from "./ProjectileSystem";
import {
  RuntimeHelperProjectileTargetWorld,
  type RuntimeHelperProjectileTargetDefender,
  type RuntimeHelperProjectileTargetInput,
  type RuntimeHelperProjectileTargetOwner,
  type RuntimeHelperProjectileTargetResult,
} from "./RuntimeHelperProjectileTargetSystem";
import type { RuntimeTargetWorld } from "./TargetSystem";

export type RuntimeMatchHelperProjectileTargetInput<
  TOwner extends RuntimeHelperProjectileTargetOwner,
  TDefender extends RuntimeHelperProjectileTargetDefender,
> = {
  owner: TOwner;
  defender: TDefender;
  projectile: RuntimeProjectile;
  targetWorld: RuntimeTargetWorld;
};

type RuntimeMatchHelperProjectileTargetDelegate = {
  remember: (input: RuntimeHelperProjectileTargetInput) => RuntimeHelperProjectileTargetResult;
};

export class RuntimeMatchHelperProjectileTargetWorld {
  constructor(
    private readonly helperProjectileTargetWorld: RuntimeMatchHelperProjectileTargetDelegate = new RuntimeHelperProjectileTargetWorld(),
  ) {}

  remember<
    TOwner extends RuntimeHelperProjectileTargetOwner,
    TDefender extends RuntimeHelperProjectileTargetDefender,
  >(
    input: RuntimeMatchHelperProjectileTargetInput<TOwner, TDefender>,
  ): RuntimeHelperProjectileTargetResult {
    return this.helperProjectileTargetWorld.remember(input);
  }
}
