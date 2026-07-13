import { describe, expect, it } from "vitest";
import { StudioAutosave, type StudioAutosaveTimerApi } from "../app/StudioAutosave";

type FakeTimer = ReturnType<typeof setTimeout>;

function createFakeTimerApi() {
  const callbacks = new Map<number, () => void>();
  const cleared: number[] = [];
  let nextId = 0;
  const timerApi: StudioAutosaveTimerApi = {
    set: (callback) => {
      const id = ++nextId;
      callbacks.set(id, callback);
      return id as unknown as FakeTimer;
    },
    clear: (handle) => {
      const id = Number(handle);
      cleared.push(id);
      callbacks.delete(id);
    },
  };
  return { callbacks, cleared, timerApi };
}

describe("StudioAutosave", () => {
  it("coalesces edits into the latest scheduled callback", () => {
    const fake = createFakeTimerApi();
    const autosave = new StudioAutosave(250, fake.timerApi);
    const calls: string[] = [];

    autosave.schedule(() => calls.push("first"));
    autosave.schedule(() => calls.push("second"));

    expect(autosave.pending).toBe(true);
    expect(fake.cleared).toEqual([1]);
    fake.callbacks.get(2)?.();
    expect(calls).toEqual(["second"]);
    expect(autosave.pending).toBe(false);
  });

  it("cancels a pending callback without running it", () => {
    const fake = createFakeTimerApi();
    const autosave = new StudioAutosave(250, fake.timerApi);
    let calls = 0;

    autosave.schedule(() => {
      calls += 1;
    });
    autosave.cancel();

    expect(autosave.pending).toBe(false);
    expect(fake.cleared).toEqual([1]);
    expect(fake.callbacks.size).toBe(0);
    expect(calls).toBe(0);
  });
});
