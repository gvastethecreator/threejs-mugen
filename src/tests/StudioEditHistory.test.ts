import { describe, expect, it } from "vitest";
import { StudioEditHistory, type StudioProjectEditState } from "../app/StudioEditHistory";

const initial: StudioProjectEditState = {
  projectName: "Local Fighting Project",
  p1: "nova-boxer",
  p2: "mira-volt",
  stage: "rooftop-dojo",
};

describe("StudioEditHistory", () => {
  it("undoes and redoes a project edit in order", () => {
    const history = new StudioEditHistory();
    const renamed = { ...initial, projectName: "Night Session" };
    const moved = { ...renamed, stage: "training-room" };

    expect(history.record(initial, renamed)).toBe(true);
    expect(history.record(renamed, moved)).toBe(true);
    expect(history.undo(moved)).toEqual(renamed);
    expect(history.undo(renamed)).toEqual(initial);
    expect(history.redo(initial)).toEqual(renamed);
    expect(history.redo(renamed)).toEqual(moved);
  });

  it("drops redo history after a new branch and ignores stale current state", () => {
    const history = new StudioEditHistory();
    const renamed = { ...initial, projectName: "Night Session" };
    const staged = { ...initial, stage: "training-room" };

    expect(history.record(initial, renamed)).toBe(true);
    expect(history.undo(renamed)).toEqual(initial);
    expect(history.undo(staged)).toBeUndefined();
    expect(history.record(initial, staged)).toBe(true);
    expect(history.redo(staged)).toBeUndefined();
    expect(history.undo(staged)).toEqual(initial);
  });

  it("bounds entries and skips no-op edits", () => {
    const history = new StudioEditHistory(2);
    const one = { ...initial, projectName: "One" };
    const two = { ...one, projectName: "Two" };
    const three = { ...two, projectName: "Three" };

    expect(history.record(initial, initial)).toBe(false);
    expect(history.record(initial, one)).toBe(true);
    expect(history.record(one, two)).toBe(true);
    expect(history.record(two, three)).toBe(true);
    expect(history.undoCount).toBe(2);
    expect(history.undo(three)).toEqual(two);
    expect(history.undo(two)).toEqual(one);
    expect(history.undo(one)).toBeUndefined();
  });
});
