import { compileCommandSteps } from "../compiler/CommandCompiler";
import type { CommandPartIr, CommandStepIr } from "../compiler/RuntimeIr";
import type { MugenCommand } from "../model/MugenCommand";

export type InputSample = {
  frame: number;
  values: Set<string>;
  hitPause: boolean;
};

export type CommandInputHistorySample = {
  frame: number;
  values: string[];
  hitPause: boolean;
};

export class CommandBuffer {
  private readonly samples: InputSample[] = [];

  constructor(private readonly maxFrames = 60) {}

  clear(): void {
    this.samples.length = 0;
  }

  push(frame: number, values: Iterable<string>, options: { hitPause?: boolean } = {}): void {
    this.samples.push({ frame, values: new Set(values), hitPause: Boolean(options.hitPause) });
    while (this.samples.length > this.maxFrames) {
      this.samples.shift();
    }
  }

  isCommandActive(commandName: string, commands: MugenCommand[]): boolean {
    return commands.some((command) => command.name === commandName && this.isSingleCommandActive(command));
  }

  getHistory(limit = this.maxFrames): CommandInputHistorySample[] {
    return this.samples
      .slice(Math.max(0, this.samples.length - Math.max(0, limit)))
      .map((sample) => ({
        frame: sample.frame,
        values: [...sample.values].sort((left, right) => left.localeCompare(right)),
        hitPause: sample.hitPause,
      }));
  }

  private isSingleCommandActive(command: MugenCommand): boolean {
    if (command.disabled) {
      return false;
    }
    const steps = compileCommandSteps(command.sequence);
    if (steps.length === 0) {
      return false;
    }

    let cursor = steps.length - 1;
    let elapsed = 0;
    let lastMatchedAge: number | undefined;
    let youngerMatchedAge: number | undefined;
    let pendingGreater: CommandStepIr | undefined;
    for (let index = this.samples.length - 1; index >= 0; index -= 1) {
      const sample = this.samples[index];
      if (!sample || elapsed > command.time) {
        break;
      }
      const expected = steps[cursor];
      const usableSample = isSampleUsableForCommand(sample, command);
      const expectedMatches = Boolean(expected && usableSample && isCommandStepActive(expected, this.samples, index, command));
      if (
        pendingGreater &&
        usableSample &&
        !expectedMatches &&
        greaterCheckFail(pendingGreater, this.samples, index, command)
      ) {
        return false;
      }
      if (expected && usableSample && expectedMatches) {
        if (youngerMatchedAge !== undefined && elapsed - youngerMatchedAge > command.stepTime) {
          return false;
        }
        const matchedStep = expected;
        if (matchedStep.greater && greaterCheckFail(matchedStep, this.samples, index, command)) {
          return false;
        }
        lastMatchedAge ??= elapsed;
        youngerMatchedAge = elapsed;
        cursor -= 1;
        while (
          cursor >= 0 &&
          steps[cursor] &&
          canMatchOlderStepInSameSample(steps[cursor]!) &&
          isCommandStepActive(steps[cursor]!, this.samples, index, command)
        ) {
          youngerMatchedAge = elapsed;
          cursor -= 1;
        }
        if (cursor < 0) {
          return lastMatchedAge <= command.bufferTime;
        }
        pendingGreater = matchedStep.greater ? matchedStep : undefined;
        while (
          index > 0 &&
          isSampleUsableForCommand(this.samples[index - 1], command) &&
          isCommandStepActive(matchedStep, this.samples, index - 1, command)
        ) {
          index -= 1;
        }
      }
      if (sampleCountsForCommandTime(sample, command)) {
        elapsed += 1;
      }
    }
    return false;
  }
}

function isSampleUsableForCommand(sample: InputSample | undefined, command: MugenCommand): boolean {
  return Boolean(sample && (!sample.hitPause || command.bufferHitPause));
}

function sampleCountsForCommandTime(sample: InputSample, command: MugenCommand): boolean {
  return !sample.hitPause || !command.bufferHitPause;
}

function previousUsableSample(samples: InputSample[], index: number, command: MugenCommand): InputSample | undefined {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const sample = samples[cursor];
    if (isSampleUsableForCommand(sample, command)) {
      return sample;
    }
  }
  return undefined;
}

function isCommandStepActive(step: CommandStepIr, samples: InputSample[], index: number, command: MugenCommand): boolean {
  return step.parts.every((part) => part.some((alternative) => isPartActive(alternative, samples, index, command)));
}

function canMatchOlderStepInSameSample(step: CommandStepIr): boolean {
  return step.parts.every((part) => part.every((alternative) => alternative.modifiers.includes("~")));
}

function greaterCheckFail(
  step: CommandStepIr,
  samples: InputSample[],
  index: number,
  command: MugenCommand,
): boolean {
  const current = samples[index]?.values ?? new Set<string>();
  const previous = previousUsableSample(samples, index, command)?.values ?? new Set<string>();
  const allowedPress = new Set<string>();
  const allowedRelease = new Set<string>();
  for (const part of step.parts) {
    for (const alternative of part) {
      if (alternative.modifiers.includes("~")) {
        allowedRelease.add(alternative.raw);
      } else {
        allowedPress.add(alternative.raw);
      }
    }
  }
  for (const key of new Set([...current, ...previous])) {
    const pressed = current.has(key) && !previous.has(key);
    const released = !current.has(key) && previous.has(key);
    if (pressed && !allowedPress.has(key)) {
      return true;
    }
    if (released && !allowedRelease.has(key)) {
      return true;
    }
  }
  return false;
}

function isPartActive(part: CommandPartIr, samples: InputSample[], index: number, command: MugenCommand): boolean {
  const values = samples[index]?.values ?? new Set();
  const previousValues = previousUsableSample(samples, index, command)?.values ?? new Set();
  if (part.modifiers.includes("~")) {
    return wasPartActive(part, previousValues) && !isPartHeld(part, values) && hasChargeTime(part, samples, index, command, "release");
  }
  if (part.modifiers.includes("/")) {
    return isPartHeld(part, values) && hasChargeTime(part, samples, index, command, "hold");
  }
  return isPartHeld(part, values) && !wasPartActive(part, previousValues);
}

function hasChargeTime(
  part: CommandPartIr,
  samples: InputSample[],
  index: number,
  command: MugenCommand,
  mode: "hold" | "release",
): boolean {
  if (!part.chargeTime || part.chargeTime <= 1) {
    return true;
  }
  let count = 0;
  const start = mode === "release" ? index - 1 : index;
  for (let cursor = start; cursor >= 0; cursor -= 1) {
    const sample = samples[cursor];
    if (!isSampleUsableForCommand(sample, command)) {
      continue;
    }
    if (!isPartHeld(part, sample?.values ?? new Set())) {
      break;
    }
    count += 1;
    if (count >= part.chargeTime) {
      return true;
    }
  }
  return false;
}

function isPartHeld(part: CommandPartIr, values: Set<string>): boolean {
  if (part.type === "button") {
    return values.has(part.raw.toLowerCase());
  }
  const direction = currentDirection(values);
  if (part.modifiers.includes("$")) {
    return direction !== undefined && directionFamily(part.raw).includes(direction);
  }
  return direction === part.raw.toUpperCase();
}

function wasPartActive(part: CommandPartIr, previousValues: Set<string>): boolean {
  return isPartHeld(part, previousValues);
}

function hasValue(values: Set<string>, expected: string): boolean {
  const normalized = expected.toLowerCase();
  return [...values].some((value) => value.toLowerCase() === normalized);
}

function directionFamily(direction: string): string[] {
  const upper = direction.toUpperCase();
  if (upper === "D") {
    return ["D", "DB", "DF"];
  }
  if (upper === "B") {
    return ["B", "DB", "UB"];
  }
  if (upper === "F") {
    return ["F", "DF", "UF"];
  }
  if (upper === "U") {
    return ["U", "UB", "UF"];
  }
  return [upper];
}

function currentDirection(values: Set<string>): string | undefined {
  const has = (value: string): boolean => hasValue(values, value);
  if (has("DF") || (has("D") && has("F"))) {
    return "DF";
  }
  if (has("DB") || (has("D") && has("B"))) {
    return "DB";
  }
  if (has("UF") || (has("U") && has("F"))) {
    return "UF";
  }
  if (has("UB") || (has("U") && has("B"))) {
    return "UB";
  }
  if (has("D")) {
    return "D";
  }
  if (has("F")) {
    return "F";
  }
  if (has("B")) {
    return "B";
  }
  if (has("U")) {
    return "U";
  }
  return undefined;
}
