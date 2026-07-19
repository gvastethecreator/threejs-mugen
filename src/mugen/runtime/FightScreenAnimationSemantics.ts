import type { MugenAnimationAction } from "../model/MugenAnimation";
import type {
  MugenFightScreenDisplayAsset,
  MugenFightScreenDisplayDefinitions,
} from "../model/MugenSystemAssets";

export type FightScreenAnimationCompletionReason =
  | "displaytime"
  | "empty-animation"
  | "finite-animation"
  | "terminal-frame"
  | "parallel";

export type FightScreenAnimationCompletion = {
  /** Renderer frame tick at which the source End check becomes true. */
  frame: number;
  reason: FightScreenAnimationCompletionReason;
  actionNos: number[];
};

export function resolveFightScreenAnimationCompletion(
  asset: MugenFightScreenDisplayAsset | undefined,
  animations: ReadonlyMap<number, MugenAnimationAction>,
): FightScreenAnimationCompletion {
  const actionNo = asset?.animationNo;
  const displayTime = asset?.displayTime;
  if (displayTime !== undefined && Number.isFinite(displayTime) && displayTime >= 0) {
    return {
      frame: Math.max(0, Math.round(displayTime) - 1),
      reason: "displaytime",
      actionNos: actionNo === undefined ? [] : [actionNo],
    };
  }

  const action = actionNo === undefined ? undefined : animations.get(actionNo);
  if (!action || action.frames.length === 0) {
    return {
      frame: 0,
      reason: "empty-animation",
      actionNos: actionNo === undefined ? [] : [actionNo],
    };
  }

  const terminalFrame = action.frames[action.frames.length - 1]?.duration === -1;
  const frame = action.frames.reduce((total, current, index) => {
    if (terminalFrame && index === action.frames.length - 1) return total;
    return total + effectiveAnimationDuration(current.duration);
  }, 0);
  return {
    frame,
    reason: terminalFrame ? "terminal-frame" : "finite-animation",
    actionNos: [action.id],
  };
}

export function resolveFightScreenAnnouncementCompletion(
  display: MugenFightScreenDisplayDefinitions | undefined,
  animations: ReadonlyMap<number, MugenAnimationAction>,
  kind: "round" | "fight",
  mode: "normal" | "single" | "final",
  roundNo: number,
): FightScreenAnimationCompletion | undefined {
  if (!display) return undefined;

  const assets = kind === "fight"
    ? [display.fight]
    : [resolveRoundVariant(display, mode, roundNo), display.roundDefault];
  const completions = assets.map((asset) => resolveFightScreenAnimationCompletion(asset, animations));
  const frame = Math.max(...completions.map((completion) => completion.frame));
  const actionNos = [...new Set(completions.flatMap((completion) => completion.actionNos))];
  const reason = completions.length > 1
    ? "parallel"
    : completions.find((completion) => completion.frame === frame)?.reason ?? "empty-animation";
  return { frame, reason, actionNos };
}

function resolveRoundVariant(
  display: MugenFightScreenDisplayDefinitions,
  mode: "normal" | "single" | "final",
  roundNo: number,
): MugenFightScreenDisplayAsset | undefined {
  if (mode === "single") return display.roundSingle;
  if (mode === "final") return display.roundFinal;
  return display.round.get(roundNo);
}

function effectiveAnimationDuration(duration: number): number {
  return duration > 0 && Number.isFinite(duration) ? Math.round(duration) : 0;
}
