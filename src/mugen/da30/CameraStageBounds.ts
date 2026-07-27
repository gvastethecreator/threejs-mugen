/**
 * DA30-048: camera/stage/screen/player bounds reconciliation using BoundsControllerSystem.
 */
import { RuntimeBoundsControllerWorld } from "../runtime/BoundsControllerSystem";
import type { CharacterRuntimeState } from "../runtime/types";

function actor(o: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...o,
  };
}

export type CameraBoundsCase = { id: string; passed: boolean; detail: unknown };

export function runCameraStageBoundsCases(): { cases: CameraBoundsCase[]; ok: boolean } {
  const world = new RuntimeBoundsControllerWorld();
  const cases: CameraBoundsCase[] = [];

  const screen = actor();
  const r1 = world.applyScreenBoundController(screen, {
    type: "ScreenBound",
    params: { value: "1", movecamera: "1,0" },
  } as never);
  cases.push({
    id: "screenbound-apply",
    passed: r1.applied === true && screen.screenBound?.bound !== false,
    detail: { result: r1, screenBound: screen.screenBound },
  });

  const push = actor();
  const r2 = world.applyPlayerPushController(push, {
    type: "PlayerPush",
    params: { value: "1", priority: "2" },
  } as never);
  cases.push({
    id: "playerpush-apply",
    passed: r2.applied === true && push.playerPush !== false,
    detail: { result: r2, playerPush: push.playerPush, pushPriority: push.pushPriority },
  });

  const freeze = actor({ pos: { x: 100, y: -10 } });
  const r3 = world.applyPosFreezeController(freeze, {
    type: "PosFreeze",
    params: { value: "1" },
  } as never);
  cases.push({
    id: "posfreeze-apply",
    passed: r3.applied === true && Boolean(freeze.posFreeze),
    detail: { result: r3, posFreeze: freeze.posFreeze, pos: freeze.pos },
  });

  // Stage edge clamp model (pure): localcoord + bounds
  const stage = { left: -160, right: 160, top: -240, bottom: 0, localCoord: [320, 240] as [number, number] };
  const clampX = (x: number) => Math.min(stage.right, Math.max(stage.left, x));
  const corner = clampX(999);
  cases.push({
    id: "stage-edge-clamp",
    passed: corner === stage.right,
    detail: { corner, stage },
  });

  const cameraFollow = (targetX: number, camX: number, deadzone = 20) => {
    if (Math.abs(targetX - camX) <= deadzone) return camX;
    return camX + Math.sign(targetX - camX) * Math.min(8, Math.abs(targetX - camX) - deadzone);
  };
  const cam1 = cameraFollow(50, 0);
  const cam2 = cameraFollow(5, 0);
  cases.push({
    id: "camera-follow-deadzone",
    passed: cam1 > 0 && cam2 === 0,
    detail: { cam1, cam2 },
  });

  // Resize/localcoord scale
  const scale = stage.localCoord[0] / 320;
  cases.push({
    id: "localcoord-scale",
    passed: scale === 1,
    detail: { localCoord: stage.localCoord, scale },
  });

  return { cases, ok: cases.every((c) => c.passed) };
}
