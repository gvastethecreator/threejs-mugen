/**
 * DA30-052: local versus selection journey model (browser gate exercises UI).
 * Keyboard/gamepad path chooses seats, palettes, order, stage, profile;
 * blocked/missing explain why; back/cancel/start preserve seat + revision.
 */

import {
  assignSeat,
  createEmptySelection,
  launchPackageIds,
  type SelectionEntry,
  type SelectionState,
} from "./SelectionStateModel";

export type JourneyAction =
  | { type: "pick"; seat: string; entry: SelectionEntry }
  | { type: "stage"; stageId: string; stageRevision: string }
  | { type: "profile"; seat: string; profile: string }
  | { type: "palette"; seat: string; palette: number }
  | { type: "order"; seats: string[] }
  | { type: "back" }
  | { type: "cancel" }
  | { type: "start" };

export type JourneyStep = {
  action: JourneyAction;
  ok: boolean;
  error?: string;
  revision: number;
  launchIds?: string[];
};

export type SelectionJourney = {
  schema: "Da30SelectionBrowserJourney/v1";
  state: SelectionState;
  history: SelectionState[];
  steps: JourneyStep[];
  revision: number;
  seatOrder: string[];
  started: boolean;
  cancelled: boolean;
};

export function createJourney(): SelectionJourney {
  return {
    schema: "Da30SelectionBrowserJourney/v1",
    state: createEmptySelection(),
    history: [createEmptySelection()],
    steps: [],
    revision: 0,
    seatOrder: ["p1", "p2"],
    started: false,
    cancelled: false,
  };
}

function snapshot(j: SelectionJourney): SelectionState {
  return {
    schema: j.state.schema,
    seats: { ...j.state.seats },
    stageId: j.state.stageId,
    stageRevision: j.state.stageRevision,
  };
}

export function applyJourneyAction(j: SelectionJourney, action: JourneyAction): SelectionJourney {
  const next: SelectionJourney = {
    ...j,
    steps: [...j.steps],
    history: [...j.history],
    seatOrder: [...j.seatOrder],
    state: {
      ...j.state,
      seats: { ...j.state.seats },
    },
  };

  if (action.type === "back") {
    if (next.history.length > 1) {
      next.history.pop();
      next.state = snapshot({ ...next, state: next.history[next.history.length - 1]! });
      next.revision += 1;
      next.steps.push({ action, ok: true, revision: next.revision });
    } else {
      next.steps.push({ action, ok: false, error: "no history", revision: next.revision });
    }
    return next;
  }

  if (action.type === "cancel") {
    next.cancelled = true;
    next.started = false;
    next.revision += 1;
    next.steps.push({ action, ok: true, revision: next.revision });
    return next;
  }

  if (action.type === "start") {
    const launch = launchPackageIds(next.state);
    next.revision += 1;
    if (!launch.ok) {
      next.steps.push({ action, ok: false, error: launch.error, revision: next.revision });
      return next;
    }
    next.started = true;
    next.steps.push({ action, ok: true, revision: next.revision, launchIds: launch.ids });
    return next;
  }

  if (action.type === "pick") {
    const r = assignSeat(next.state, action.seat, action.entry);
    next.revision += 1;
    if (!r.ok) {
      next.steps.push({
        action,
        ok: false,
        error: r.error,
        revision: next.revision,
      });
      return next;
    }
    next.state = r.state;
    next.history.push(snapshot(next));
    next.steps.push({ action, ok: true, revision: next.revision });
    return next;
  }

  if (action.type === "stage") {
    next.state = {
      ...next.state,
      stageId: action.stageId,
      stageRevision: action.stageRevision,
    };
    next.revision += 1;
    next.history.push(snapshot(next));
    next.steps.push({ action, ok: true, revision: next.revision });
    return next;
  }

  if (action.type === "profile" || action.type === "palette") {
    const seat = next.state.seats[action.seat];
    if (!seat) {
      next.revision += 1;
      next.steps.push({ action, ok: false, error: "empty seat", revision: next.revision });
      return next;
    }
    next.state = {
      ...next.state,
      seats: {
        ...next.state.seats,
        [action.seat]:
          action.type === "profile"
            ? { ...seat, profile: action.profile }
            : { ...seat, palette: action.palette },
      },
    };
    next.revision += 1;
    next.history.push(snapshot(next));
    next.steps.push({ action, ok: true, revision: next.revision });
    return next;
  }

  if (action.type === "order") {
    next.seatOrder = [...action.seats];
    next.revision += 1;
    next.steps.push({ action, ok: true, revision: next.revision });
    return next;
  }

  return next;
}

export function runLocalVersusSelectionFlow(): {
  ok: boolean;
  journey: SelectionJourney;
  blockedExplained: boolean;
  missingExplained: boolean;
  preservedRevisionOnBack: boolean;
} {
  let j = createJourney();
  j = applyJourneyAction(j, {
    type: "pick",
    seat: "p1",
    entry: { packageId: "ghost", revision: "r0", legal: false, blockedReason: "unsupported profile" },
  });
  const blockedExplained = j.steps.at(-1)?.error === "unsupported profile";

  j = applyJourneyAction(j, {
    type: "pick",
    seat: "p1",
    entry: { packageId: "missing-pack", revision: "r0", legal: true, missing: true },
  });
  const missingExplained = j.steps.at(-1)?.error === "missing package";

  j = applyJourneyAction(j, {
    type: "pick",
    seat: "p1",
    entry: { packageId: "nova-boxer", revision: "r1", legal: true, palette: 1, profile: "mugen" },
  });
  const revAfterP1 = j.revision;
  j = applyJourneyAction(j, {
    type: "pick",
    seat: "p2",
    entry: { packageId: "mira-volt", revision: "r1", legal: true, palette: 2 },
  });
  j = applyJourneyAction(j, { type: "stage", stageId: "rooftop-dojo", stageRevision: "r1" });
  j = applyJourneyAction(j, { type: "palette", seat: "p1", palette: 3 });
  j = applyJourneyAction(j, { type: "order", seats: ["p2", "p1"] });
  j = applyJourneyAction(j, { type: "back" });
  const preservedRevisionOnBack = j.revision > revAfterP1 && j.state.seats.p1?.packageId === "nova-boxer";
  j = applyJourneyAction(j, { type: "start" });

  return {
    ok: j.started && blockedExplained && missingExplained && preservedRevisionOnBack,
    journey: j,
    blockedExplained,
    missingExplained,
    preservedRevisionOnBack,
  };
}
