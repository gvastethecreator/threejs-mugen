import type { CollisionBox } from "../model/CollisionBox";
import type { MugenAnimationAction, MugenAnimationFrame, MugenDiagnostic } from "../model/MugenAnimation";
import { createDiagnostic, parseNumber, parseTextLines } from "./text";

type PendingBoxes = {
  kind: "Clsn1" | "Clsn2" | "Clsn1Default" | "Clsn2Default";
  remaining: number;
  boxes: CollisionBox[];
};

export function parseAir(text: string, file?: string): {
  actions: Map<number, MugenAnimationAction>;
  diagnostics: MugenDiagnostic[];
} {
  const lines = parseTextLines(text);
  const actions = new Map<number, MugenAnimationAction>();
  const diagnostics: MugenDiagnostic[] = [];
  let current: MugenAnimationAction | undefined;
  let clsn1Default: CollisionBox[] = [];
  let clsn2Default: CollisionBox[] = [];
  let clsn1Pending: CollisionBox[] | undefined;
  let clsn2Pending: CollisionBox[] | undefined;
  let pendingBoxes: PendingBoxes | undefined;

  for (const line of lines) {
    if (!line.content) {
      current?.rawLines.push(line.raw);
      continue;
    }

    const actionMatch = /^\[Begin\s+Action\s+(-?\d+)\]$/i.exec(line.content);
    if (actionMatch) {
      const id = Number(actionMatch[1]);
      current = { id, frames: [], rawLines: [line.raw] };
      actions.set(id, current);
      clsn1Default = [];
      clsn2Default = [];
      clsn1Pending = undefined;
      clsn2Pending = undefined;
      pendingBoxes = undefined;
      continue;
    }

    if (!current) {
      diagnostics.push(
        createDiagnostic("warning", "AIR content outside an action was ignored", {
          format: "air",
          file,
          line: line.number,
          raw: line.raw,
        }),
      );
      continue;
    }

    current.rawLines.push(line.raw);

    if (/^Loopstart$/i.test(line.content)) {
      current.loopStart = current.frames.length;
      continue;
    }

    const clsnHeader = /^(Clsn[12](?:Default)?):\s*(\d+)/i.exec(line.content);
    if (clsnHeader) {
      const kind = canonicalClsnKind(clsnHeader[1] ?? "Clsn2");
      pendingBoxes = {
        kind,
        remaining: Number(clsnHeader[2]),
        boxes: [],
      };
      continue;
    }

    const box = parseCollisionBox(line.content);
    if (box && pendingBoxes) {
      pendingBoxes.boxes.push(box);
      pendingBoxes.remaining -= 1;
      if (pendingBoxes.remaining <= 0) {
        if (pendingBoxes.kind === "Clsn1Default") {
          clsn1Default = pendingBoxes.boxes;
        } else if (pendingBoxes.kind === "Clsn2Default") {
          clsn2Default = pendingBoxes.boxes;
        } else if (pendingBoxes.kind === "Clsn1") {
          clsn1Pending = pendingBoxes.boxes;
        } else {
          clsn2Pending = pendingBoxes.boxes;
        }
        pendingBoxes = undefined;
      }
      continue;
    }

    const frame = parseFrame(line.content, line.raw, line.number, clsn1Pending ?? clsn1Default, clsn2Pending ?? clsn2Default);
    if (frame) {
      current.frames.push(frame);
      clsn1Pending = undefined;
      clsn2Pending = undefined;
      continue;
    }

    diagnostics.push(
      createDiagnostic("warning", "Unrecognized AIR line", {
        format: "air",
        file,
        line: line.number,
        raw: line.raw,
      }),
    );
  }

  return { actions, diagnostics };
}

function canonicalClsnKind(value: string): PendingBoxes["kind"] {
  const lower = value.toLowerCase();
  if (lower === "clsn1default") {
    return "Clsn1Default";
  }
  if (lower === "clsn2default") {
    return "Clsn2Default";
  }
  if (lower === "clsn1") {
    return "Clsn1";
  }
  return "Clsn2";
}

function parseCollisionBox(content: string): CollisionBox | undefined {
  const equals = content.indexOf("=");
  if (equals < 0) {
    return undefined;
  }
  const values = content
    .slice(equals + 1)
    .split(",")
    .map((part) => Number(part.trim()));
  if (values.length < 4 || values.some((value) => !Number.isFinite(value))) {
    return undefined;
  }
  const x1 = values[0] ?? 0;
  const y1 = values[1] ?? 0;
  const x2 = values[2] ?? 0;
  const y2 = values[3] ?? 0;
  return {
    x1: Math.min(x1, x2),
    y1: Math.min(y1, y2),
    x2: Math.max(x1, x2),
    y2: Math.max(y1, y2),
  };
}

function parseFrame(
  content: string,
  raw: string,
  line: number,
  clsn1: CollisionBox[],
  clsn2: CollisionBox[],
): MugenAnimationFrame | undefined {
  const parts = content.split(",").map((part) => part.trim());
  if (parts.length < 5) {
    return undefined;
  }
  const [groupRaw, imageRaw, xRaw, yRaw, durationRaw, flip, blend] = parts;
  const group = parseNumber(groupRaw ?? "");
  const image = parseNumber(imageRaw ?? "");
  const x = parseNumber(xRaw ?? "");
  const y = parseNumber(yRaw ?? "");
  const duration = parseNumber(durationRaw ?? "");
  if ([group, image, x, y, duration].some((value) => value === undefined)) {
    return undefined;
  }

  return {
    spriteGroup: group ?? 0,
    spriteIndex: image ?? 0,
    offsetX: x ?? 0,
    offsetY: y ?? 0,
    duration: duration ?? 1,
    flip: flip || undefined,
    blend: blend || undefined,
    clsn1: clsn1.map((box) => ({ ...box })),
    clsn2: clsn2.map((box) => ({ ...box })),
    raw,
    line,
  };
}
