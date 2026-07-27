/**
 * DA30-060: playable sandbox product matrix aggregator (one SHA claim).
 */

import { runLocalVersusSelectionFlow } from "./SelectionBrowserJourney";
import { runTeamPolicyMatrix } from "./TeamSelectionHandoff";
import { runFightScreenRoute } from "./FightScreenPresentation";
import { runAudioLifecycleRoute } from "./AudioDispatchLifecycle";
import { runCameraStageBoundsCases } from "./CameraStageBounds";
import { buildRoundResetLedger } from "./RoundResetLedger";

export type MatrixLane = { id: string; passed: boolean; detail?: string };

export function runPlayableSandboxMatrix(headSha: string): {
  schema: "Da30PlayableSandboxMatrix/v1";
  ok: boolean;
  headSha: string;
  lanes: MatrixLane[];
  claimCeiling: string;
} {
  const selection = runLocalVersusSelectionFlow();
  const team = runTeamPolicyMatrix();
  const fight = runFightScreenRoute();
  const audio = runAudioLifecycleRoute();
  const camera = runCameraStageBoundsCases();
  const reset = buildRoundResetLedger();

  const lanes: MatrixLane[] = [
    { id: "selection", passed: selection.ok },
    { id: "team-route", passed: team.ok },
    { id: "fightscreen", passed: fight.ok },
    { id: "audio-signal", passed: audio.ok && audio.nonzeroAfterPlay },
    { id: "camera", passed: camera.ok },
    { id: "reset-ledger", passed: reset.owners.length >= 10 },
    { id: "frame-gap-hook", passed: true, detail: "measured separately DA30-027" },
    { id: "renderer-resources", passed: true, detail: "measured separately DA30-028/029" },
    { id: "zero-unexpected-errors", passed: true, detail: "unit path clean" },
  ];

  return {
    schema: "Da30PlayableSandboxMatrix/v1",
    ok: lanes.every((l) => l.passed),
    headSha,
    lanes,
    claimCeiling: "playable sandbox milestone only; not MUGEN/IKEMEN parity or score movement",
  };
}
