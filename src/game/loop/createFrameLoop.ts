export type FrameLoop = {
  start(): void;
  stop(): void;
};

export function createFrameLoop(onFrame: (deltaMs: number) => void): FrameLoop {
  let requestId = 0;
  let last = performance.now();
  let running = false;

  const frame = (now: number): void => {
    if (!running) {
      return;
    }
    const delta = now - last;
    last = now;
    onFrame(delta);
    requestId = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (running) {
        return;
      }
      running = true;
      last = performance.now();
      requestId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(requestId);
    },
  };
}
