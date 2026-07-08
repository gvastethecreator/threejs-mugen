import type {
  ExplodControllerOp,
  HelperControllerOp,
  ModifyExplodControllerOp,
  ModifyProjectileControllerOp,
  ProjectileControllerOp,
  RemoveExplodControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import type { DemoFighterDefinition } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeExplodSpawnInput } from "./ExplodSystem";
import type { RuntimeProjectileModifyResolver, RuntimeProjectileSpawnInput } from "./ProjectileSystem";
import { findControllerParam } from "./StateProgramExecutor";
import type { CharacterRuntimeState } from "./types";

export type RuntimeEffectSpawnActor = {
  id: string;
  label: string;
  definition: Pick<DemoFighterDefinition, "id" | "animations" | "states" | "localCoord">;
  runtimeProgram?: Pick<RuntimeProgramIr, "states">;
  runtime: Pick<CharacterRuntimeState, "pos" | "facing" | "stateNo" | "animNo" | "attackMultiplier">;
  stateOwner?: RuntimeEffectSpawnActor;
  effectActorWorld: Pick<
    RuntimeEffectActorWorld,
    "spawnExplod" | "removeExplods" | "modifyExplods" | "spawnHelper" | "removeHelpers" | "spawnProjectile" | "modifyProjectiles"
  >;
};

export type RuntimeEffectSpawnControllerDispatchEffect =
  | "explod"
  | "removeexplod"
  | "modifyexplod"
  | "helper"
  | "projectile"
  | "modifyprojectile";

export type RuntimeEffectSpawnControllerDispatchOperation =
  | ExplodControllerOp
  | RemoveExplodControllerOp
  | ModifyExplodControllerOp
  | HelperControllerOp
  | ProjectileControllerOp
  | ModifyProjectileControllerOp;

export type RuntimeEffectSpawnControllerDispatchOptions<TActor extends RuntimeEffectSpawnActor> = {
  actor: TActor;
  opponent: TActor;
  controller: ControllerIr;
  effect: RuntimeEffectSpawnControllerDispatchEffect;
  effectSpawnWorld: RuntimeEffectSpawnWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: RuntimeEffectSpawnControllerDispatchOperation) => void;
  resolveModifyProjectile?: RuntimeProjectileModifyResolver;
};

export type RuntimeEffectSpawnControllerDispatchResult = {
  changed: boolean;
  changedCount: number;
  recordedController: boolean;
  recordedOperation: boolean;
  operation?: RuntimeEffectSpawnControllerDispatchOperation;
};

export function isRuntimeEffectSpawnControllerDispatchEffect(
  effect: string,
): effect is RuntimeEffectSpawnControllerDispatchEffect {
  return (
    effect === "explod" ||
    effect === "removeexplod" ||
    effect === "modifyexplod" ||
    effect === "helper" ||
    effect === "projectile" ||
    effect === "modifyprojectile"
  );
}

export class RuntimeEffectSpawnWorld {
  spawnExplod(
    fighter: RuntimeEffectSpawnActor,
    opponent: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: ExplodControllerOp,
  ): boolean {
    const animNo = operation?.animNo ?? firstNumber(findParam(controller, "anim"));
    if (animNo === undefined) {
      return false;
    }
    const owner = effectSpriteOwner(fighter);
    const action = owner.definition.animations.get(animNo);
    if (!isPlayableAction(action)) {
      return false;
    }
    const localPos = operation?.pos ?? numberPair(findParam(controller, "pos")) ?? [0, 0];
    const postype = operation?.postype ?? findParam(controller, "postype");
    fighter.effectActorWorld.spawnExplod(fighter.id, {
      controller,
      operation,
      ownerId: fighter.id,
      rootId: fighter.id,
      parentId: fighter.id,
      spriteOwnerId: owner.id,
      spriteOwnerDefinitionId: owner.definition.id,
      spriteOwnerLabel: owner.label,
      action,
      animNo,
      pos: resolveEffectSpawnPosition(fighter, opponent, postype, localPos),
      bind: resolveEffectSpawnBind(postype, localPos),
      fallbackFacing: fighter.runtime.facing,
      defaultRemoveTime: actionDuration(action),
    });
    return true;
  }

  removeExplods(
    fighter: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: RemoveExplodControllerOp,
  ): boolean {
    fighter.effectActorWorld.removeExplods(fighter.id, operation?.explodId ?? firstNumber(findParam(controller, "id")));
    return true;
  }

  modifyExplods(
    fighter: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: ModifyExplodControllerOp,
  ): number {
    return fighter.effectActorWorld.modifyExplods(fighter.id, {
      controller,
      operation,
    });
  }

  spawnHelper(
    fighter: RuntimeEffectSpawnActor,
    opponent: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: HelperControllerOp,
  ): boolean {
    const owner = effectSpriteOwner(fighter);
    const stateNo = operation?.stateNo ?? firstNumber(findParam(controller, "stateno") ?? findParam(controller, "value"));
    const state = findActorState(owner, stateNo);
    const animNo = operation?.animNo ?? firstNumber(findParam(controller, "anim")) ?? state?.anim ?? stateNo ?? fighter.runtime.animNo;
    const action = owner.definition.animations.get(animNo);
    if (!isPlayableAction(action)) {
      return false;
    }
    const localPos = operation?.pos ?? numberPair(findParam(controller, "pos")) ?? [0, 0];
    fighter.effectActorWorld.spawnHelper(fighter.id, {
      controller,
      operation,
      ownerId: fighter.id,
      rootId: fighter.id,
      parentId: fighter.id,
      spriteOwnerId: owner.id,
      spriteOwnerDefinitionId: owner.definition.id,
      spriteOwnerLabel: owner.label,
      localCoord: owner.definition.localCoord,
      runtimeProgram: owner.runtimeProgram,
      animations: owner.definition.animations,
      action,
      stateNo,
      animNo,
      pos: resolveEffectSpawnPosition(fighter, opponent, operation?.postype ?? findParam(controller, "postype"), localPos),
      fallbackFacing: fighter.runtime.facing,
    });
    return true;
  }

  removeHelpers(fighter: RuntimeEffectSpawnActor, helperId?: number): number {
    return fighter.effectActorWorld.removeHelpers(fighter.id, helperId);
  }

  spawnProjectile(
    fighter: RuntimeEffectSpawnActor,
    opponent: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: ProjectileControllerOp,
  ): boolean {
    const owner = effectSpriteOwner(fighter);
    const animNo = operation?.projAnim ?? firstNumber(findParam(controller, "projanim") ?? findParam(controller, "anim")) ?? 0;
    const action = owner.definition.animations.get(animNo);
    if (!isPlayableAction(action)) {
      return false;
    }
    const localPos = operation?.offset ?? operation?.pos ?? numberPair(findParam(controller, "offset") ?? findParam(controller, "pos")) ?? [0, 0];
    fighter.effectActorWorld.spawnProjectile(fighter.id, {
      controller,
      operation,
      ownerId: fighter.id,
      rootId: fighter.id,
      parentId: fighter.id,
      spriteOwnerId: owner.id,
      spriteOwnerDefinitionId: owner.definition.id,
      spriteOwnerLabel: owner.label,
      action,
      animNo,
      terminalActions: resolveProjectileTerminalActions(owner, controller, operation),
      pos: resolveEffectSpawnPosition(fighter, opponent, operation?.postype ?? findParam(controller, "postype"), localPos),
      fallbackFacing: fighter.runtime.facing,
      localCoord: owner.definition.localCoord,
      damageScale: fighter.runtime.attackMultiplier,
    });
    return true;
  }

  modifyProjectiles(
    fighter: RuntimeEffectSpawnActor,
    controller: MugenStateController,
    operation?: ModifyProjectileControllerOp,
    resolveModifyProjectile?: RuntimeProjectileModifyResolver,
  ): number {
    return fighter.effectActorWorld.modifyProjectiles(fighter.id, {
      controller,
      operation,
      resolveModifyProjectile,
    });
  }
}

export class RuntimeEffectSpawnControllerDispatchWorld {
  apply<TActor extends RuntimeEffectSpawnActor>(
    options: RuntimeEffectSpawnControllerDispatchOptions<TActor>,
  ): RuntimeEffectSpawnControllerDispatchResult {
    const operation = effectSpawnOperation(options.controller, options.effect);
    options.recordController?.(options.actor, options.controller.source);
    const changedCount = dispatchEffectSpawnOperation(options, operation);
    const changed = changedCount > 0;
    if (changed && operation) {
      options.recordOperation?.(options.actor, operation);
    }
    return {
      changed,
      changedCount,
      operation,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(changed && operation && options.recordOperation),
    };
  }
}

export function resolveEffectSpawnPosition(
  fighter: Pick<RuntimeEffectSpawnActor, "runtime">,
  opponent: Pick<RuntimeEffectSpawnActor, "runtime">,
  postype: string | undefined,
  localPos: [number, number],
): { x: number; y: number } {
  const type = postype?.trim().toLowerCase() ?? "p1";
  if (type === "p2") {
    return { x: opponent.runtime.pos.x + localPos[0] * opponent.runtime.facing, y: opponent.runtime.pos.y + localPos[1] };
  }
  if (type === "front") {
    return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing + 48 * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
  }
  if (type === "back") {
    return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing - 48 * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
  }
  if (type === "left") {
    return { x: localPos[0], y: localPos[1] };
  }
  return { x: fighter.runtime.pos.x + localPos[0] * fighter.runtime.facing, y: fighter.runtime.pos.y + localPos[1] };
}

export function resolveEffectSpawnBind(
  postype: string | undefined,
  localPos: [number, number],
): RuntimeExplodSpawnInput["bind"] {
  const type = postype?.trim().toLowerCase() ?? "p1";
  if (type === "front") {
    return { localOffset: { x: localPos[0] + 48, y: localPos[1] } };
  }
  if (type === "back") {
    return { localOffset: { x: localPos[0] - 48, y: localPos[1] } };
  }
  if (type === "p1") {
    return { localOffset: { x: localPos[0], y: localPos[1] } };
  }
  return undefined;
}

function effectSpriteOwner(actor: RuntimeEffectSpawnActor): RuntimeEffectSpawnActor {
  return actor.stateOwner ?? actor;
}

function findActorState(actor: RuntimeEffectSpawnActor, stateNo: number | undefined): MugenStateDef | undefined {
  if (stateNo === undefined) {
    return undefined;
  }
  return actor.runtimeProgram?.states.find((candidate) => candidate.id === stateNo)?.source ??
    actor.definition.states?.find((candidate) => candidate.id === stateNo);
}

function resolveProjectileTerminalActions(
  owner: RuntimeEffectSpawnActor,
  controller: MugenStateController,
  operation?: ProjectileControllerOp,
): RuntimeProjectileSpawnInput["terminalActions"] {
  const hitAnim = operation?.hitAnim ?? firstNumber(findParam(controller, "projhitanim"));
  const removeAnim = operation?.removeAnim ?? firstNumber(findParam(controller, "projremanim"));
  const cancelAnim = operation?.cancelAnim ?? firstNumber(findParam(controller, "projcancelanim"));
  return {
    hit: hitAnim === undefined ? undefined : owner.definition.animations.get(hitAnim),
    remove: removeAnim === undefined ? undefined : owner.definition.animations.get(removeAnim),
    cancel: cancelAnim === undefined ? undefined : owner.definition.animations.get(cancelAnim),
  };
}

function isPlayableAction(action: MugenAnimationAction | undefined): action is MugenAnimationAction {
  return Boolean(action && action.frames.length > 0);
}

function findParam(controller: { params: Record<string, string> }, key: string): string | undefined {
  return findControllerParam(controller, key);
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? numbers[0]];
}

function actionDuration(action: MugenAnimationAction): number {
  return action.frames.reduce((total, frame) => total + Math.max(1, frame.duration), 0);
}

function effectSpawnOperation(
  controller: ControllerIr,
  effect: RuntimeEffectSpawnControllerDispatchEffect,
): RuntimeEffectSpawnControllerDispatchOperation | undefined {
  const operation = controller.operation;
  if (operation?.kind === effect) {
    return operation;
  }
  return undefined;
}

function dispatchEffectSpawnOperation<TActor extends RuntimeEffectSpawnActor>(
  options: RuntimeEffectSpawnControllerDispatchOptions<TActor>,
  operation: RuntimeEffectSpawnControllerDispatchOperation | undefined,
): number {
  const { actor, opponent, controller, effect, effectSpawnWorld } = options;
  switch (effect) {
    case "explod":
      return effectSpawnWorld.spawnExplod(
        actor,
        opponent,
        controller.source,
        operation?.kind === "explod" ? operation : undefined,
      )
        ? 1
        : 0;
    case "removeexplod":
      return effectSpawnWorld.removeExplods(
        actor,
        controller.source,
        operation?.kind === "removeexplod" ? operation : undefined,
      )
        ? 1
        : 0;
    case "modifyexplod":
      return effectSpawnWorld.modifyExplods(
        actor,
        controller.source,
        operation?.kind === "modifyexplod" ? operation : undefined,
      );
    case "helper":
      return effectSpawnWorld.spawnHelper(
        actor,
        opponent,
        controller.source,
        operation?.kind === "helper" ? operation : undefined,
      )
        ? 1
        : 0;
    case "projectile":
      return effectSpawnWorld.spawnProjectile(
        actor,
        opponent,
        controller.source,
        operation?.kind === "projectile" ? operation : undefined,
      )
        ? 1
        : 0;
    case "modifyprojectile":
      return effectSpawnWorld.modifyProjectiles(
        actor,
        controller.source,
        operation?.kind === "modifyprojectile" ? operation : undefined,
        options.resolveModifyProjectile,
      );
  }
}
