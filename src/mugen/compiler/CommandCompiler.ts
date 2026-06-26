import type { MugenCommand } from "../model/MugenCommand";
import type { MugenCommandToken } from "../model/MugenCommand";
import type { CommandIr, CommandPartIr, CommandStepIr } from "./RuntimeIr";

export function compileCommandIr(command: MugenCommand): CommandIr {
  const steps = compileCommandSteps(command.sequence);
  const unsupportedFeatures = new Set<string>();
  for (const token of command.sequence) {
    if (token.type === "modifier" && token.raw.startsWith(">")) {
      unsupportedFeatures.add("> strict next-step modifier");
    }
    if (token.type === "combo" && token.raw !== "+") {
      unsupportedFeatures.add(`unclassified command token ${token.raw}`);
    }
  }
  if (command.disabled) {
    unsupportedFeatures.add(command.disabledReason ?? "disabled by remap");
  }

  return {
    source: command,
    name: command.name,
    rawCommand: command.rawCommand,
    resolvedCommand: command.resolvedCommand,
    time: command.time,
    stepTime: command.stepTime,
    bufferTime: command.bufferTime,
    bufferHitPause: command.bufferHitPause,
    disabled: Boolean(command.disabled),
    steps,
    supportLevel: command.disabled || unsupportedFeatures.size > 0 ? "unsupported" : "executable",
    unsupportedFeatures: [...unsupportedFeatures].sort((a, b) => a.localeCompare(b)),
  };
}

export function compileCommandSteps(tokens: MugenCommandToken[]): CommandStepIr[] {
  const steps: CommandStepIr[] = [];
  let current: CommandStepIr = { parts: [] };
  let currentPart: CommandPartIr[] | undefined;
  let modifiers: string[] = [];
  let chargeTime: number | undefined;

  const flushPart = (): void => {
    if (currentPart && currentPart.length > 0) {
      current.parts.push(currentPart);
    }
    currentPart = undefined;
  };

  const flush = (): void => {
    flushPart();
    if (current.parts.length > 0) {
      steps.push(current);
    }
    current = { parts: [] };
  };

  for (const token of tokens) {
    if (token.type === "modifier") {
      modifiers.push(token.raw[0] ?? token.raw);
      if (token.chargeTime !== undefined) {
        chargeTime = token.chargeTime;
      }
      continue;
    }
    if (token.type === "separator") {
      flush();
      modifiers = [];
      chargeTime = undefined;
      continue;
    }
    if (token.type === "combo" && token.raw === "+") {
      flushPart();
      modifiers = [];
      chargeTime = undefined;
      continue;
    }
    if (token.type === "alternative") {
      continue;
    }
    if (token.type === "direction" || token.type === "button") {
      currentPart ??= [];
      currentPart.push({
        raw: token.raw,
        type: token.type,
        modifiers: [...new Set(modifiers)],
        chargeTime,
      });
      modifiers = [];
      chargeTime = undefined;
    }
  }
  flush();
  return steps;
}
