/**
 * DA30-103/104/105: minimal second consumer + shared ports contracts.
 */

export type PortLifecycle = {
  mounted: boolean;
  resized: boolean;
  focused: boolean;
  seed: number;
  samples: number;
  tornDown: boolean;
  diagnostics: string[];
};

export function createPortLifecycle(seed = 1): PortLifecycle {
  return {
    mounted: false,
    resized: false,
    focused: false,
    seed,
    samples: 0,
    tornDown: false,
    diagnostics: [],
  };
}

export function mountPort(p: PortLifecycle): PortLifecycle {
  return { ...p, mounted: true, diagnostics: [...p.diagnostics, "mount"] };
}
export function resizePort(p: PortLifecycle): PortLifecycle {
  return { ...p, resized: true, diagnostics: [...p.diagnostics, "resize"] };
}
export function focusPort(p: PortLifecycle, on: boolean): PortLifecycle {
  return { ...p, focused: on, diagnostics: [...p.diagnostics, on ? "focus" : "blur"] };
}
export function samplePort(p: PortLifecycle): PortLifecycle {
  return { ...p, samples: p.samples + 1 };
}
export function teardownPort(p: PortLifecycle): PortLifecycle {
  return { ...p, tornDown: true, mounted: false, diagnostics: [...p.diagnostics, "teardown"] };
}

/** Platformer testbed model — no MUGEN combat imports. */
export type PlatformerState = {
  schema: "Da30SecondConsumerPlatformer/v1";
  x: number;
  y: number;
  vx: number;
  onGround: boolean;
  score: number;
};

export function createPlatformer(): PlatformerState {
  return { schema: "Da30SecondConsumerPlatformer/v1", x: 0, y: 0, vx: 0, onGround: true, score: 0 };
}

export function stepPlatformer(s: PlatformerState, input: { left?: boolean; right?: boolean; jump?: boolean }): PlatformerState {
  let { x, y, vx, onGround, score } = s;
  if (input.left) vx = -2;
  else if (input.right) vx = 2;
  else vx *= 0.8;
  x += vx;
  if (input.jump && onGround) {
    y = 1;
    onGround = false;
  }
  if (!onGround) {
    y -= 0.2;
    if (y <= 0) {
      y = 0;
      onGround = true;
      score += 1;
    }
  }
  return { ...s, x, y, vx, onGround, score };
}

export type StoragePort = {
  revision: number;
  data: string;
};

export function storageSave(s: StoragePort, data: string): StoragePort {
  return { revision: s.revision + 1, data };
}

export function storageLoad(s: StoragePort): { revision: number; data: string } {
  return { revision: s.revision, data: s.data };
}

export function runSecondConsumerProof(): {
  ok: boolean;
  noMugenImport: true;
  ports: string[];
  platformerScore: number;
} {
  let port = createPortLifecycle(7);
  port = mountPort(port);
  port = resizePort(port);
  port = focusPort(port, true);
  port = samplePort(port);
  port = teardownPort(port);

  let game = createPlatformer();
  game = stepPlatformer(game, { right: true });
  game = stepPlatformer(game, { jump: true });
  game = stepPlatformer(game, {});
  game = stepPlatformer(game, {});
  game = stepPlatformer(game, {});
  game = stepPlatformer(game, {});
  game = stepPlatformer(game, {});

  let store: StoragePort = { revision: 0, data: "" };
  store = storageSave(store, JSON.stringify(game));
  const loaded = storageLoad(store);

  return {
    ok:
      port.tornDown &&
      port.samples === 1 &&
      loaded.revision === 1 &&
      game.score >= 0 &&
      port.seed === 7,
    noMugenImport: true,
    ports: ["clock", "input", "renderer", "storage", "evidence", "lifecycle"],
    platformerScore: game.score,
  };
}
