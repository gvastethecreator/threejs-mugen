import type { MugenDiagnosticSeverity } from "../model/MugenAnimation";

export type CompatibilityProfileId = "native-runtime" | "mugen-1.0" | "mugen-1.1" | "ikemen-go-scan";

export type IkemenScanFinding = {
  category: "file" | "reference" | "controller" | "trigger" | "stage" | "config" | "screenpack";
  feature: string;
  severity: MugenDiagnosticSeverity;
  location: string;
  raw?: string;
  fallback: string;
  count: number;
};

export type IkemenScanReport = {
  profile: "ikemen-go-scan";
  detected: boolean;
  level: "clean" | "recognized-unsupported";
  files: {
    zss: string[];
    lua: string[];
    config: string[];
    model: string[];
    screenpack: string[];
  };
  features: Record<string, number>;
  findings: IkemenScanFinding[];
  summary: string;
  claimAllowed: string;
  claimBlocked: string;
};

export function createEmptyIkemenScanReport(): IkemenScanReport {
  return {
    profile: "ikemen-go-scan",
    detected: false,
    level: "clean",
    files: {
      zss: [],
      lua: [],
      config: [],
      model: [],
      screenpack: [],
    },
    features: {},
    findings: [],
    summary: "No IKEMEN-only features detected by the scanner.",
    claimAllowed: "No IKEMEN scanner-only claim for this package.",
    claimBlocked: "IKEMEN execution remains blocked until ZSS/Lua/profile runtime gates exist.",
  };
}

export function scanIkemenFeatures(input: {
  paths: string[];
  readText: (path: string) => string | undefined;
}): IkemenScanReport {
  const findings = new FindingAccumulator();
  const files = createEmptyIkemenScanReport().files;
  const sortedPaths = [...input.paths].sort((a, b) => a.localeCompare(b));
  const zssFallbackTargets = new Set(
    sortedPaths
      .map((path) => normalize(path).toLowerCase())
      .filter((path) => path.endsWith(".zss"))
      .map((path) => path.slice(0, -4)),
  );

  for (const path of sortedPaths) {
    scanPath(path, files, findings);
  }

  for (const path of sortedPaths.filter(isTextLikePath)) {
    const text = input.readText(path);
    if (text === undefined) {
      continue;
    }
    scanText(path, text, findings, zssFallbackTargets);
  }

  const list = findings.list();
  const features = list.reduce<Record<string, number>>((counts, finding) => {
    counts[finding.feature] = (counts[finding.feature] ?? 0) + finding.count;
    return counts;
  }, {});
  const detected = list.length > 0;
  return {
    profile: "ikemen-go-scan",
    detected,
    level: detected ? "recognized-unsupported" : "clean",
    files,
    features,
    findings: list,
    summary: detected
      ? `${list.reduce((total, item) => total + item.count, 0)} IKEMEN-only scanner finding(s) recognized and kept out of runtime execution.`
      : "No IKEMEN-only features detected by the scanner.",
    claimAllowed: detected
      ? "IKEMEN feature recognized by scanner and not executed."
      : "No IKEMEN scanner-only claim for this package.",
    claimBlocked: "IKEMEN compatible, ZSS/Lua execution, rollback/netplay, and IKEMEN-only runtime behavior remain blocked.",
  };
}

function scanPath(
  path: string,
  files: IkemenScanReport["files"],
  findings: FindingAccumulator,
): void {
  const lower = normalize(path).toLowerCase();
  if (lower.endsWith(".zss")) {
    addUnique(files.zss, path);
    findings.add("file", "ZSS script file", path, undefined, "ZSS is scanner-only and is not executed by the browser runtime.");
  }
  if (lower.endsWith(".lua")) {
    addUnique(files.lua, path);
    findings.add("file", "Lua script file", path, undefined, "Lua hooks are scanner-only and are not executed by the browser runtime.");
  }
  if (/(^|\/)(config|save\/config)\.json$/i.test(lower)) {
    addUnique(files.config, path);
    findings.add("config", "IKEMEN config JSON", path, undefined, "Config JSON is recognized for reporting only.");
  }
  if (/(^|\/)(select|system|fight|storyboard|logo|intro|ending)\.def$/i.test(lower)) {
    addUnique(files.screenpack, path);
    findings.add("screenpack", "IKEMEN screenpack DEF", path, undefined, "Screenpack and motif files are report-only and are not rendered by the browser runtime.");
  }
  if (/\.(dae|gltf|glb|obj|fbx)$/i.test(lower)) {
    addUnique(files.model, path);
    findings.add("stage", "IKEMEN model stage asset", path, undefined, "Model stage assets are not rendered by the current 2D stage pipeline.");
  }
}

function scanText(path: string, text: string, findings: FindingAccumulator, zssFallbackTargets: Set<string>): void {
  const lines = text.split(/\r?\n/);
  const normalizedPath = normalize(path).toLowerCase();
  const isZss = normalizedPath.endsWith(".zss");
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index] ?? "";
    const line = (isZss ? stripZssComment(raw) : stripComment(raw)).trim();
    if (!line) {
      continue;
    }
    const location = `${path}:${index + 1}`;
    const normalized = line.toLowerCase();
    const assignment = parseAssignment(line);

    if (assignment?.key === "ikemenversion") {
      findings.add("config", "IkemenVersion declaration", location, raw, "Profile-specific behavior is reported but not executed.");
    }
    if (assignment && (/(^|\/).+\.zss\b/.test(assignment.value) || assignment.key === "zss")) {
      findings.add("reference", "ZSS state/script reference", location, raw, "ZSS state code is not compiled or executed.");
    }
    if (assignment && isZssFallbackReference(path, assignment.value, zssFallbackTargets)) {
      findings.add("reference", "ZSS fallback file for CNS reference", location, raw, "A matching .zss file is recognized but not compiled.");
    }
    if (assignment && /^movelist\d*$/.test(assignment.key)) {
      findings.add("screenpack", "IKEMEN movelist reference", location, raw, "Pause/menu movelist metadata is report-only in the browser Studio.");
    }
    if (assignment && (assignment.key === "lua" || assignment.key === "luafile" || assignment.key === "luacode" || /\b[\w./-]+\.lua\b/.test(assignment.value))) {
      findings.add("reference", "Lua script hook", location, raw, "Lua hooks are not executed by the browser runtime.");
    }
    if (assignment?.key === "redirectid") {
      findings.add("controller", "IKEMEN RedirectID controller parameter", location, raw, "Controller redirection is recognized but not executed by the partial runtime.");
    }
    if (assignment && FIGHTFX_ACTION_PARAM_NAMES.has(assignment.key) && /^f\s+[-+]?\d+/i.test(unquote(assignment.value))) {
      findings.add("controller", "IKEMEN fightfx action prefix", location, raw, "fightfx.air animation routing is recognized but not executed.");
    }
    if (assignment?.key === "unlock") {
      findings.add("screenpack", "IKEMEN Lua unlock expression", location, raw, "Select/stage/story unlock Lua is reported but not executed.");
    }
    if (assignment?.key === "commandlist") {
      findings.add("screenpack", "IKEMEN command list reference", location, raw, "Command-list UI metadata is report-only in the browser Studio.");
    }
    if (assignment?.key.startsWith("menu.itemname.")) {
      findings.add("screenpack", "IKEMEN screenpack menu item", location, raw, "Dynamic screenpack menu entries are report-only and are not rendered by the browser runtime.");
      const menuKeyParts = assignment.key.split(".");
      const item = menuKeyParts[menuKeyParts.length - 1];
      if (item && IKEMEN_EXTRA_MENU_ITEMS.has(item)) {
        findings.add("screenpack", `IKEMEN extra menu mode ${item}`, location, raw, "IKEMEN-only menu modes are recognized as metadata only.");
      }
    }
    if (assignment?.key === "type") {
      const controller = canonicalIkemenController(assignment.value);
      if (controller) {
        findings.add("controller", `IKEMEN controller ${controller}`, location, raw, "Controller is recognized as IKEMEN-only and skipped.");
      }
    }
    if (assignment?.key === "flag") {
      const flag = canonicalIkemenAssertFlag(assignment.value);
      if (flag) {
        findings.add("controller", `IKEMEN AssertSpecial flag ${flag}`, location, raw, "AssertSpecial flag is reported; only the current bounded flag subset can affect runtime.");
      }
    }
    if (isZss) {
      scanZssSyntaxLine(line, location, raw, findings);
      for (const zssController of findIkemenZssControllers(line)) {
        findings.add("controller", `IKEMEN controller ${zssController}`, location, raw, "ZSS controller syntax is recognized but not compiled.");
      }
    }
    if (assignment && IKEMEN_STAGE_PARAM_NAMES.has(assignment.key)) {
      findings.add("stage", `IKEMEN stage parameter ${assignment.key}`, location, raw, "3D/Z or extended stage metadata is reported; renderer falls back to the 2D stage path.");
    }
    if (assignment && assignment.key.startsWith("trigger")) {
      for (const trigger of findIkemenTriggers(assignment.value)) {
        findings.add("trigger", `IKEMEN extended trigger ${trigger}`, location, raw, "Extended trigger is not part of the current expression subset.");
      }
    }
    if (path.toLowerCase().endsWith(".lua") && /\bhook\.(add|run|runfirst)\s*\(/.test(normalized)) {
      findings.add("screenpack", "IKEMEN Lua hook system", location, raw, "Lua hook registration/execution is scanner-only and is not run by the browser runtime.");
    }
  }
}

function isTextLikePath(path: string): boolean {
  return /\.(def|cmd|cns|st|const|txt|ini|json|zss|lua)$/i.test(path);
}

function stripComment(line: string): string {
  if (line.trimStart().startsWith("#")) {
    return "";
  }
  const comment = line.indexOf(";");
  return comment >= 0 ? line.slice(0, comment) : line;
}

function stripZssComment(line: string): string {
  return line.trimStart().startsWith("#") ? "" : line;
}

function parseAssignment(line: string): { key: string; value: string } | undefined {
  const index = line.indexOf("=");
  if (index < 0) {
    return undefined;
  }
  const key = line.slice(0, index).trim().toLowerCase();
  const value = line.slice(index + 1).trim();
  return key ? { key, value } : undefined;
}

function normalize(path: string): string {
  return path.replace(/\\/g, "/");
}

function unquote(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function addUnique(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function canonicalIkemenController(value: string): string | undefined {
  const key = value.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return IKEMEN_CONTROLLER_NAMES.get(key);
}

function findIkemenZssControllers(value: string): string[] {
  const found = new Set<string>();
  for (const match of value.matchAll(/\b([a-z][a-z0-9_]*)\s*\{/gi)) {
    const key = match[1]?.toLowerCase();
    if (!key || ZSS_CONTROL_KEYWORDS.has(key)) {
      continue;
    }
    const controller = IKEMEN_CONTROLLER_NAMES.get(key);
    if (controller) {
      found.add(controller);
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

function canonicalIkemenAssertFlag(value: string): string | undefined {
  const key = value.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  return IKEMEN_ASSERT_FLAGS.get(key);
}

function findIkemenTriggers(value: string): string[] {
  const found = new Set<string>();
  for (const token of value.toLowerCase().match(/[a-z_][a-z0-9_.]*/g) ?? []) {
    const trigger = IKEMEN_TRIGGER_NAMES.get(token);
    if (trigger && !BOUNDED_SUPPORTED_TRIGGER_NAMES.has(trigger)) {
      found.add(trigger);
    }
  }
  return [...found].sort((a, b) => a.localeCompare(b));
}

function scanZssSyntaxLine(line: string, location: string, raw: string, findings: FindingAccumulator): void {
  if (/^\[function\b/i.test(line)) {
    findings.add("controller", "ZSS function definition", location, raw, "ZSS functions are recognized as scanner-only code structure.");
  }
  if (/\blet\s+[a-z_][a-z0-9_]*\s*=/i.test(line)) {
    findings.add("controller", "ZSS local variable", location, raw, "ZSS local variables are not compiled by the browser runtime.");
  }
  if (/\b(for|while)\b/i.test(line)) {
    findings.add("controller", "ZSS loop statement", location, raw, "ZSS loops are scanner-only and are not executed.");
  }
  if (/\bignorehitpause\b/i.test(line)) {
    findings.add("controller", "ZSS ignoreHitPause block", location, raw, "ZSS ignoreHitPause blocks are not executed by the partial runtime.");
  }
  if (/\bpersistent\s*\(/i.test(line)) {
    findings.add("controller", "ZSS persistent block", location, raw, "ZSS persistent blocks are not executed by the partial runtime.");
  }
  if (/^\s*(if|else\s+if|while|switch)\b/i.test(line)) {
    for (const trigger of findIkemenTriggers(line)) {
      findings.add("trigger", `IKEMEN extended trigger ${trigger}`, location, raw, "Extended trigger is not part of the current expression subset.");
    }
  }
}

function isZssFallbackReference(path: string, value: string, zssFallbackTargets: Set<string>): boolean {
  const reference = normalize(unquote(value)).toLowerCase();
  if (!reference || reference.endsWith(".zss") || !/\.(cns|st|txt|ini)$/i.test(reference)) {
    return false;
  }
  const directory = normalize(path).toLowerCase().split("/").slice(0, -1).join("/");
  const candidates = new Set([reference]);
  if (directory && !reference.includes("/")) {
    candidates.add(`${directory}/${reference}`);
  }
  for (const target of zssFallbackTargets) {
    for (const candidate of candidates) {
      if (target === candidate || target.endsWith(`/${candidate}`)) {
        return true;
      }
    }
  }
  return false;
}

const FIGHTFX_ACTION_PARAM_NAMES = new Set(["anim", "projanim", "projhitanim", "projremanim", "projcancelanim"]);

const ZSS_CONTROL_KEYWORDS = new Set(["if", "else", "switch", "for", "while", "persistent", "ignorehitpause"]);

const IKEMEN_EXTRA_MENU_ITEMS = new Set([
  "bonusgames",
  "bossrush",
  "freebattle",
  "joinadd",
  "netplayteamcoop",
  "netplayversus",
  "netplaysurvivalcoop",
  "randomtest",
  "replay",
  "scorechallenge",
  "server",
  "serverhost",
  "serverjoin",
  "storymode",
  "timeattack",
  "timechallenge",
  "versuscoop",
  "vs100kumite",
]);

const IKEMEN_CONTROLLER_NAMES = new Map(
  [
    "AssertAnalogVector",
    "AssertCommand",
    "AssertInput",
    "Camera",
    "CameraCtrl",
    "ChangeMovelist",
    "Depth",
    "Dialogue",
    "DizzyPointsAdd",
    "DizzyPointsSet",
    "DizzySet",
    "GetHitVarSet",
    "GroundLevelOffset",
    "GuardBreakSet",
    "GuardPointsAdd",
    "GuardPointsSet",
    "Height",
    "LifeBarAction",
    "LoadFile",
    "MapAdd",
    "MapReset",
    "MapSet",
    "MatchRestart",
    "ModifyBGCtrl",
    "ModifyBGCtrl3D",
    "ModifyBGM",
    "ModifyHitDef",
    "ModifyPlayer",
    "ModifyProjectile",
    "ModifyReflection",
    "ModifyReversalDef",
    "ModifyShadow",
    "ModifySnd",
    "ModifyStageBG",
    "ModifyStageVar",
    "ModifyText",
    "ParentMapAdd",
    "ParentMapSet",
    "RemapSprite",
    "RootMapAdd",
    "RootMapSet",
    "RoundTimeAdd",
    "RoundTimeSet",
    "ScoreAdd",
    "TagIn",
    "TagOut",
    "TargetScoreAdd",
    "TeamMapAdd",
    "TeamMapSet",
    "Zoom",
  ].map((name) => [name.toLowerCase(), name]),
);

const IKEMEN_ASSERT_FLAGS = new Map(
  [
    "CameraFreeze",
    "NoLifeBarAction",
    "NoLifeBarDisplay",
    "NoMusic",
    "NoScore",
    "PostRoundInput",
    "RoundFreeze",
    "RoundNoOver",
    "RoundNoSkip",
    "SkipRoundDisplay",
  ].map((name) => [name.toLowerCase(), name]),
);

const IKEMEN_STAGE_PARAM_NAMES = new Set([
  "topz",
  "botz",
  "ztopscale",
  "zbottomscale",
  "topscale",
  "botscale",
  "depthtoscreen",
  "zoffsetlink",
  "startz",
  "stagecamera.z",
  "model",
  "modelfile",
  "modelscale",
  "attachedchar",
  "fov",
  "near",
  "far",
  "yshift",
  "autozoom",
  "zoomindelay",
  "zoominspeed",
  "zoomoutspeed",
  "boundhighzoomdelta",
  "verticalfollowzoomdelta",
  "lowestcap",
]);

const IKEMEN_TRIGGER_NAMES = new Map(
  [
    "AILevelF",
    "AirJumpCount",
    "Alpha",
    "Analog",
    "Angle",
    "XAngle",
    "YAngle",
    "AnimElemVar",
    "AnimLength",
    "AnimPlayerNo",
    "SpritePlayerNo",
    "Atan2",
    "Attack",
    "AttackMul",
    "BGMVar",
    "Clamp",
    "ClsnOverlap",
    "ClsnVar",
    "ComboCount",
    "ConsecutiveWins",
    "Const1080p",
    "DecisiveRound",
    "Defence",
    "DefenceMul",
    "Deg",
    "DisplayName",
    "Dizzy",
    "DizzyPoints",
    "DizzyPointsMax",
    "EnvShakeVar",
    "ExplodVar",
    "FightScreenState",
    "FightScreenVar",
    "FightTime",
    "FirstAttack",
    "Float",
    "GameMode",
    "GameOption",
    "GameVar",
    "GroundAngle",
    "GuardBreak",
    "GuardCount",
    "GuardPoints",
    "GuardPointsMax",
    "HelperIndexExist",
    "HelperVar",
    "HelperName",
    "HitOverridden",
    "IkemenVersion",
    "InCustomAnim",
    "InCustomState",
    "Index",
    "InputTime",
    "IntroState",
    "IsAsserted",
    "IsHost",
    "LastPlayerID",
    "LayerNo",
    "Lerp",
    "LocalCoord",
    "Map",
    "MemberNo",
    "MotifState",
    "MotifVar",
    "MoveCountered",
    "MoveHitVar",
    "NumPlayer",
    "Offset",
    "OutroState",
    "PalFXVar",
    "PauseTime",
    "PlayerIndexExist",
    "PlayerNo",
    "PlayerNoExist",
    "PrevAnim",
    "PrevMoveType",
    "PrevStateType",
    "ProjClsnOverlap",
    "ProjVar",
    "RandomRange",
    "ReceivedDamage",
    "ReceivedHits",
    "RedLife",
    "ReversalDefAttr",
    "Round",
    "RoundTime",
    "RunOrder",
    "Scale",
    "Score",
    "ScoreTotal",
    "SelfCommand",
    "SelfStateNoExist",
    "Shader",
    "Sign",
    "SoundVar",
    "SpriteVar",
    "SprPriority",
    "StageBackEdgeDist",
    "StageConst",
    "StageFrontEdgeDist",
    "StageTime",
    "StandBy",
    "TeamLeader",
    "TeamSize",
    "TimeElapsed",
    "TimeRemaining",
    "TimeTotal",
    "WinClutch",
    "WinHyper",
    "WinSpecial",
    "XShear",
    "ZoomVar",
  ].map((name) => [name.toLowerCase(), name]),
);

const BOUNDED_SUPPORTED_TRIGGER_NAMES = new Set(["PrevAnim", "PrevMoveType", "PrevStateType"]);

class FindingAccumulator {
  private readonly findings = new Map<string, IkemenScanFinding>();

  add(
    category: IkemenScanFinding["category"],
    feature: string,
    location: string,
    raw: string | undefined,
    fallback: string,
  ): void {
    const key = `${category}:${feature}:${location}:${raw ?? ""}`;
    const current = this.findings.get(key);
    if (current) {
      current.count += 1;
      return;
    }
    this.findings.set(key, {
      category,
      feature,
      severity: "warning",
      location,
      raw,
      fallback,
      count: 1,
    });
  }

  list(): IkemenScanFinding[] {
    return [...this.findings.values()].sort((left, right) =>
      `${left.category}:${left.feature}:${left.location}`.localeCompare(`${right.category}:${right.feature}:${right.location}`),
    );
  }
}
