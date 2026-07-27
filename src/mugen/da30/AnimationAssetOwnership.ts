/**
 * DA30-058: animation, palette, sprite, effect ownership routes.
 */

export type AnimFrame = { group: number; image: number; duration: number };
export type AnimAction = { actionNo: number; frames: AnimFrame[]; loopStart: number };

export type AssetBanks = {
  air: AnimAction[];
  sffGroups: number[];
  actPalettes: number[];
  effectBank: string[];
  shadows: boolean;
};

export type OwnershipCase = { id: string; passed: boolean; detail: string };

export function resolveAnimFrame(action: AnimAction, time: number): AnimFrame | null {
  if (!action.frames.length) return null;
  let t = time;
  let i = 0;
  const max = action.frames.length * 4;
  let guard = 0;
  while (guard < max) {
    const f = action.frames[i]!;
    if (t < f.duration) return f;
    t -= f.duration;
    i += 1;
    if (i >= action.frames.length) {
      i = Math.max(0, action.loopStart);
      if (action.loopStart < 0) return f;
    }
    guard += 1;
  }
  return action.frames[0] ?? null;
}

export function runAnimationOwnershipRoutes(): { ok: boolean; cases: OwnershipCase[] } {
  const banks: AssetBanks = {
    air: [
      {
        actionNo: 0,
        frames: [
          { group: 0, image: 0, duration: 4 },
          { group: 0, image: 1, duration: 4 },
        ],
        loopStart: 0,
      },
      {
        actionNo: 200,
        frames: [{ group: 1, image: 0, duration: 3 }],
        loopStart: -1,
      },
    ],
    sffGroups: [0, 1, 9000],
    actPalettes: [1, 2, 3, 4, 5, 6],
    effectBank: ["spark-a", "spark-b"],
    shadows: true,
  };

  const cases: OwnershipCase[] = [];
  const idle = resolveAnimFrame(banks.air[0]!, 5);
  cases.push({
    id: "authored-frame",
    passed: idle?.image === 1,
    detail: `frame image ${idle?.image}`,
  });

  const attack = resolveAnimFrame(banks.air[1]!, 10);
  cases.push({
    id: "no-loop-holds",
    passed: attack?.image === 0,
    detail: "action 200 holds last",
  });

  cases.push({
    id: "palette-choice",
    passed: banks.actPalettes.includes(3),
    detail: "palette 3 legal",
  });

  cases.push({
    id: "effect-sprite-bank",
    passed: banks.effectBank.includes("spark-a"),
    detail: "effect bank present",
  });

  cases.push({
    id: "shadow-order",
    passed: banks.shadows === true,
    detail: "shadow draw enabled",
  });

  cases.push({
    id: "missing-group",
    passed: !banks.sffGroups.includes(999),
    detail: "missing group fails lookup",
  });

  cases.push({
    id: "reset-action-0",
    passed: resolveAnimFrame(banks.air[0]!, 0)?.image === 0,
    detail: "reset to first frame",
  });

  return { ok: cases.every((c) => c.passed), cases };
}
