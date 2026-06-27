import { normalizeMugenExpression } from "../compiler/ExpressionCompiler";
import type { CharacterRuntimeState } from "./types";

export { normalizeMugenExpression } from "../compiler/ExpressionCompiler";

export type ExpressionContext = {
  self: CharacterRuntimeState;
  opponent?: CharacterRuntimeState;
  animExists?: (animationId: number) => boolean;
  commandActive?: (name: string) => boolean;
  getConst?: (name: string) => number | undefined;
  getHitVar?: (name: string) => number | undefined;
  hitDefAttr?: (attrFilter: string) => boolean;
  hitCount?: () => number;
  hitOver?: () => boolean;
  hitShakeOver?: () => boolean;
  inGuardDist?: () => boolean;
  moveContact?: () => boolean | number;
  moveHit?: () => boolean | number;
  moveGuarded?: () => boolean | number;
  moveReversed?: () => boolean | number;
  numExplod?: (explodId?: number) => number;
  numHelper?: (helperId?: number) => number;
  numProj?: (projectileId?: number) => number;
  numTarget?: (targetId?: number) => number;
  projContact?: (projectileId?: number) => boolean;
  projHit?: (projectileId?: number) => boolean;
  projGuarded?: (projectileId?: number) => boolean;
  projContactTime?: (projectileId?: number) => number;
  projHitTime?: (projectileId?: number) => number;
  projGuardedTime?: (projectileId?: number) => number;
  animElemTime?: (elementNumber: number) => number | undefined;
  random?: () => number;
  reportUnsupported?: (feature: string) => void;
  stateTime?: number;
  uniqueHitCount?: () => number;
  animTimeRemaining?: number;
};

export function evaluateExpression(expression: string, context: ExpressionContext): boolean | number | string {
  const normalized = normalizeMugenExpression(expression);
  const redirected = evaluateEnemyNearRedirect(normalized, context);
  if (redirected !== undefined) {
    return redirected;
  }
  const commandMatch = /^command\s*(=|!=)\s*"([^"]+)"$/i.exec(normalized.trim());
  if (commandMatch) {
    const active = context.commandActive?.(commandMatch[2] ?? "") ? 1 : 0;
    return commandMatch[1] === "!=" ? (active ? 0 : 1) : active;
  }
  const hitDefAttrMatch = /^hitdefattr\s*(=|!=)\s*(.+)$/i.exec(normalized.trim());
  if (hitDefAttrMatch) {
    const active = context.hitDefAttr?.(hitDefAttrMatch[2] ?? "") ? 1 : 0;
    return hitDefAttrMatch[1] === "!=" ? (active ? 0 : 1) : active;
  }

  const parser = new ExpressionParser(tokenize(normalized), context);
  return parser.parse();
}

type ExpressionValue = boolean | number | string;

const commandIdentifierMarker = "__mugen_command_identifier__";

function evaluateEnemyNearRedirect(expression: string, context: ExpressionContext): ExpressionValue | undefined {
  const redirect = /^enemynear(?:\s*\(([^)]*)\))?\s*,\s*(.+)$/i.exec(expression.trim());
  if (!redirect) {
    return undefined;
  }
  const index = redirect[1]?.trim();
  if (index && index !== "0") {
    context.reportUnsupported?.("enemynear(index)");
    return 0;
  }
  if (!context.opponent) {
    context.reportUnsupported?.("enemynear");
    return 0;
  }
  return evaluateExpression(redirect[2] ?? "", {
    ...context,
    self: context.opponent,
    opponent: context.self,
  });
}

type Token =
  | { type: "number"; value: string }
  | { type: "string"; value: string }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma"; value: "," };

class ExpressionParser {
  private cursor = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly context: ExpressionContext,
  ) {}

  parse(): ExpressionValue {
    if (this.tokens.length === 0) {
      return false;
    }
    return this.parseOr();
  }

  private parseOr(): ExpressionValue {
    let left = this.parseAnd();
    while (this.matchOperator("||")) {
      left = truthy(left) || truthy(this.parseAnd()) ? 1 : 0;
    }
    return left;
  }

  private parseAnd(): ExpressionValue {
    let left = this.parseEquality();
    while (this.matchOperator("&&")) {
      left = truthy(left) && truthy(this.parseEquality()) ? 1 : 0;
    }
    return left;
  }

  private parseEquality(): ExpressionValue {
    let left = this.parseComparison();
    while (true) {
      if (this.matchOperator("=")) {
        left = this.compareEquality(left, this.parseComparison(), false);
      } else if (this.matchOperator("!=")) {
        left = this.compareEquality(left, this.parseComparison(), true);
      } else {
        return left;
      }
    }
  }

  private compareEquality(left: ExpressionValue, right: ExpressionValue, negated: boolean): number {
    if (left === commandIdentifierMarker) {
      const active = typeof right === "string" && this.context.commandActive?.(right) ? 1 : 0;
      return negated ? (active ? 0 : 1) : active;
    }
    if (right === commandIdentifierMarker) {
      const active = typeof left === "string" && this.context.commandActive?.(left) ? 1 : 0;
      return negated ? (active ? 0 : 1) : active;
    }
    const equal = compareValues(left, right) === 0;
    return negated ? (equal ? 0 : 1) : equal ? 1 : 0;
  }

  private parseComparison(): ExpressionValue {
    let left = this.parseTerm();
    while (true) {
      if (this.matchOperator("<=")) {
        left = compareValues(left, this.parseTerm()) <= 0 ? 1 : 0;
      } else if (this.matchOperator(">=")) {
        left = compareValues(left, this.parseTerm()) >= 0 ? 1 : 0;
      } else if (this.matchOperator("<")) {
        left = compareValues(left, this.parseTerm()) < 0 ? 1 : 0;
      } else if (this.matchOperator(">")) {
        left = compareValues(left, this.parseTerm()) > 0 ? 1 : 0;
      } else {
        return left;
      }
    }
  }

  private parseTerm(): ExpressionValue {
    let left = this.parseFactor();
    while (true) {
      if (this.matchOperator("+")) {
        left = numeric(left) + numeric(this.parseFactor());
      } else if (this.matchOperator("-")) {
        left = numeric(left) - numeric(this.parseFactor());
      } else {
        return left;
      }
    }
  }

  private parseFactor(): ExpressionValue {
    let left = this.parseUnary();
    while (true) {
      if (this.matchOperator("*")) {
        left = numeric(left) * numeric(this.parseUnary());
      } else if (this.matchOperator("/")) {
        const divisor = numeric(this.parseUnary());
        left = divisor === 0 ? 0 : numeric(left) / divisor;
      } else {
        return left;
      }
    }
  }

  private parseUnary(): ExpressionValue {
    if (this.matchOperator("!")) {
      return truthy(this.parseUnary()) ? 0 : 1;
    }
    if (this.matchOperator("-")) {
      return -numeric(this.parseUnary());
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionValue {
    const token = this.advance();
    if (!token) {
      return false;
    }
    if (token.type === "number") {
      return Number(token.value);
    }
    if (token.type === "string") {
      return token.value;
    }
    if (token.type === "identifier") {
      if (this.matchParen("(")) {
        if (rawArgumentFunctions.has(token.value.toLowerCase())) {
          return this.evaluateFunction(token.value, this.parseRawArguments());
        }
        const args: ExpressionValue[] = [];
        if (!this.checkParen(")")) {
          do {
            args.push(this.parseOr());
          } while (this.matchComma());
        }
        this.matchParen(")");
        return this.evaluateFunction(token.value, args);
      }
      return this.evaluateIdentifier(token.value);
    }
    if (token.type === "paren" && token.value === "(") {
      const value = this.parseOr();
      this.matchParen(")");
      return value;
    }
    return false;
  }

  private evaluateIdentifier(identifier: string): ExpressionValue {
    const lower = identifier.toLowerCase();
    if (lower === "time") {
      return this.context.stateTime ?? this.context.self.animTime;
    }
    if (lower === "stateno") {
      return this.context.self.stateNo;
    }
    if (lower === "statetime") {
      return this.context.stateTime ?? this.context.self.animTime;
    }
    if (lower === "animtime") {
      return this.context.animTimeRemaining ?? 0;
    }
    if (lower === "anim") {
      return this.context.self.animNo;
    }
    if (lower === "life") {
      return this.context.self.life;
    }
    if (lower === "power") {
      return this.context.self.power;
    }
    if (lower === "alive") {
      return this.context.self.life > 0 ? 1 : 0;
    }
    if (lower === "facing") {
      return this.context.self.facing;
    }
    if (lower === "animelem") {
      return this.context.self.frameIndex + 1;
    }
    if (lower === "ctrl") {
      return this.context.self.ctrl ? 1 : 0;
    }
    if (lower === "statetype") {
      return this.context.self.stateType;
    }
    if (lower === "movetype") {
      return this.context.self.moveType;
    }
    if (lower === "physics") {
      return this.context.self.physics;
    }
    if (lower === "random") {
      return Math.floor((this.context.random?.() ?? Math.random()) * 1000);
    }
    if (lower === "velx") {
      return this.context.self.vel.x;
    }
    if (lower === "vely") {
      return this.context.self.vel.y;
    }
    if (lower === "posx") {
      return this.context.self.pos.x;
    }
    if (lower === "posy") {
      return this.context.self.pos.y;
    }
    if (lower === "p2bodydistx") {
      return this.p2BodyDist("x");
    }
    if (lower === "p2bodydisty") {
      return this.p2BodyDist("y");
    }
    if (lower === "p2distx") {
      return this.p2Dist("x");
    }
    if (lower === "p2disty") {
      return this.p2Dist("y");
    }
    if (lower === "p2statetype") {
      return this.context.opponent?.stateType ?? "S";
    }
    if (lower === "p2movetype") {
      return this.context.opponent?.moveType ?? "I";
    }
    if (lower === "p2life") {
      return this.context.opponent?.life ?? 0;
    }
    if (lower === "p2power") {
      return this.context.opponent?.power ?? 0;
    }
    if (lower === "p2facing") {
      return this.context.opponent?.facing ?? -this.context.self.facing;
    }
    if (lower === "prevstateno") {
      return this.context.self.prevStateNo ?? 0;
    }
    if (lower === "prevmovetype") {
      return this.context.self.prevMoveType ?? "I";
    }
    if (lower === "roundno") {
      return 1;
    }
    if (lower === "roundstate") {
      return 2;
    }
    if (lower === "roundsexisted" || lower === "matchover") {
      return 0;
    }
    if (lower === "hitfall") {
      return this.context.self.hitFall?.falling ? 1 : 0;
    }
    if (lower === "hitcount") {
      return this.context.hitCount?.() ?? 0;
    }
    if (lower === "uniqhitcount") {
      return this.context.uniqueHitCount?.() ?? 0;
    }
    if (lower === "canrecover") {
      const hitFall = this.context.self.hitFall;
      return hitFall?.recover && (hitFall.recoverTime ?? 0) <= 0 ? 1 : 0;
    }
    if (lower === "hitshakeover") {
      return this.context.hitShakeOver?.() ? 1 : 0;
    }
    if (lower === "hitover") {
      return this.context.hitOver?.() ? 1 : 0;
    }
    if (lower === "command") {
      return commandIdentifierMarker;
    }
    if (lower === "backedgebodydist" || lower === "frontedgebodydist" || lower === "backedgedist" || lower === "frontedgedist") {
      return 999;
    }
    if (lower === "inguarddist") {
      return this.context.inGuardDist?.() ? 1 : 0;
    }
    if (lower === "movecontact") {
      return contactTriggerValue(this.context.moveContact?.());
    }
    if (lower === "movehit") {
      return contactTriggerValue(this.context.moveHit?.());
    }
    if (lower === "moveguarded") {
      return contactTriggerValue(this.context.moveGuarded?.());
    }
    if (lower === "movereversed") {
      return contactTriggerValue(this.context.moveReversed?.());
    }
    if (lower === "numtarget") {
      return this.numTarget();
    }
    if (lower === "numexplod") {
      return this.numExplod();
    }
    if (lower === "numhelper") {
      return this.numHelper();
    }
    if (lower === "numenemy") {
      return this.context.opponent ? 1 : 0;
    }
    if (lower === "numproj" || lower === "numprojid") {
      return this.numProj();
    }
    if (lower === "projcontact") {
      return this.context.projContact?.() ? 1 : 0;
    }
    if (lower === "projhit") {
      return this.context.projHit?.() ? 1 : 0;
    }
    if (lower === "projguarded") {
      return this.context.projGuarded?.() ? 1 : 0;
    }
    if (lower === "projcontacttime") {
      return this.context.projContactTime?.() ?? -1;
    }
    if (lower === "projhittime") {
      return this.context.projHitTime?.() ?? -1;
    }
    if (lower === "projguardedtime") {
      return this.context.projGuardedTime?.() ?? -1;
    }
    if (/^(s|c|a|l|i|h|n|sc|na|sa|ha)$/i.test(identifier)) {
      return identifier.toUpperCase();
    }
    this.context.reportUnsupported?.(identifier);
    return 0;
  }

  private evaluateFunction(identifier: string, args: ExpressionValue[]): ExpressionValue {
    const lower = identifier.toLowerCase();
    if (lower === "abs") {
      return Math.abs(numeric(args[0] ?? 0));
    }
    if (lower === "command") {
      return this.context.commandActive?.(String(args[0] ?? "")) ? 1 : 0;
    }
    if (lower === "const" || lower === "const720p") {
      return this.constValue(String(args[0] ?? ""));
    }
    if (lower === "gethitvar") {
      return this.context.getHitVar?.(String(args[0] ?? "")) ?? defaultHitVar(String(args[0] ?? ""));
    }
    if (lower === "ifelse") {
      return truthy(args[0] ?? 0) ? args[1] ?? 0 : args[2] ?? 0;
    }
    if (lower === "selfanimexist") {
      return this.context.animExists?.(numeric(args[0] ?? 0)) ? 1 : 0;
    }
    if (lower === "sysvar") {
      return this.context.self.sysvars?.[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0;
    }
    if (lower === "var") {
      return this.context.self.vars[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0;
    }
    if (lower === "fvar") {
      return this.context.self.fvars[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0;
    }
    if (lower === "animelemtime") {
      const elementNumber = Math.floor(numeric(args[0] ?? 0));
      return this.context.animElemTime?.(elementNumber) ?? (this.context.self.frameIndex + 1 === elementNumber ? 0 : -1);
    }
    if (lower === "p2bodydist") {
      const axis = String(args[0] ?? "x").toLowerCase().startsWith("y") ? "y" : "x";
      return this.p2BodyDist(axis);
    }
    if (lower === "p2dist") {
      const axis = String(args[0] ?? "x").toLowerCase().startsWith("y") ? "y" : "x";
      return this.p2Dist(axis);
    }
    if (lower === "hitdefattr") {
      return this.context.hitDefAttr?.(args.map(String).join(",")) ? 1 : 0;
    }
    if (lower === "numtarget") {
      return this.numTarget(optionalPositiveInteger(args[0]));
    }
    if (lower === "numexplod") {
      return this.numExplod(optionalPositiveInteger(args[0]));
    }
    if (lower === "numhelper") {
      return this.numHelper(optionalPositiveInteger(args[0]));
    }
    if (lower === "numproj" || lower === "numprojid") {
      return this.numProj(optionalPositiveInteger(args[0]));
    }
    if (lower === "projcontact") {
      return this.context.projContact?.(optionalProjectileId(args[0])) ? 1 : 0;
    }
    if (lower === "projhit") {
      return this.context.projHit?.(optionalProjectileId(args[0])) ? 1 : 0;
    }
    if (lower === "projguarded") {
      return this.context.projGuarded?.(optionalProjectileId(args[0])) ? 1 : 0;
    }
    if (lower === "projcontacttime") {
      return this.context.projContactTime?.(optionalProjectileTimeId(args[0])) ?? -1;
    }
    if (lower === "projhittime") {
      return this.context.projHitTime?.(optionalProjectileTimeId(args[0])) ?? -1;
    }
    if (lower === "projguardedtime") {
      return this.context.projGuardedTime?.(optionalProjectileTimeId(args[0])) ?? -1;
    }
    this.context.reportUnsupported?.(identifier);
    return 0;
  }

  private parseRawArguments(): ExpressionValue[] {
    const args: string[] = [];
    let current: Token[] = [];
    let depth = 0;

    while (this.peek()) {
      const token = this.advance();
      if (!token) {
        break;
      }
      if (token.type === "paren" && token.value === "(") {
        depth += 1;
        current.push(token);
        continue;
      }
      if (token.type === "paren" && token.value === ")") {
        if (depth === 0) {
          pushRawArg(args, current);
          return args;
        }
        depth -= 1;
        current.push(token);
        continue;
      }
      if (token.type === "comma" && depth === 0) {
        pushRawArg(args, current);
        current = [];
        continue;
      }
      current.push(token);
    }

    pushRawArg(args, current);
    return args;
  }

  private p2BodyDist(axis: "x" | "y"): number {
    const opponent = this.context.opponent;
    if (!opponent) {
      return axis === "x" ? 999 : 0;
    }
    if (axis === "y") {
      return opponent.pos.y - this.context.self.pos.y;
    }
    return Math.max(0, Math.abs(opponent.pos.x - this.context.self.pos.x) - 48);
  }

  private numTarget(targetId?: number): number {
    const runtimeValue = this.context.numTarget?.(targetId);
    if (runtimeValue !== undefined) {
      return runtimeValue;
    }
    const refs = this.context.self.targetRefs;
    if (refs) {
      return targetId === undefined ? refs.length : refs.filter((target) => target.targetId === targetId).length;
    }
    return targetId === undefined ? this.context.self.targetCount ?? 0 : 0;
  }

  private numExplod(explodId?: number): number {
    return this.context.numExplod?.(explodId) ?? 0;
  }

  private numHelper(helperId?: number): number {
    return this.context.numHelper?.(helperId) ?? 0;
  }

  private numProj(projectileId?: number): number {
    return this.context.numProj?.(projectileId) ?? 0;
  }

  private p2Dist(axis: "x" | "y"): number {
    const opponent = this.context.opponent;
    if (!opponent) {
      return axis === "x" ? 999 : 0;
    }
    return axis === "y" ? opponent.pos.y - this.context.self.pos.y : opponent.pos.x - this.context.self.pos.x;
  }

  private constValue(name: string): number {
    const normalized = name.trim().toLowerCase();
    const direct = Number(normalized);
    if (Number.isFinite(direct)) {
      return direct;
    }
    const value = this.context.getConst?.(normalized) ?? defaultConst(normalized);
    return value ?? 0;
  }

  private matchOperator(value: string): boolean {
    const token = this.peek();
    if (token?.type === "operator" && token.value === value) {
      this.cursor += 1;
      return true;
    }
    return false;
  }

  private matchParen(value: "(" | ")"): boolean {
    const token = this.peek();
    if (token?.type === "paren" && token.value === value) {
      this.cursor += 1;
      return true;
    }
    return false;
  }

  private checkParen(value: "(" | ")"): boolean {
    const token = this.peek();
    return token?.type === "paren" && token.value === value;
  }

  private matchComma(): boolean {
    const token = this.peek();
    if (token?.type === "comma") {
      this.cursor += 1;
      return true;
    }
    return false;
  }

  private peek(): Token | undefined {
    return this.tokens[this.cursor];
  }

  private advance(): Token | undefined {
    const token = this.peek();
    this.cursor += 1;
    return token;
  }
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\s*(?:(-?(?:\d+(?:\.\d+)?|\.\d+))|"(.*?)"|([A-Za-z_][A-Za-z0-9_.]*)|(&&|\|\||!=|<=|>=|[=<>+\-*/!])|([()])|(,))/gy;
  let cursor = 0;
  while (cursor < expression.length) {
    pattern.lastIndex = cursor;
    const match = pattern.exec(expression);
    if (!match) {
      cursor += 1;
      continue;
    }
    cursor = pattern.lastIndex;
    if (match[1] !== undefined) {
      tokens.push({ type: "number", value: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: "string", value: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "identifier", value: match[3] });
    } else if (match[4] !== undefined) {
      tokens.push({ type: "operator", value: match[4] });
    } else if (match[5] !== undefined) {
      tokens.push({ type: "paren", value: match[5] as "(" | ")" });
    } else if (match[6] !== undefined) {
      tokens.push({ type: "comma", value: "," });
    }
  }
  return tokens;
}

const rawArgumentFunctions = new Set(["const", "const720p", "gethitvar", "hitdefattr"]);

function pushRawArg(args: string[], tokens: Token[]): void {
  if (tokens.length === 0 && args.length === 0) {
    return;
  }
  args.push(tokens.map(tokenToText).join("").trim());
}

function tokenToText(token: Token): string {
  return token.value;
}

function defaultConst(name: string): number | undefined {
  const constants: Record<string, number> = {
    "movement.stand.friction.threshold": 0.05,
    "movement.crouch.friction.threshold": 0.05,
    "movement.down.friction.threshold": 0.05,
    "movement.yaccel": 0.44,
    "movement.air.gethit.groundlevel": 25,
    "movement.air.gethit.groundrecover.ground.threshold": -20,
    "movement.air.gethit.groundrecover.groundlevel": 10,
    "movement.air.gethit.airrecover.threshold": -1,
    "movement.air.gethit.airrecover.yaccel": 0.35,
    "movement.air.gethit.trip.groundlevel": 15,
    "velocity.air.gethit.groundrecover.x": -0.15,
    "velocity.air.gethit.groundrecover.y": -3.5,
    "movement.down.bounce.offset.x": 0,
    "movement.down.bounce.offset.y": 20,
    "movement.down.bounce.yaccel": 0.4,
    "movement.down.bounce.groundlevel": 12,
    "data.liedown.time": 60,
  };
  return constants[name];
}

function defaultHitVar(name: string): number {
  const values: Record<string, number> = {
    animtype: 0,
    ctrltime: 0,
    fall: 0,
    "fall.damage": 0,
    "fall.kill": 1,
    "fall.envshake.ampl": 0,
    "fall.envshake.freq": 60,
    "fall.envshake.phase": 0,
    "fall.envshake.time": 0,
    "fall.recover": 0,
    "fall.recovertime": 0,
    "down.recover": 1,
    "down.recovertime": 60,
    recovertime: 60,
    "fall.xvel": 0,
    "fall.xvelocity": 0,
    "fall.yvel": 0,
    "fall.yvelocity": 0,
    groundtype: 0,
    hittime: 0,
    slidetime: 0,
    xvel: 0,
    yaccel: 0.44,
    yvel: 0,
  };
  return values[name.trim().toLowerCase()] ?? 0;
}

function truthy(value: ExpressionValue): boolean {
  if (typeof value === "number") {
    return value !== 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return value.length > 0;
}

function contactTriggerValue(value: boolean | number | undefined): number {
  if (value === undefined) {
    return 0;
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  return Number.isFinite(value) ? value : 0;
}

function optionalProjectileId(value: ExpressionValue | undefined): number | undefined {
  return optionalPositiveInteger(value);
}

function optionalProjectileTimeId(value: ExpressionValue | undefined): number | undefined {
  const id = optionalPositiveInteger(value);
  return id === 0 ? undefined : id;
}

function optionalPositiveInteger(value: ExpressionValue | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }
  const numberValue = numeric(value);
  return Number.isFinite(numberValue) ? Math.max(0, Math.trunc(numberValue)) : undefined;
}

function numeric(value: ExpressionValue): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function compareValues(left: ExpressionValue, right: ExpressionValue): number {
  const leftNumber = Number(left);
  const rightNumber = Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber === rightNumber ? 0 : leftNumber < rightNumber ? -1 : 1;
  }
  const leftString = String(left).toLowerCase();
  const rightString = String(right).toLowerCase();
  return leftString === rightString ? 0 : leftString < rightString ? -1 : 1;
}
