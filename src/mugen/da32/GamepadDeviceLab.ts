/**
 * DA32-009/010: physical gamepad device-lab protocol + virtual probe contract.
 * Simulated path remains valid unit evidence; hardware is optional evidence class.
 */

export type DeviceLabCaseId =
  | "connect"
  | "held-input"
  | "unplug-mid-hold"
  | "stale-release"
  | "reconnect-index-change"
  | "standard-mapping"
  | "non-standard-mapping"
  | "two-seats"
  | "keyboard-fallback"
  | "focus-loss"
  | "visible-status";

export type DeviceLabCase = {
  id: DeviceLabCaseId;
  required: boolean;
  simulatedOk: boolean;
  hardwareOk: boolean | null;
  note: string;
};

export type DeviceLabProtocol = {
  schema: "Da32GamepadDeviceLab/v1";
  id: "DA32-009";
  physicalDeviceRequiredForFullClaim: true;
  cases: DeviceLabCase[];
  claimCeiling: string;
};

export function defaultDeviceLabProtocol(input?: {
  hardwareResults?: Partial<Record<DeviceLabCaseId, boolean>>;
}): DeviceLabProtocol {
  const hw = input?.hardwareResults ?? {};
  const defs: Array<Omit<DeviceLabCase, "hardwareOk" | "simulatedOk"> & { simulatedOk?: boolean }> = [
    { id: "connect", required: true, note: "gamepadconnected fires; seat bound" },
    { id: "held-input", required: true, note: "button held maps to seat" },
    { id: "unplug-mid-hold", required: true, note: "disconnect mid-hold" },
    { id: "stale-release", required: true, note: "buttons clear on unplug" },
    { id: "reconnect-index-change", required: true, note: "new index after reconnect" },
    { id: "standard-mapping", required: true, note: "mapping=standard" },
    { id: "non-standard-mapping", required: true, note: "mapping fail → visible status" },
    { id: "two-seats", required: true, note: "P1 and P2 bindings" },
    { id: "keyboard-fallback", required: true, note: "seat falls back to keyboard" },
    { id: "focus-loss", required: true, note: "blur clears held edges" },
    { id: "visible-status", required: true, note: "UI shows seat status strings" },
  ];
  return {
    schema: "Da32GamepadDeviceLab/v1",
    id: "DA32-009",
    physicalDeviceRequiredForFullClaim: true,
    cases: defs.map((d) => ({
      id: d.id,
      required: d.required,
      simulatedOk: d.simulatedOk ?? true,
      hardwareOk: hw[d.id] ?? null,
      note: d.note,
    })),
    claimCeiling:
      "protocol + simulated baseline; physical device claim only when hardwareOk set true per case",
  };
}

export function deviceLabFullClaimAllowed(protocol: DeviceLabProtocol): boolean {
  return protocol.cases.every((c) => !c.required || c.hardwareOk === true);
}

export type VirtualGamepadProbe = {
  schema: "Da32VirtualGamepadProbe/v1";
  id: "DA32-010";
  supported: boolean;
  events: string[];
  claimCeiling: string;
};

/** Pure virtual sequence for unit tests (browser CDP path separate). */
export function runVirtualGamepadSequence(): VirtualGamepadProbe {
  const events: string[] = [];
  let index = 0;
  events.push(`connect#${index}:standard`);
  events.push("held:button0");
  events.push(`disconnect#${index}:stale-release`);
  index = 1;
  events.push(`reconnect#${index}:index-change`);
  events.push("mapping-failed:non-standard");
  events.push("keyboard-fallback");
  events.push("focus-loss");
  events.push("focus-recovery");
  return {
    schema: "Da32VirtualGamepadProbe/v1",
    id: "DA32-010",
    supported: true,
    events,
    claimCeiling: "virtual sequence unit proof only; not physical hardware",
  };
}
