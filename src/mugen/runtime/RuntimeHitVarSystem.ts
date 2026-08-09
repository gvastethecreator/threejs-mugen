import type { CharacterRuntimeState } from "./types";

export type RuntimeHitVarTiming = {
  hitPause?: number;
  hitStun?: number;
  standFriction?: number;
  crouchFriction?: number;
};

export function runtimeHitVar(
  state: CharacterRuntimeState,
  name: string,
  timing: RuntimeHitVarTiming = {},
): number | undefined {
  const key = name.trim().toLowerCase();
  if (key === "animtype") {
    return state.hitVars?.animType ?? 0;
  }
  if (key === "ground.animtype") {
    return state.hitVars?.groundAnimType ?? state.hitVars?.animType ?? 0;
  }
  if (key === "air.animtype") {
    return state.hitVars?.airAnimType ?? state.hitVars?.groundAnimType ?? state.hitVars?.animType ?? 0;
  }
  if (key === "fall.animtype") {
    return state.hitVars?.fallAnimType
      ?? state.hitVars?.animType
      ?? state.hitVars?.airAnimType
      ?? state.hitVars?.groundAnimType
      ?? 0;
  }
  if (key === "damage") {
    return state.hitVars?.damage ?? 0;
  }
  if (key === "hitdamage") {
    return state.hitVars?.hitDamage ?? 0;
  }
  if (key === "guarddamage") {
    return state.hitVars?.guardDamage ?? 0;
  }
  if (key === "kill") {
    return state.hitVars?.kill ? 1 : 0;
  }
  // Ikemen exposes the numerical attack priority of the last HitDef. Keep
  // this separate from Projectile `projpriority`, which only governs clashes.
  if (key === "priority") {
    return state.hitVars?.sourcePriority ?? 4;
  }
  // Keep the last HitDef dizzypoints value separate from the defender's
  // mutable dizzy resource (`state.dizzyPoints`).
  if (key === "dizzypoints") {
    return state.hitVars?.sourceDizzyPoints ?? 0;
  }
  // Keep the last HitDef guardpoints value separate from the defender's
  // mutable guard resource (`state.guardPoints`).
  if (key === "guardpoints") {
    return state.hitVars?.sourceGuardPoints ?? 0;
  }
  // Ikemen increments this while consecutive guard contacts keep the actor in
  // get-hit state and clears it when the actor returns to idle. It is not the
  // authored guardpoints resource or the boolean guarded flag.
  if (key === "guardcount") {
    return state.hitVars?.guardCount ?? 0;
  }
  // Keep the last HitDef redlife value separate from the defender's mutable
  // red-life resource (`state.redLife`).
  if (key === "redlife") {
    return state.hitVars?.sourceRedLife ?? 0;
  }
  // Ikemen's guardpower is the second givepower value, not the defender's
  // mutable power resource (`state.power`).
  if (key === "guardpower") {
    return state.hitVars?.sourceGuardPower ?? 0;
  }
  // Ikemen's hitpower is the first givepower value, not the defender's
  // mutable power resource (`state.power`).
  if (key === "hitpower") {
    return state.hitVars?.sourceHitPower ?? 0;
  }
  // Ikemen's power is the givepower value received by the defender for the
  // last hit/guard contact, not the defender's mutable power resource.
  if (key === "power") {
    return state.hitVars?.sourcePower ?? 0;
  }
  // Ikemen exposes the authored HitDef p2facing on the last hit contact.
  // Guard contacts do not update this field in the bounded runtime path.
  if (key === "facing") {
    return state.hitVars?.sourceFacing ?? 0;
  }
  // Keep authored HitDef score separate from match/compatibility score
  // adjudication and movement.
  if (key === "score") {
    return state.hitVars?.sourceScore ?? 0;
  }
  if (key === "guardko") {
    return state.hitVars?.sourceGuardKo ? 1 : 0;
  }
  // Ikemen-GO returns the projectile ID that authored the last hit and -1
  // when the defender was hit by a direct HitDef or has no hit metadata.
  if (key === "projid") {
    return state.hitVars?.sourceProjectileId ?? -1;
  }
  if (key === "teamside") {
    return state.hitVars?.sourceTeamSide ?? -1;
  }
  if (key === "keepstate") {
    return state.hitVars?.keepState ? 1 : 0;
  }
  // Ikemen-GO exposes this as true only during the contact frame. The
  // frame-start world clears the marker after any active hitpause window.
  if (key === "frame") {
    return state.hitVars?.frame ? 1 : 0;
  }
  // Ikemen-GO exposes the zero-based player number that authored the last
  // HitDef. Keep this readback on the hit metadata rather than the defender's
  // own runtime identity; helpers and projectiles can be owned by another
  // player slot.
  if (key === "playerno") {
    return state.hitVars?.sourcePlayerNo ?? 0;
  }
  // PlayerID is the numeric identity of the character that authored the last
  // HitDef. Unlike PlayerNo, a Helper keeps its own ID rather than its root's
  // inherited player slot.
  if (key === "playerid" || key === "id") {
    return state.hitVars?.sourcePlayerId ?? 0;
  }
  if (key === "hitid") {
    return state.hitVars?.hitId ?? 0;
  }
  if (key === "chainid") {
    return state.hitVars?.chainId ?? -1;
  }
  if (key === "hitcount") {
    // Ikemen's GetHitVar(hitcount) is the defender's mutable consecutive-hit
    // counter. Keep the authored HitDef numhits metadata as a compatibility
    // fallback for static/imported traces that have not gone through combat.
    return state.hitVars?.comboHitCount ?? state.hitVars?.hitCount ?? 0;
  }
  if (key === "fallcount") {
    return state.hitFall?.fallCount ?? 0;
  }
  if (key === "xoff") {
    return state.hitVars?.hitOffset?.x ?? 0;
  }
  if (key === "yoff") {
    return state.hitVars?.hitOffset?.y ?? 0;
  }
  if (key === "zoff") {
    return state.hitVars?.hitOffset?.z ?? 0;
  }
  if (key === "type") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "groundtype") {
    return state.hitVars?.groundType ?? 0;
  }
  if (key === "airtype") {
    return state.hitVars?.airType ?? 0;
  }
  if (key === "isbound") {
    return state.hitVars?.isBound ? 1 : 0;
  }
  if (key === "guarded") {
    return state.hitVars?.guarded ? 1 : 0;
  }
  if (key === "fall") {
    return state.hitFall?.falling ? 1 : 0;
  }
  if (key === "fall.damage") {
    return state.hitFall?.damage ?? 0;
  }
  if (key === "fall.defence_up") {
    return state.hitFall?.defenceUp ?? 100;
  }
  if (key === "fall.kill") {
    return state.hitFall?.kill === false ? 0 : 1;
  }
  if (key === "fall.xvel" || key === "fall.xvelocity") {
    return state.hitFall?.velocity.x ?? 0;
  }
  if (key === "fall.yvel" || key === "fall.yvelocity") {
    return state.hitFall?.velocity.y ?? 0;
  }
  if (key === "fall.zvel" || key === "fall.zvelocity") {
    return state.hitFall?.velocity.z ?? 0;
  }
  if (key === "fall.recover") {
    return state.hitFall?.recover ? 1 : 0;
  }
  if (key === "fall.recovertime") {
    return state.hitFall?.recoverTime ?? 0;
  }
  if (key === "down.recover") {
    return state.hitFall?.downRecover === false ? 0 : 1;
  }
  if (key === "recovertime" || key === "down.recovertime") {
    return state.hitFall?.downRecoverTime ?? 0;
  }
  if (key === "fall.envshake.time") {
    return state.hitFall?.envShake?.time ?? 0;
  }
  if (key === "fall.envshake.freq") {
    return state.hitFall?.envShake?.freq ?? 60;
  }
  if (key === "fall.envshake.ampl") {
    return state.hitFall?.envShake?.ampl ?? 0;
  }
  if (key === "fall.envshake.phase") {
    return state.hitFall?.envShake?.phase ?? 0;
  }
  if (key === "fall.envshake.mul") {
    return state.hitFall?.envShake?.mul ?? 1;
  }
  if (key === "fall.envshake.dir") {
    return state.hitFall?.envShake?.dir ?? 0;
  }
  if (key === "xvel") {
    return state.hitVelocity?.x ?? 0;
  }
  if (key === "yvel") {
    return state.hitVelocity?.y ?? 0;
  }
  // Ikemen-GO extends GetHitVar with the depth component selected by the
  // active HitDef/Projectile velocity vector. M.U.G.E.N has no zvel key, so
  // keep this alias isolated to the shared Ikemen-compatible read model.
  if (key === "zvel") {
    return state.hitVelocity?.z ?? 0;
  }
  // Ikemen-GO records the extra velocity applied by KO physics separately
  // from the authored HitDef/Projectile reaction velocity. M.U.G.E.N and
  // non-KO/static paths keep the documented zero fallback.
  if (key === "xveladd") {
    return state.hitVars?.hitVelocityAdd?.x ?? 0;
  }
  if (key === "yveladd") {
    return state.hitVars?.hitVelocityAdd?.y ?? 0;
  }
  const velocityComponent = parseHitVelocityComponent(key);
  if (velocityComponent) {
    return state.hitVars?.hitVelocities?.[velocityComponent.family]?.[velocityComponent.axis] ?? 0;
  }
  if (key === "hittime") {
    return nonzeroOrFallback(state.hitVars?.hitTime, nonzeroOrFallback(state.guardStun, timing.hitStun));
  }
  if (key === "hitshaketime") {
    return nonzeroOrFallback(state.hitVars?.hitShakeTime, timing.hitPause);
  }
  if (key === "slidetime") {
    return state.hitVars?.guarded === true
      ? state.guardSlideTime ?? 0
      : state.hitVars?.slideTime ?? 0;
  }
  if (key === "ctrltime") {
    return state.guardControlTime ?? 0;
  }
  if (key === "yaccel") {
    return state.hitVars?.yAccel ?? 0.44;
  }
  if (key === "xaccel") {
    return state.hitVars?.xAccel ?? 0;
  }
  if (key === "zaccel") {
    return state.hitVars?.zAccel ?? 0;
  }
  if (key === "stand.friction") {
    return state.hitVars?.standFriction ?? timing.standFriction ?? 0.85;
  }
  if (key === "crouch.friction") {
    return state.hitVars?.crouchFriction ?? timing.crouchFriction ?? 0.82;
  }
  return undefined;
}

function nonzeroOrFallback(primary: number | undefined, fallback: number | undefined): number {
  const primaryValue = finiteWhole(primary);
  return primaryValue > 0 ? primaryValue : finiteWhole(fallback);
}

function finiteWhole(value: number | undefined): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value ?? 0)) : 0;
}

function parseHitVelocityComponent(
  key: string,
): { family: "ground" | "air" | "down" | "guard" | "airGuard"; axis: "x" | "y" | "z" } | undefined {
  const match = /^(ground|air|down|guard|airguard)\.velocity\.(x|y|z)$/.exec(key);
  if (!match) return undefined;
  const family = match[1] === "airguard" ? "airGuard" : (match[1] as "ground" | "air" | "down" | "guard");
  return { family, axis: match[2] as "x" | "y" | "z" };
}
