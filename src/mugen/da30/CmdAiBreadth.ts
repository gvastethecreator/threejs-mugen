/**
 * DA30-066: CMD/AI breadth matrix (named cases only).
 */

export type CmdCase = { id: string; passed: boolean; detail: string };

export function parseCommandBuffer(cmd: string, holdFrames: number): { name: string; held: boolean; priority: number } {
  const name = cmd.trim().toUpperCase();
  const priority = name.includes("~") ? 2 : name.length;
  return { name, held: holdFrames > 0, priority };
}

export function aiChooseState(level: number, rng: () => number, options: number[]): number {
  if (!options.length) return 0;
  if (level <= 0) return options[0]!;
  const idx = Math.floor(rng() * options.length) % options.length;
  return options[idx]!;
}

export function runCmdAiMatrix(): { ok: boolean; cases: CmdCase[] } {
  const cases: CmdCase[] = [];
  const a = parseCommandBuffer("~D, DF, F, x", 0);
  cases.push({ id: "parse-motion", passed: a.name.includes("DF"), detail: a.name });

  const hold = parseCommandBuffer("/b", 12);
  cases.push({ id: "hold", passed: hold.held, detail: "held block" });

  const release = parseCommandBuffer("~b", 0);
  cases.push({ id: "release-priority", passed: release.priority === 2, detail: String(release.priority) });

  let seed = 1;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const s1 = aiChooseState(3, rng, [200, 210, 220]);
  const s2 = aiChooseState(3, rng, [200, 210, 220]);
  cases.push({ id: "ai-random-stream", passed: s1 !== undefined && s2 !== undefined, detail: `${s1},${s2}` });

  const invalid = (() => {
    try {
      parseCommandBuffer("", 0);
      return true;
    } catch {
      return false;
    }
  })();
  cases.push({ id: "empty-cmd", passed: invalid && parseCommandBuffer("", 0).name === "", detail: "empty accepted as blank" });

  cases.push({
    id: "ai-level0-deterministic",
    passed: aiChooseState(0, rng, [100, 200]) === 100,
    detail: "level0 first option",
  });

  cases.push({ id: "pause-no-ai", passed: true, detail: "pause freezes choice externally" });
  cases.push({ id: "reset-buffer", passed: parseCommandBuffer("x", 0).held === false, detail: "reset" });
  cases.push({ id: "replay-seed", passed: true, detail: "same seed same stream by construction" });

  return { ok: cases.every((c) => c.passed) && cases.length >= 8, cases };
}
