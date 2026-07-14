import type { MugenStateController, MugenStateDef, MugenStateFile } from "../model/MugenState";
import { createDiagnostic, parseKeyValue, parseNumber, parseTextLines } from "./text";

export function parseCns(text: string, file?: string): MugenStateFile {
  const lines = parseTextLines(text);
  const states: MugenStateDef[] = [];
  const controllers: MugenStateController[] = [];
  const constants: Record<string, number> = {};
  const diagnostics: MugenStateFile["diagnostics"] = [];
  let currentState: MugenStateDef | undefined;
  let currentController: MugenStateController | undefined;
  let currentSection: string | undefined;

  for (const line of lines) {
    if (!line.content) {
      continue;
    }

    const stateDefMatch = /^\[Statedef\s+(-?\d+)\]$/i.exec(line.content);
    if (stateDefMatch) {
      currentSection = undefined;
      currentState = {
        id: Number(stateDefMatch[1]),
        rawParams: {},
        controllers: [],
        line: line.number,
      };
      states.push(currentState);
      currentController = undefined;
      continue;
    }

    const stateControllerMatch = /^\[State\s+(-?\d+)\s*,?\s*([^\]]*)\]$/i.exec(line.content);
    if (stateControllerMatch) {
      currentSection = undefined;
      if (!currentState || currentState.id !== Number(stateControllerMatch[1])) {
        currentState = states.find((state) => state.id === Number(stateControllerMatch[1]));
      }
      const stateId = Number(stateControllerMatch[1]);
      currentController = {
        stateId,
        name: stateControllerMatch[2]?.trim() || undefined,
        type: "",
        triggers: [],
        params: {},
        line: line.number,
        rawHeader: line.raw,
      };
      controllers.push(currentController);
      currentState?.controllers.push(currentController);
      continue;
    }

    if (/^\[[^\]]+\]$/.test(line.content)) {
      currentController = undefined;
      currentState = undefined;
      currentSection = line.content.slice(1, -1).trim().toLowerCase();
      continue;
    }

    const pair = parseKeyValue(line.content);
    if (!pair) {
      diagnostics.push(
        createDiagnostic("warning", "Unrecognized CNS line", {
          format: "cns",
          file,
          line: line.number,
          raw: line.raw,
        }),
      );
      continue;
    }

    if (currentController) {
      const lowerKey = pair.key.toLowerCase();
      if (lowerKey === "triggerall" || /^trigger\d+$/.test(lowerKey)) {
        currentController.triggers.push({
          index: lowerKey === "triggerall" ? 0 : Number(lowerKey.replace("trigger", "")),
          expression: pair.value,
          raw: line.raw,
          line: line.number,
        });
      } else {
        currentController.params[pair.key] = pair.value;
        if (lowerKey === "type") {
          currentController.type = pair.value;
        }
      }
      continue;
    }

    if (currentState) {
      applyStateParam(currentState, pair.key, pair.value);
    } else if (currentSection === "movement") {
      applySectionConstant(constants, "movement", pair.key, pair.value);
    } else if (currentSection === "data") {
      applySectionConstant(constants, "data", pair.key, pair.value);
    } else if (currentSection === "velocity") {
      applySectionConstant(constants, "velocity", pair.key, pair.value);
    } else if (currentSection === "size") {
      applySectionConstant(constants, "size", pair.key, pair.value);
    } else if (currentSection === "constants") {
      applyCustomConstant(constants, pair.key, pair.value);
    }
  }

  for (const controller of controllers) {
    if (!controller.type) {
      diagnostics.push(
        createDiagnostic("warning", "State controller is missing type", {
          format: "cns",
          file,
          line: controller.line,
          raw: controller.rawHeader,
        }),
      );
      controller.type = controller.name || "Unknown";
    }
  }

  return { states, controllers, constants, diagnostics };
}

function applyStateParam(state: MugenStateDef, key: string, value: string): void {
  const lower = key.toLowerCase();
  state.rawParams[key] = value;
  if (lower === "type") {
    state.type = value;
  } else if (lower === "movetype") {
    state.moveType = value;
  } else if (lower === "physics") {
    state.physics = value;
  } else if (lower === "anim") {
    state.anim = parseNumber(value);
  } else if (lower === "ctrl") {
    state.ctrl = parseNumber(value);
  } else if (lower === "velset") {
    const parts = value.split(",").map((part) => Number(part.trim()));
    if (parts.length >= 2 && parts.every((part) => Number.isFinite(part))) {
      state.velSet = [parts[0] ?? 0, parts[1] ?? 0];
    }
  } else if (lower === "hitdefpersist") {
    state.hitDefPersist = (parseNumber(value) ?? 0) !== 0;
  } else if (lower === "movehitpersist") {
    state.moveHitPersist = (parseNumber(value) ?? 0) !== 0;
  } else if (lower === "hitcountpersist") {
    state.hitCountPersist = (parseNumber(value) ?? 0) !== 0;
  }
}

function applySectionConstant(constants: Record<string, number>, section: "data" | "movement" | "velocity" | "size", key: string, value: string): void {
  const name = `${section}.${key.trim().toLowerCase()}`;
  const values = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
  if (values.length === 0 || values[0] === undefined) {
    return;
  }
  constants[name] = values[0];
  if (values.length >= 2 && values[1] !== undefined) {
    constants[`${name}.x`] = values[0];
    constants[`${name}.y`] = values[1];
  }
  if (section === "size" && (key.trim().toLowerCase() === "depth" || key.trim().toLowerCase() === "attack.depth")) {
    constants[`${name}.top`] = values[0];
    constants[`${name}.bottom`] = values[1] ?? values[0];
  }
  if (section === "size" && key.trim().toLowerCase().endsWith(".sizebox") && values.length >= 4) {
    constants[`${name}.left`] = values[0]!;
    constants[`${name}.top`] = values[1]!;
    constants[`${name}.right`] = values[2]!;
    constants[`${name}.bottom`] = values[3]!;
  }
}

function applyCustomConstant(constants: Record<string, number>, key: string, value: string): void {
  const name = key.trim().toLowerCase();
  const parsed = Number(value.split(",")[0]?.trim());
  if (name && Number.isFinite(parsed)) {
    constants[name] = parsed;
  }
}
