/**
 * DA30-054: bounded Simul/Tag/Turns team selection and handoff.
 * One mode per team policy: roster order, standby/active, input owner, KO/handoff.
 */

export type TeamMode = "single" | "simul" | "tag" | "turns";

export type TeamMember = {
  id: string;
  packageId: string;
  revision: string;
  life: number;
  active: boolean;
  standby: boolean;
};

export type TeamSide = {
  members: TeamMember[];
  inputOwnerId: string | null;
  activeId: string | null;
};

export type TeamMatchState = {
  schema: "Da30TeamSelectionHandoff/v1";
  mode: TeamMode;
  p1: TeamSide;
  p2: TeamSide;
  log: string[];
};

function side(ids: string[]): TeamSide {
  const members = ids.map((id, i) => ({
    id,
    packageId: id,
    revision: "r1",
    life: 1000,
    active: i === 0,
    standby: i > 0,
  }));
  return {
    members,
    inputOwnerId: members[0]?.id ?? null,
    activeId: members[0]?.id ?? null,
  };
}

export function createTeamMatch(mode: TeamMode, p1Ids: string[], p2Ids: string[]): TeamMatchState {
  if (mode === "single") {
    return {
      schema: "Da30TeamSelectionHandoff/v1",
      mode,
      p1: side(p1Ids.slice(0, 1)),
      p2: side(p2Ids.slice(0, 1)),
      log: ["single-1v1"],
    };
  }
  return {
    schema: "Da30TeamSelectionHandoff/v1",
    mode,
    p1: side(p1Ids),
    p2: side(p2Ids),
    log: [`mode-${mode}`],
  };
}

export function koAndHandoff(state: TeamMatchState, sideKey: "p1" | "p2"): TeamMatchState {
  const sideState = { ...state[sideKey], members: state[sideKey].members.map((m) => ({ ...m })) };
  const active = sideState.members.find((m) => m.active);
  if (!active) return { ...state, log: [...state.log, "no-active"] };
  active.life = 0;
  active.active = false;
  active.standby = false;

  if (state.mode === "single" || state.mode === "simul") {
    return {
      ...state,
      [sideKey]: sideState,
      log: [...state.log, `${sideKey}-ko-no-handoff`],
    };
  }

  const next = sideState.members.find((m) => m.standby && m.life > 0);
  if (!next) {
    sideState.activeId = null;
    sideState.inputOwnerId = null;
    return { ...state, [sideKey]: sideState, log: [...state.log, `${sideKey}-team-eliminated`] };
  }
  next.active = true;
  next.standby = false;
  sideState.activeId = next.id;
  sideState.inputOwnerId = next.id;
  return { ...state, [sideKey]: sideState, log: [...state.log, `${sideKey}-handoff-${next.id}`] };
}

export function resetTeamMatch(state: TeamMatchState): TeamMatchState {
  const resetSide = (s: TeamSide): TeamSide => {
    const members = s.members.map((m, i) => ({
      ...m,
      life: 1000,
      active: i === 0,
      standby: i > 0,
    }));
    return {
      members,
      activeId: members[0]?.id ?? null,
      inputOwnerId: members[0]?.id ?? null,
    };
  };
  return {
    ...state,
    p1: resetSide(state.p1),
    p2: resetSide(state.p2),
    log: [...state.log, "reset"],
  };
}

export function runTeamPolicyMatrix(): {
  ok: boolean;
  modes: Array<{ mode: TeamMode; handoff: boolean; singleUnchanged: boolean; inputOwner: string | null }>;
} {
  const modes: TeamMode[] = ["single", "simul", "tag", "turns"];
  const rows = modes.map((mode) => {
    let m = createTeamMatch(mode, ["nova", "rook"], ["mira", "ghost"]);
    const singleUnchanged = mode !== "single" || m.p1.members.length === 1;
    m = koAndHandoff(m, "p1");
    const handoff =
      mode === "tag" || mode === "turns"
        ? m.p1.activeId === "rook" && m.p1.inputOwnerId === "rook"
        : m.log.some((l) => l.includes("no-handoff") || l.includes("ko"));
    m = resetTeamMatch(m);
    const resetOk = m.p1.members[0]?.life === 1000 && m.p1.activeId === m.p1.members[0]?.id;
    return {
      mode,
      handoff: handoff && resetOk,
      singleUnchanged,
      inputOwner: m.p1.inputOwnerId,
    };
  });
  return { ok: rows.every((r) => r.handoff && r.singleUnchanged), modes: rows };
}
