import type { MugenCommand, MugenCommandFile, MugenCommandToken } from "../model/MugenCommand";
import { createDiagnostic, parseKeyValue, parseTextLines, unquote } from "./text";

const directions = new Set(["B", "DB", "D", "DF", "F", "UF", "U", "UB"]);
const buttons = new Set(["a", "b", "c", "x", "y", "z", "s", "d", "w", "m"]);
const modifiers = new Set(["~", "/", "$", ">"]);

export function parseCmd(text: string, file?: string): MugenCommandFile {
  const lines = parseTextLines(text);
  const commands: MugenCommand[] = [];
  const diagnostics: MugenCommandFile["diagnostics"] = [];
  let inCommand = false;
  let inDefaults = false;
  let inRemap = false;
  let readRemap = false;
  let currentParams: Record<string, string> = {};
  let currentLine = 0;
  let defaultCommandTime = 15;
  let defaultStepTime = 0;
  let defaultBufferTime = 1;
  let defaultBufferHitPause = true;
  const buttonRemap = createDefaultButtonRemap();

  const flush = (): void => {
    if (!inCommand) {
      return;
    }
    const name = currentParams.name ? unquote(currentParams.name) : undefined;
    const command = currentParams.command ? unquote(currentParams.command) : undefined;
    if (name && command) {
      const time = parsePositiveFrameCount(currentParams.time, defaultCommandTime);
      const configuredStepTime = parsePositiveFrameCount(currentParams.steptime, defaultStepTime);
      const parsedCommand = parseCommandSequence(command, buttonRemap);
      commands.push({
        name,
        sequence: parsedCommand.sequence,
        rawCommand: command,
        resolvedCommand: parsedCommand.resolvedCommand,
        time,
        stepTime: configuredStepTime > 0 ? configuredStepTime : time,
        bufferTime: parseBufferFrameCount(currentParams["buffer.time"], defaultBufferTime),
        bufferHitPause: currentParams["buffer.hitpause"]
          ? parseBool(currentParams["buffer.hitpause"]) ?? defaultBufferHitPause
          : defaultBufferHitPause,
        remapped: parsedCommand.remapped,
        disabled: parsedCommand.disabled,
        disabledReason: parsedCommand.disabledReason,
        rawParams: { ...currentParams },
        line: currentLine,
      });
    } else {
      diagnostics.push(
        createDiagnostic("warning", "Command block is missing name or command", {
          format: "cmd",
          file,
          line: currentLine,
        }),
      );
    }
    currentParams = {};
  };

  for (const line of lines) {
    if (!line.content) {
      continue;
    }
    if (/^\[Command\]$/i.test(line.content)) {
      flush();
      inCommand = true;
      inDefaults = false;
      inRemap = false;
      currentLine = line.number;
      continue;
    }
    if (/^\[Defaults\]$/i.test(line.content)) {
      flush();
      inCommand = false;
      inDefaults = true;
      inRemap = false;
      continue;
    }
    if (/^\[Remap\]$/i.test(line.content)) {
      flush();
      inCommand = false;
      inDefaults = false;
      inRemap = !readRemap;
      readRemap = true;
      continue;
    }
    if (/^\[[^\]]+\]$/.test(line.content)) {
      flush();
      inCommand = false;
      inDefaults = false;
      inRemap = false;
      continue;
    }
    if (inRemap) {
      const pair = parseKeyValue(line.content);
      if (pair) {
        applyButtonRemap(pair, buttonRemap, diagnostics, file, line.number);
      }
      continue;
    }
    if (inDefaults) {
      const pair = parseKeyValue(line.content);
      if (pair?.key.toLowerCase() === "command.time") {
        defaultCommandTime = Math.max(1, Number(pair.value) || defaultCommandTime);
      } else if (pair?.key.toLowerCase() === "command.steptime") {
        defaultStepTime = parseNonNegativeFrameCount(pair.value, defaultStepTime);
      } else if (pair?.key.toLowerCase() === "command.buffer.time") {
        defaultBufferTime = Math.max(1, Math.min(30, Number(pair.value) || defaultBufferTime));
      } else if (pair?.key.toLowerCase() === "command.buffer.hitpause") {
        defaultBufferHitPause = parseBool(pair.value) ?? defaultBufferHitPause;
      }
      continue;
    }
    if (!inCommand) {
      continue;
    }
    const pair = parseKeyValue(line.content);
    if (pair) {
      currentParams[pair.key.toLowerCase()] = pair.value;
    }
  }
  flush();

  return {
    commands,
    remap: { ...buttonRemap },
    defaults: {
      time: defaultCommandTime,
      stepTime: defaultStepTime > 0 ? defaultStepTime : defaultCommandTime,
      bufferTime: defaultBufferTime,
      bufferHitPause: defaultBufferHitPause,
    },
    diagnostics,
  };
}

export function tokenizeCommand(command: string): MugenCommandToken[] {
  return parseCommandSequence(command, createDefaultButtonRemap()).sequence;
}

function parseCommandSequence(
  command: string,
  buttonRemap: Record<string, string>,
): {
  sequence: MugenCommandToken[];
  resolvedCommand: string;
  remapped: boolean;
  disabled?: boolean;
  disabledReason?: string;
} {
  const tokens: MugenCommandToken[] = [];
  let buffer = "";
  let remapped = false;
  const disabledButtons = new Set<string>();

  const pushBuffer = (): void => {
    const raw = buffer.trim();
    buffer = "";
    if (!raw) {
      return;
    }

    let value = raw;
    while (value.length > 0 && modifiers.has(value[0] ?? "")) {
      const modifier = value[0] ?? "";
      value = value.slice(1);
      let chargeTime: number | undefined;
      if (modifier === "~" || modifier === "/") {
        const chargeMatch = /^(\d+)/.exec(value);
        if (chargeMatch?.[1]) {
          chargeTime = Number(chargeMatch[1]);
          value = value.slice(chargeMatch[1].length);
        }
      }
      tokens.push({
        raw: chargeTime !== undefined ? `${modifier}${chargeTime}` : modifier,
        type: "modifier",
        chargeTime,
      });
    }

    if (!value) {
      return;
    }

    if (buttons.has(value)) {
      const button = value.toLowerCase();
      const mapped = buttonRemap[button] ?? button;
      if (mapped === "") {
        disabledButtons.add(button);
        tokens.push({ raw: value, type: "button" });
        remapped = true;
        return;
      }
      if (mapped !== button) {
        remapped = true;
      }
      tokens.push({ raw: mapped, type: "button" });
    } else {
      const normalizedDirection = value.toUpperCase();
      if (directions.has(normalizedDirection)) {
        tokens.push({ raw: value, type: "direction" });
      } else {
        tokens.push({ raw: value, type: "combo" });
      }
    }
  };

  for (const char of command) {
    if (char === "," || char === "+" || char === "|") {
      pushBuffer();
      tokens.push({
        raw: char,
        type: char === "," ? "separator" : char === "|" ? "alternative" : "combo",
      });
    } else {
      buffer += char;
    }
  }
  pushBuffer();
  const disabled = disabledButtons.size > 0;
  return {
    sequence: tokens,
    resolvedCommand: tokens.map((token) => token.raw).join(" "),
    remapped,
    disabled,
    disabledReason: disabled ? `Remap disables ${[...disabledButtons].sort().join(", ")}` : undefined,
  };
}

function createDefaultButtonRemap(): Record<string, string> {
  return Object.fromEntries([...buttons].map((button) => [button, button]));
}

function parseBool(value: string): boolean | undefined {
  const lower = unquote(value).trim().toLowerCase();
  if (lower === "1" || lower === "true" || lower === "yes") {
    return true;
  }
  if (lower === "0" || lower === "false" || lower === "no") {
    return false;
  }
  return undefined;
}

function parsePositiveFrameCount(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseBufferFrameCount(value: string | undefined, fallback: number): number {
  return Math.max(1, Math.min(30, parsePositiveFrameCount(value, fallback)));
}

function parseNonNegativeFrameCount(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}

function applyButtonRemap(
  pair: { key: string; value: string },
  buttonRemap: Record<string, string>,
  diagnostics: MugenCommandFile["diagnostics"],
  file: string | undefined,
  line: number,
): void {
  const from = pair.key.toLowerCase();
  const to = unquote(pair.value).toLowerCase();
  if (!buttons.has(from)) {
    diagnostics.push(
      createDiagnostic("warning", "Unsupported CMD remap source", {
        format: "cmd",
        file,
        line,
        raw: `${pair.key} = ${pair.value}`,
      }),
    );
    return;
  }
  if (to !== "" && !buttons.has(to)) {
    diagnostics.push(
      createDiagnostic("warning", "Unsupported CMD remap target", {
        format: "cmd",
        file,
        line,
        raw: `${pair.key} = ${pair.value}`,
      }),
    );
    return;
  }
  buttonRemap[from] = to;
}
