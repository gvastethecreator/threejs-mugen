export const STUDIO_AUTOSAVE_DELAY_MS = 1_500;

export type StudioAutosaveTimerApi = {
  set(callback: () => void, delayMs: number): ReturnType<typeof setTimeout>;
  clear(handle: ReturnType<typeof setTimeout>): void;
};

const browserTimerApi: StudioAutosaveTimerApi = {
  set: (callback, delayMs) => setTimeout(callback, delayMs),
  clear: (handle) => clearTimeout(handle),
};

export class StudioAutosave {
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    readonly delayMs = STUDIO_AUTOSAVE_DELAY_MS,
    private readonly timerApi: StudioAutosaveTimerApi = browserTimerApi,
  ) {}

  get pending(): boolean {
    return this.timer !== undefined;
  }

  schedule(callback: () => void): void {
    this.cancel();
    this.timer = this.timerApi.set(() => {
      this.timer = undefined;
      callback();
    }, this.delayMs);
  }

  cancel(): void {
    if (this.timer !== undefined) {
      this.timerApi.clear(this.timer);
      this.timer = undefined;
    }
  }
}
