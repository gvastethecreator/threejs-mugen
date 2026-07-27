/**
 * DA30-068: one bounded motif/screenpack flow: title→select→versus→fight→results.
 */

export type MotifScreen = "title" | "select" | "versus" | "fight" | "results";

export type MotifFlowState = {
  schema: "Da30MotifScreenpackFlow/v1";
  screen: MotifScreen;
  localCoord: [number, number];
  fontsOk: boolean;
  soundsOk: boolean;
  missing: string[];
  mobileFit: boolean;
  log: string[];
};

const ORDER: MotifScreen[] = ["title", "select", "versus", "fight", "results"];

export function createMotifFlow(localCoord: [number, number] = [320, 240]): MotifFlowState {
  return {
    schema: "Da30MotifScreenpackFlow/v1",
    screen: "title",
    localCoord,
    fontsOk: true,
    soundsOk: true,
    missing: [],
    mobileFit: localCoord[0] >= 320,
    log: ["enter-title"],
  };
}

export function motifAdvance(s: MotifFlowState): MotifFlowState {
  const i = ORDER.indexOf(s.screen);
  if (i < 0 || i >= ORDER.length - 1) return { ...s, log: [...s.log, "end"] };
  const next = ORDER[i + 1]!;
  return { ...s, screen: next, log: [...s.log, `enter-${next}`] };
}

export function motifMissingAsset(s: MotifFlowState, asset: string): MotifFlowState {
  return {
    ...s,
    missing: [...s.missing, asset],
    fontsOk: asset.includes("fnt") ? false : s.fontsOk,
    soundsOk: asset.includes("snd") ? false : s.soundsOk,
    log: [...s.log, `missing-${asset}`],
  };
}

export function motifReset(s: MotifFlowState): MotifFlowState {
  return { ...createMotifFlow(s.localCoord), log: [...s.log, "reset-title"] };
}

export function runMotifFlow(): {
  ok: boolean;
  screens: MotifScreen[];
  missingHandled: boolean;
  returnToTitle: boolean;
  mobileFit: boolean;
} {
  let s = createMotifFlow([640, 360]);
  const screens: MotifScreen[] = [s.screen];
  s = motifAdvance(s);
  screens.push(s.screen);
  s = motifMissingAsset(s, "font/title.fnt");
  const missingHandled = s.missing.includes("font/title.fnt") && !s.fontsOk;
  s = motifAdvance(s);
  screens.push(s.screen);
  s = motifAdvance(s);
  screens.push(s.screen);
  s = motifAdvance(s);
  screens.push(s.screen);
  s = motifReset(s);
  return {
    ok:
      screens.join(">") === "title>select>versus>fight>results" &&
      s.screen === "title" &&
      missingHandled &&
      s.mobileFit,
    screens,
    missingHandled,
    returnToTitle: s.screen === "title",
    mobileFit: s.mobileFit,
  };
}
