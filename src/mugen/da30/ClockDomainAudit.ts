/**
 * DA30-036: clock domain inventory against known runtime owners.
 */

export type ClockDomain = {
  id: string;
  owner: string;
  pausesWith: string[];
  profileScope: string[];
  openQuestions: string[];
};

export function buildClockDomainAudit(): {
  schema: "Da30ClockDomainAudit/v1";
  id: "DA30-036";
  domains: ClockDomain[];
  claimCeiling: string;
} {
  return {
    schema: "Da30ClockDomainAudit/v1",
    id: "DA30-036",
    claimCeiling: "timing research only",
    domains: [
      { id: "normal-time", owner: "MatchClock", pausesWith: [], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "pause", owner: "PauseSystem", pausesWith: ["normal-time"], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "superpause", owner: "SuperPauseSystem", pausesWith: ["normal-time", "pause"], profileScope: ["mugen", "ikemen-go"], openQuestions: ["layering vs hitpause order"] },
      { id: "hitpause", owner: "RuntimeHitPauseSystem", pausesWith: ["normal-time"], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "input-buffers", owner: "CommandBuffer", pausesWith: ["hitpause?"], profileScope: ["mugen", "ikemen-go"], openQuestions: ["does buffer advance during hitpause per profile"] },
      { id: "animation", owner: "AnimSystem", pausesWith: ["pause", "superpause", "hitpause"], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "effects", owner: "EffectLifecycle", pausesWith: ["pause", "superpause"], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "audio", owner: "MugenAudioSystem", pausesWith: [], profileScope: ["mugen", "ikemen-go"], openQuestions: ["UI vs combat channel clock"] },
      { id: "round", owner: "RoundSystem", pausesWith: [], profileScope: ["mugen", "ikemen-go"], openQuestions: [] },
      { id: "ui", owner: "App", pausesWith: [], profileScope: ["product"], openQuestions: [] },
      { id: "replay", owner: "ReplayClock", pausesWith: [], profileScope: ["replay"], openQuestions: ["sync to match seed"] },
    ],
  };
}
