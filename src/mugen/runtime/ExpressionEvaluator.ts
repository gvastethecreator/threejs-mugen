import { mathFunctionArity, normalizeMugenExpression } from "../compiler/ExpressionCompiler";
import { tokenizeMugenExpression, type ExpressionLexToken, type ExpressionNumericKind } from "../compiler/ExpressionLexer";
import { runtimeRoundStateFromPhase } from "./RuntimeRoundPhaseSystem";
import {
  runtimeFightScreenStateValue,
  runtimeGameVarValue,
  runtimeFightScreenVarValue,
  type RuntimeFightScreenContext,
} from "./RuntimeFightScreenTriggerSystem";
import type { CharacterRuntimeState } from "./types";
import type { RuntimeClsnVarCoordinate, RuntimeClsnVarGroup } from "./RuntimeFrameSystem";

export { normalizeMugenExpression } from "../compiler/ExpressionCompiler";

export type ExpressionContext = {
  self: CharacterRuntimeState;
  playerId?: number;
  playerNo?: number;
  animPlayerNo?: number;
  opponent?: CharacterRuntimeState;
  opponentPlayerId?: number;
  opponentPlayerNo?: number;
  opponentAnimPlayerNo?: number;
  clsnVar?: (group: RuntimeClsnVarGroup, index: number, coordinate: RuntimeClsnVarCoordinate) => number | undefined;
  opponentClsnVar?: ExpressionContext["clsnVar"];
  parentClsnVar?: ExpressionContext["clsnVar"];
  rootClsnVar?: ExpressionContext["clsnVar"];
  clsnOverlap?: (actorGroup: RuntimeClsnVarGroup, playerId: number, targetGroup: RuntimeClsnVarGroup) => boolean;
  opponentClsnOverlap?: ExpressionContext["clsnOverlap"];
  parentClsnOverlap?: ExpressionContext["clsnOverlap"];
  rootClsnOverlap?: ExpressionContext["clsnOverlap"];
  projClsnOverlap?: (index: number, playerId: number, targetGroup: RuntimeClsnVarGroup) => boolean;
  opponentProjClsnOverlap?: ExpressionContext["projClsnOverlap"];
  parentProjClsnOverlap?: ExpressionContext["projClsnOverlap"];
  rootProjClsnOverlap?: ExpressionContext["projClsnOverlap"];
  projVar?: (projectileId: number, index: number, parameter: string, outputLocalCoord?: [number, number]) => number | undefined;
  opponentProjVar?: ExpressionContext["projVar"];
  parentProjVar?: ExpressionContext["projVar"];
  rootProjVar?: ExpressionContext["projVar"];
  projVarFlag?: (
    projectileId: number,
    index: number,
    parameter: RuntimeProjVarFlagParameter,
    filter: string,
    operator: "=" | "!=",
  ) => boolean;
  opponentProjVarFlag?: ExpressionContext["projVarFlag"];
  parentProjVarFlag?: ExpressionContext["projVarFlag"];
  rootProjVarFlag?: ExpressionContext["projVarFlag"];
  enemyNear?: (index: number) => ExpressionRedirectTarget | undefined;
  enemyNearFallbackToOpponent?: boolean;
  partner?: (index: number) => ExpressionRedirectTarget | undefined;
  enemy?: (index: number) => ExpressionRedirectTarget | undefined;
  stageBounds?: { left: number; right: number };
  gameSpace?: ExpressionGameSpace;
  localCoord?: [number, number];
  opponentLocalCoord?: [number, number];
  outputLocalCoord?: [number, number];
  sizeBoxX?: { x1: number; x2: number } | null;
  opponentSizeBoxX?: { x1: number; x2: number } | null;
  sizeBoxY?: { y1: number; y2: number } | null;
  opponentSizeBoxY?: { y1: number; y2: number } | null;
  p2BodyDistYUsesSizeBoxes?: boolean;
  parentLocalCoord?: [number, number];
  rootLocalCoord?: [number, number];
  parent?: CharacterRuntimeState;
  parentPlayerId?: number;
  parentPlayerNo?: number;
  root?: CharacterRuntimeState;
  rootPlayerId?: number;
  rootPlayerNo?: number;
  target?: (targetId?: number) => ExpressionRedirectTarget | undefined;
  playerIdTarget?: (playerId: number) => ExpressionRedirectTarget | undefined;
  name?: string;
  authorName?: string;
  opponentName?: string;
  opponentAuthorName?: string;
  p3Name?: string;
  p4Name?: string;
  p5Name?: string;
  p6Name?: string;
  p7Name?: string;
  p8Name?: string;
  introState?: number;
  fightScreen?: RuntimeFightScreenContext;
  fightScreenState?: (parameter: string) => boolean;
  fightScreenVar?: (parameter: string) => number | string | undefined;
  gameVar?: (parameter: string) => number | string | undefined;
  teamSide?: number;
  opponentTeamSide?: number;
  parentTeamSide?: number;
  rootTeamSide?: number;
  isHelper?: boolean;
  helperId?: number;
  helperVarEnabled?: boolean;
  helperKeyCtrl?: boolean;
  helperOwnPalette?: boolean;
  helperOwnProjectile?: boolean;
  helperPreserve?: boolean;
  helperOwnClsnScale?: boolean;
  helperClsnProxy?: boolean;
  helperType?: number;
  animExists?: (animationId: number) => boolean;
  activeAnimExists?: (animationId: number) => boolean;
  stateExists?: (stateNo: number) => boolean;
  commandActive?: (name: string) => boolean;
  getConst?: (name: string) => number | undefined;
  getHitVar?: (name: string) => number | undefined;
  getHitVarAttr?: (state: CharacterRuntimeState, attrFilter: string) => boolean;
  getHitVarGuardFlag?: (state: CharacterRuntimeState, flagFilter: string) => boolean;
  getHitVarHitFlag?: (state: CharacterRuntimeState, flagFilter: string) => boolean;
  hitDefAttr?: (attrFilter: string) => boolean;
  hitCount?: () => number;
  hitOver?: () => boolean;
  hitPauseTime?: () => number;
  hitShakeOver?: () => boolean;
  inGuardDist?: () => boolean;
  moveContact?: () => boolean | number;
  moveHit?: () => boolean | number;
  moveGuarded?: () => boolean | number;
  moveReversed?: () => boolean | number;
  numEnemy?: () => number;
  numPartner?: () => number;
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
  projCancelTime?: (projectileId?: number) => number;
  animElemVar?: (parameter: string) => number | string | undefined;
  animElemTime?: (elementNumber: number) => number | undefined;
  animElemNo?: (timeOffset: number) => number | undefined;
  random?: () => number;
  roundDecision?: {
    settled: boolean;
    win?: boolean;
    lose?: boolean;
    draw?: boolean;
    winKO?: boolean;
    winTime?: boolean;
    winPerfect?: boolean;
    loseKO?: boolean;
    loseTime?: boolean;
  };
  teamMode?: string;
  reportUnsupported?: (feature: string) => void;
  allowVariableAssignment?: boolean;
  receivedDamage?: () => number;
  receivedHits?: () => number;
  lifeMax?: number;
  powerMax?: number;
  stageTime?: number;
  stateTime?: number;
  uniqueHitCount?: () => number;
  animLength?: number;
  animTimeRemaining?: number;
  parentRedirect?: ExpressionRedirectTarget;
  rootRedirect?: ExpressionRedirectTarget;
};

export type ExpressionGameSpace = {
  width: number;
  height: number;
  zoom?: number;
};

export type ExpressionRedirectTarget = {
  self: CharacterRuntimeState;
  playerId?: number;
  playerNo?: number;
  animPlayerNo?: number;
  opponent?: CharacterRuntimeState;
  opponentPlayerId?: number;
  opponentPlayerNo?: number;
  opponentAnimPlayerNo?: number;
  animExists?: ExpressionContext["animExists"];
  activeAnimExists?: ExpressionContext["activeAnimExists"];
  animElemNo?: ExpressionContext["animElemNo"];
  clsnVar?: ExpressionContext["clsnVar"];
  opponentClsnVar?: ExpressionContext["clsnVar"];
  clsnOverlap?: ExpressionContext["clsnOverlap"];
  opponentClsnOverlap?: ExpressionContext["clsnOverlap"];
  projClsnOverlap?: ExpressionContext["projClsnOverlap"];
  opponentProjClsnOverlap?: ExpressionContext["projClsnOverlap"];
  projVar?: ExpressionContext["projVar"];
  opponentProjVar?: ExpressionContext["projVar"];
  projVarFlag?: ExpressionContext["projVarFlag"];
  opponentProjVarFlag?: ExpressionContext["projVarFlag"];
  localCoord?: [number, number];
  opponentLocalCoord?: [number, number];
  sizeBoxX?: { x1: number; x2: number } | null;
  opponentSizeBoxX?: { x1: number; x2: number } | null;
  sizeBoxY?: { y1: number; y2: number } | null;
  opponentSizeBoxY?: { y1: number; y2: number } | null;
  name?: string;
  authorName?: string;
  opponentName?: string;
  opponentAuthorName?: string;
  teamSide?: number;
  opponentTeamSide?: number;
  roundDecision?: ExpressionContext["roundDecision"];
};

export type ExpressionNumericResult = {
  kind: ExpressionNumericKind | "invalid";
  value: number;
};

export function evaluateExpression(expression: string, context: ExpressionContext): boolean | number | string {
  return unwrapExpressionValue(evaluateExpressionRaw(expression, context));
}

export function evaluateExpressionNumeric(expression: string, context: ExpressionContext): ExpressionNumericResult {
  return classifyExpressionValue(evaluateExpressionRaw(expression, context));
}

function evaluateExpressionRaw(expression: string, context: ExpressionContext): ExpressionValue {
  const normalized = normalizeMugenExpression(expression);
  const redirected = evaluateActorRedirect(normalized, context);
  if (redirected !== undefined) {
    return redirected;
  }
  const animElemTrigger = evaluateAnimElemTrigger(normalized, context);
  if (animElemTrigger !== undefined) {
    return taggedNumber("int", animElemTrigger);
  }
  const commandMatch = /^(?:command|selfcommand)\s*(=|!=)\s*"([^"]+)"$/i.exec(normalized.trim());
  if (commandMatch) {
    const active = context.commandActive?.(commandMatch[2] ?? "") ? 1 : 0;
    return taggedNumber("int", commandMatch[1] === "!=" ? (active ? 0 : 1) : active);
  }
  const hitDefAttrMatch = /^hitdefattr\s*(=|!=)\s*(.+)$/i.exec(normalized.trim());
  if (hitDefAttrMatch) {
    const active = context.hitDefAttr?.(hitDefAttrMatch[2] ?? "") ? 1 : 0;
    return taggedNumber("int", hitDefAttrMatch[1] === "!=" ? (active ? 0 : 1) : active);
  }

  const executable = rewriteProjVarFlagComparisons(
    rewriteGetHitVarHitFlagComparisons(
      rewriteGetHitVarGuardFlagComparisons(
        rewriteGetHitVarAttrComparisons(rewriteAnimElemTriggerSyntax(normalized)),
      ),
    ),
  );
  const parser = new ExpressionParser(tokenize(executable), context);
  return parser.parsePreservingBottom();
}

type TaggedNumber = {
  readonly numericKind: ExpressionNumericKind;
  readonly value: number;
};

type ExpressionValue = boolean | number | string | TaggedNumber;

const commandIdentifierMarker = "__mugen_command_identifier__";
const failedRedirectMarker = "__mugen_failed_redirect__";

type AnimElemTriggerOperator = "=" | "!=" | "<" | ">" | "<=" | ">=";

function evaluateAnimElemTrigger(expression: string, context: ExpressionContext): number | undefined {
  const match = /^animelem\s*=\s*([^,]+?)(?:\s*,\s*(<=|>=|!=|=|<|>)\s*(.+))?$/i.exec(expression.trim());
  if (!match) {
    return undefined;
  }

  const elementExpression = (match[1] ?? "0").trim();
  const elapsedExpression = (match[3] ?? "0").trim();
  if (/[&|]/.test(elementExpression) || /[&|]/.test(elapsedExpression)) {
    return undefined;
  }

  const elementNumber = Math.floor(numeric(evaluateExpressionFragment(elementExpression, context)));
  if (elementNumber <= 0) {
    return 0;
  }

  const operator = (match[2] ?? "=") as AnimElemTriggerOperator;
  const targetElapsed = numeric(evaluateExpressionFragment(elapsedExpression, context));
  const elapsed = currentAnimElemTime(context, elementNumber);
  return compareAnimElemElapsed(elapsed, targetElapsed, operator) ? 1 : 0;
}

function evaluateExpressionFragment(expression: string, context: ExpressionContext): ExpressionValue {
  const parser = new ExpressionParser(tokenize(normalizeMugenExpression(expression)), context);
  return parser.parsePreservingBottom();
}

function evaluateExpressionFragmentPreservingBottom(expression: string, context: ExpressionContext): ExpressionValue {
  const parser = new ExpressionParser(tokenize(normalizeMugenExpression(expression)), context);
  return parser.parsePreservingBottom();
}

function currentAnimElemTime(context: ExpressionContext, elementNumber: number): number {
  return context.animElemTime?.(elementNumber) ?? (context.self.frameIndex + 1 === elementNumber ? 0 : -1);
}

function compareAnimElemElapsed(left: number, right: number, operator: AnimElemTriggerOperator): boolean {
  if (operator === "=") {
    return left === right;
  }
  if (operator === "!=") {
    return left !== right;
  }
  if (operator === "<") {
    return left < right;
  }
  if (operator === ">") {
    return left > right;
  }
  if (operator === "<=") {
    return left <= right;
  }
  return left >= right;
}

function rewriteAnimElemTriggerSyntax(expression: string): string {
  const numericFragment = "-?\\d+(?:\\.\\d+)?";
  const withElapsed = new RegExp(`\\banimelem\\s*=\\s*(${numericFragment})\\s*,\\s*(<=|>=|!=|=|<|>)\\s*(${numericFragment})`, "gi");
  const atElementStart = new RegExp(`\\banimelem\\s*=\\s*(${numericFragment})`, "gi");
  return expression
    .replace(withElapsed, "AnimElemTime($1) $2 $3")
    .replace(atElementStart, "AnimElemTime($1) = 0");
}

function rewriteGetHitVarAttrComparisons(expression: string): string {
  const attrComparison = /\bgethitvar\s*\(\s*attr\s*\)\s*(=|!=)\s*([sca]+\s*,\s*[nsh][atp](?:\s*,\s*[nsh][atp])*)/gi;
  return expression.replace(attrComparison, (_match, operator: string, filter: string) => {
    const predicate = `GetHitVarAttr(${filter})`;
    return operator === "!=" ? `(!${predicate})` : predicate;
  });
}

function rewriteGetHitVarGuardFlagComparisons(expression: string): string {
  const flagComparison = /\bgethitvar\s*\(\s*guardflag\s*\)\s*(=|!=)\s*([hlmadfp]+[+-]?)/gi;
  return expression.replace(flagComparison, (_match, operator: string, filter: string) => {
    const predicate = `GetHitVarGuardFlag(${filter})`;
    return operator === "!=" ? `(!${predicate})` : predicate;
  });
}

function rewriteGetHitVarHitFlagComparisons(expression: string): string {
  const flagComparison = /\bgethitvar\s*\(\s*hitflag\s*\)\s*(=|!=)\s*([hlmadfpd]+[+-]?)/gi;
  return expression.replace(flagComparison, (_match, operator: string, filter: string) => {
    const predicate = `GetHitVarHitFlag(${filter})`;
    return operator === "!=" ? `(!${predicate})` : predicate;
  });
}

export type RuntimeProjVarFlagParameter = "attr" | "guardflag" | "hitflag";

function rewriteProjVarFlagComparisons(expression: string): string {
  const callPattern = /\bprojvar\s*\(/gi;
  let rewritten = "";
  let sourceCursor = 0;
  let match: RegExpExecArray | null;

  while ((match = callPattern.exec(expression)) !== null) {
    const callStart = match.index;
    const openParen = expression.indexOf("(", callStart);
    const closeParen = findBalancedClosingParen(expression, openParen);
    if (closeParen < 0) break;
    const args = splitBalancedArgumentText(expression.slice(openParen + 1, closeParen));
    const parameter = normalizeProjVarFlagParameter(args.at(-1));
    if (!parameter || args.length < 3) {
      callPattern.lastIndex = closeParen + 1;
      continue;
    }
    const operatorMatch = /^\s*(=|!=)\s*/.exec(expression.slice(closeParen + 1));
    if (!operatorMatch) {
      callPattern.lastIndex = closeParen + 1;
      continue;
    }
    const filterSource = expression.slice(closeParen + 1 + operatorMatch[0].length);
    const filterMatch = projVarFlagFilterPattern(parameter).exec(filterSource);
    if (!filterMatch?.[1]) {
      callPattern.lastIndex = closeParen + 1;
      continue;
    }
    const projectileId = args[0] ?? "-1";
    const index = args.slice(1, -1).join(",") || "0";
    const filter = filterMatch[1].replace(/\s+/g, "");
    const predicateBase = parameter === "attr"
      ? "ProjVarAttr"
      : parameter === "guardflag"
        ? "ProjVarGuardFlag"
        : "ProjVarHitFlag";
    const predicateName = operatorMatch[1] === "!=" ? `${predicateBase}Not` : predicateBase;
    const predicate = `${predicateName}(${projectileId},${index},"${filter}")`;
    const replacementEnd = closeParen + 1 + operatorMatch[0].length + filterMatch[0].length;
    rewritten += expression.slice(sourceCursor, callStart) + predicate;
    sourceCursor = replacementEnd;
    callPattern.lastIndex = replacementEnd;
  }

  return rewritten + expression.slice(sourceCursor);
}

function findBalancedClosingParen(expression: string, openParen: number): number {
  let depth = 0;
  let quoted = false;
  for (let index = openParen; index < expression.length; index += 1) {
    const char = expression[index];
    if (char === '"' && expression[index - 1] !== "\\") {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function splitBalancedArgumentText(value: string): string[] {
  const args: string[] = [];
  let current = "";
  let depth = 0;
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index] ?? "";
    if (char === '"' && value[index - 1] !== "\\") quoted = !quoted;
    if (!quoted && char === "(") depth += 1;
    if (!quoted && char === ")") depth -= 1;
    if (!quoted && char === "," && depth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  args.push(current.trim());
  return args;
}

function normalizeProjVarFlagParameter(value: string | undefined): RuntimeProjVarFlagParameter | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized === "attr" || normalized === "guardflag" || normalized === "hitflag" ? normalized : undefined;
}

function projVarFlagFilterPattern(parameter: RuntimeProjVarFlagParameter): RegExp {
  return parameter === "attr"
    ? /^([sca]+\s*,\s*(?:[nsh][atp]|[nsha])(?:\s*,\s*(?:[nsh][atp]|[nsha]))*)/i
    : /^([hlmadfp]+[+-]?)/i;
}

function evaluateActorRedirect(expression: string, context: ExpressionContext): ExpressionValue | undefined {
  const redirect = /^(enemynear|partner|enemy|parent|root|target|playerid)(?:\s*\(([^)]*)\))?\s*,\s*(.+)$/i.exec(expression.trim());
  if (!redirect) {
    return undefined;
  }
  const target = redirect[1]?.toLowerCase();
  const index = redirect[2]?.trim();
  const expressionBody = redirect[3] ?? "";
  if (target === "enemynear") {
    const redirected = enemyNearRedirectContext(index, context);
    if (redirected === "fail") {
      return failedRedirectMarker;
    }
    return evaluateExpressionRaw(expressionBody, {
      ...redirected,
    });
  }
  if (target === "partner" || target === "enemy") {
    const redirected = rosterRedirectContext(target, index, context);
    if (redirected === "fail") {
      return failedRedirectMarker;
    }
    return evaluateExpressionRaw(expressionBody, redirected);
  }
  if (target === "target") {
    const targetId = resolveRedirectTargetId(index, context);
    if (targetId === "unsupported") {
      return failedRedirectMarker;
    }
    const redirected = context.target?.(targetId);
    if (!redirected) {
      return failedRedirectMarker;
    }
    return evaluateExpressionRaw(expressionBody, redirectedTargetContext(context, redirected));
  }
  if (target === "playerid") {
    const playerId = resolvePlayerIdIndex(index, context);
    if (playerId === "unsupported") {
      return failedRedirectMarker;
    }
    const redirected = context.playerIdTarget?.(playerId);
    if (!redirected) {
      if (!context.playerIdTarget) {
        context.reportUnsupported?.("playerid");
      }
      return failedRedirectMarker;
    }
    return evaluateExpressionRaw(expressionBody, redirectedTargetContext(context, redirected));
  }
  if (index) {
    context.reportUnsupported?.(`${target}(index)`);
    return failedRedirectMarker;
  }
  const redirected = parentOrRootRedirectContext(target === "parent" ? "parent" : "root", context);
  if (redirected === "fail") {
    return failedRedirectMarker;
  }
  return evaluateExpressionRaw(expressionBody, redirected);
}

type Token = ExpressionLexToken;

class ExpressionParser {
  private cursor = 0;
  private malformed = false;
  private suppressWrites = 0;

  constructor(
    private readonly tokens: Token[],
    private context: ExpressionContext,
  ) {}

  parse(): ExpressionValue {
    return unwrapExpressionValue(this.parsePreservingBottom());
  }

  parsePreservingBottom(): ExpressionValue {
    if (this.tokens.length === 0) {
      return false;
    }
    if (this.tokens.some((token) => token.type === "invalid")) {
      this.reportMalformed();
      return failedRedirectMarker;
    }
    const value = this.parseOr();
    if (this.malformed || this.cursor < this.tokens.length) {
      this.reportMalformed();
      return failedRedirectMarker;
    }
    return value;
  }

  private parseOr(): ExpressionValue {
    let left = this.parseBoolXor();
    while (this.matchOperator("||")) {
      const skip = !isFailedRedirect(left) && truthy(left);
      if (skip) {
        this.suppressWrites += 1;
      }
      const right = this.parseBoolXor();
      if (skip) {
        this.suppressWrites -= 1;
      }
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : truthy(left) || truthy(right) ? 1 : 0;
    }
    return left;
  }

  private parseBoolXor(): ExpressionValue {
    let left = this.parseAnd();
    while (this.matchOperator("^^")) {
      const right = this.parseAnd();
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : truthy(left) !== truthy(right) ? 1 : 0;
    }
    return left;
  }

  private parseAnd(): ExpressionValue {
    let left = this.parseBitOr();
    while (this.matchOperator("&&")) {
      const skip = !isFailedRedirect(left) && !truthy(left);
      if (skip) {
        this.suppressWrites += 1;
      }
      const right = this.parseBitOr();
      if (skip) {
        this.suppressWrites -= 1;
      }
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : truthy(left) && truthy(right) ? 1 : 0;
    }
    return left;
  }

  private parseBitOr(): ExpressionValue {
    let left = this.parseBitXor();
    while (this.matchOperator("|")) {
      const right = this.parseBitXor();
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : this.toSignedInt(left) | this.toSignedInt(right);
    }
    return left;
  }

  private parseBitXor(): ExpressionValue {
    let left = this.parseBitAnd();
    while (this.matchOperator("^")) {
      const right = this.parseBitAnd();
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : this.toSignedInt(left) ^ this.toSignedInt(right);
    }
    return left;
  }

  private parseBitAnd(): ExpressionValue {
    let left = this.parseEquality();
    while (this.matchOperator("&")) {
      const right = this.parseEquality();
      left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : this.toSignedInt(left) & this.toSignedInt(right);
    }
    return left;
  }

  private toSignedInt(value: ExpressionValue): number {
    return Math.trunc(numeric(value)) | 0;
  }

  private mathUnary(
    argument: ExpressionValue | undefined,
    compute: (value: number) => number,
    invalid?: (value: number) => boolean,
  ): ExpressionValue {
    if (isFailedRedirect(argument ?? 0)) {
      return failedRedirectMarker;
    }
    const value = numeric(argument ?? 0);
    if (invalid?.(value) || !Number.isFinite(value)) {
      this.context.reportUnsupported?.("math(domain)");
      return failedRedirectMarker;
    }
    const result = compute(value);
    if (!Number.isFinite(result)) {
      this.context.reportUnsupported?.("math(domain)");
      return failedRedirectMarker;
    }
    return result;
  }

  private mathRound(argument: ExpressionValue | undefined, compute: (value: number) => number): ExpressionValue {
    if (isFailedRedirect(argument ?? 0)) {
      return failedRedirectMarker;
    }
    const value = numeric(argument ?? 0);
    if (!Number.isFinite(value)) {
      this.context.reportUnsupported?.("math(domain)");
      return failedRedirectMarker;
    }
    return compute(value);
  }

  private parseEquality(): ExpressionValue {
    let left = this.parseComparison();
    while (true) {
      if (this.matchOperator("=")) {
        left = this.parseEqualityRight(left, false);
      } else if (this.matchOperator("!=")) {
        left = this.parseEqualityRight(left, true);
      } else {
        return left;
      }
    }
  }

  private parseEqualityRight(left: ExpressionValue, negated: boolean): ExpressionValue {
    const range = this.tryParseRange();
    if (range) {
      return this.compareRange(left, range.min, range.max, range.minInclusive, range.maxInclusive, negated);
    }
    return this.compareEquality(left, this.parseComparison(), negated);
  }

  private tryParseRange():
    | { min: ExpressionValue; max: ExpressionValue; minInclusive: boolean; maxInclusive: boolean }
    | undefined {
    if (!this.looksLikeRange()) {
      return undefined;
    }
    const open = this.advance();
    const minInclusive = open?.type === "bracket" && open.value === "[";
    const min = this.parseOr();
    if (!this.matchComma()) {
      this.malformed = true;
      return { min, max: 0, minInclusive, maxInclusive: true };
    }
    const max = this.parseOr();
    const close = this.peek();
    if (close?.type === "bracket" && close.value === "]") {
      this.cursor += 1;
      return { min, max, minInclusive, maxInclusive: true };
    }
    if (close?.type === "paren" && close.value === ")") {
      this.cursor += 1;
      return { min, max, minInclusive, maxInclusive: false };
    }
    this.malformed = true;
    return { min, max, minInclusive, maxInclusive: true };
  }

  private looksLikeRange(): boolean {
    const open = this.peek();
    if (open?.type === "bracket" && open.value === "[") {
      return true;
    }
    if (!(open?.type === "paren" && open.value === "(")) {
      return false;
    }
    let depth = 0;
    for (let index = this.cursor; index < this.tokens.length; index += 1) {
      const token = this.tokens[index];
      if (!token) {
        break;
      }
      if ((token.type === "paren" && token.value === "(") || (token.type === "bracket" && token.value === "[")) {
        depth += 1;
      } else if ((token.type === "paren" && token.value === ")") || (token.type === "bracket" && token.value === "]")) {
        depth -= 1;
        if (depth === 0) {
          return false;
        }
      } else if (token.type === "comma" && depth === 1) {
        return true;
      }
    }
    return false;
  }

  private compareRange(
    value: ExpressionValue,
    min: ExpressionValue,
    max: ExpressionValue,
    minInclusive: boolean,
    maxInclusive: boolean,
    negated: boolean,
  ): ExpressionValue {
    if (isFailedRedirect(value) || isFailedRedirect(min) || isFailedRedirect(max)) {
      return failedRedirectMarker;
    }
    const tested = numeric(value);
    const low = numeric(min);
    const high = numeric(max);
    const minPass = minInclusive ? tested >= low : tested > low;
    const maxPass = maxInclusive ? tested <= high : tested < high;
    const inRange = minPass && maxPass;
    return negated ? (inRange ? 0 : 1) : inRange ? 1 : 0;
  }

  private compareEquality(left: ExpressionValue, right: ExpressionValue, negated: boolean): ExpressionValue {
    if (isFailedRedirect(left) || isFailedRedirect(right)) {
      return failedRedirectMarker;
    }
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
        const right = this.parseTerm();
        left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : compareValues(left, right) <= 0 ? 1 : 0;
      } else if (this.matchOperator(">=")) {
        const right = this.parseTerm();
        left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : compareValues(left, right) >= 0 ? 1 : 0;
      } else if (this.matchOperator("<")) {
        const right = this.parseTerm();
        left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : compareValues(left, right) < 0 ? 1 : 0;
      } else if (this.matchOperator(">")) {
        const right = this.parseTerm();
        left = isFailedRedirect(left) || isFailedRedirect(right) ? failedRedirectMarker : compareValues(left, right) > 0 ? 1 : 0;
      } else {
        return left;
      }
    }
  }

  private parseTerm(): ExpressionValue {
    let left = this.parseFactor();
    while (true) {
      if (this.matchOperator("+")) {
        left = combineArithmetic(left, this.parseFactor(), (a, b) => a + b);
      } else if (this.matchOperator("-")) {
        left = combineArithmetic(left, this.parseFactor(), (a, b) => a - b);
      } else {
        return left;
      }
    }
  }

  private parseFactor(): ExpressionValue {
    let left = this.parsePower();
    while (true) {
      if (this.matchOperator("*")) {
        left = combineArithmetic(left, this.parsePower(), (a, b) => a * b);
      } else if (this.matchOperator("/")) {
        const right = this.parsePower();
        if (isFailedRedirect(left) || isFailedRedirect(right)) {
          left = failedRedirectMarker;
        } else {
          const divisor = numeric(right);
          if (divisor === 0) {
            this.context.reportUnsupported?.("div(0)");
            left = failedRedirectMarker;
          } else if (numericKindOf(left) !== "float" && numericKindOf(right) !== "float") {
            left = taggedNumber("int", Math.trunc(numeric(left) / divisor));
          } else {
            left = combineArithmetic(left, right, (a, b) => a / b);
          }
        }
      } else if (this.matchOperator("%")) {
        const right = this.parsePower();
        if (isFailedRedirect(left) || isFailedRedirect(right)) {
          left = failedRedirectMarker;
        } else {
          const divisor = Math.trunc(numeric(right));
          if (divisor === 0) {
            this.context.reportUnsupported?.("mod(0)");
            left = failedRedirectMarker;
          } else {
            left = taggedNumber("int", Math.trunc(numeric(left)) % divisor);
          }
        }
      } else {
        return left;
      }
    }
  }

  private parsePower(): ExpressionValue {
    let left = this.parseUnary();
    while (this.matchOperator("**")) {
      const right = this.parseUnary();
      left = combinePower(left, right, this.context.reportUnsupported);
    }
    return left;
  }

  private parseUnary(): ExpressionValue {
    if (this.matchOperator("!")) {
      const value = this.parseUnary();
      return isFailedRedirect(value) ? failedRedirectMarker : truthy(value) ? 0 : 1;
    }
    if (this.matchOperator("-")) {
      const value = this.parseUnary();
      if (isFailedRedirect(value)) {
        return failedRedirectMarker;
      }
      const kind = numericKindOf(value);
      const result = -numeric(value);
      return kind === "float" ? taggedNumber("float", result) : taggedNumber("int", result);
    }
    if (this.matchOperator("~")) {
      const value = this.parseUnary();
      return isFailedRedirect(value) ? failedRedirectMarker : ~this.toSignedInt(value);
    }
    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionValue {
    const token = this.advance();
    if (!token) {
      this.malformed = true;
      return false;
    }
    if (token.type === "number") {
      const parsed = Number(token.value);
      if (!Number.isFinite(parsed)) {
        return failedRedirectMarker;
      }
      return taggedNumber(token.kind, parsed);
    }
    if (token.type === "string") {
      return token.value;
    }
    if (token.type === "identifier") {
      const redirectedContext = this.tryConsumeRedirectContext(token.value);
      if (redirectedContext === "fail") {
        this.parseUnary();
        return failedRedirectMarker;
      }
      if (redirectedContext) {
        return this.withContext(redirectedContext, () => this.parseUnary());
      }
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
        if (!this.matchParen(")")) {
          this.malformed = true;
        }
        const result = this.evaluateFunction(token.value, args);
        if (this.matchOperator(":=")) {
          return this.assignVariable(token.value, args, this.parseEquality());
        }
        return result;
      }
      return this.evaluateIdentifier(token.value);
    }
    if (token.type === "paren" && token.value === "(") {
      const value = this.parseOr();
      if (!this.matchParen(")")) {
        this.malformed = true;
      }
      return value;
    }
    this.malformed = true;
    return false;
  }

  private tryConsumeRedirectContext(identifier: string): ExpressionContext | "fail" | undefined {
    const target = identifier.toLowerCase();
    if (
      target !== "enemynear" &&
      target !== "partner" &&
      target !== "enemy" &&
      target !== "parent" &&
      target !== "root" &&
      target !== "target" &&
      target !== "playerid"
    ) {
      return undefined;
    }
    const cursorBeforeRedirect = this.cursor;
    const index = this.tryConsumeRedirectIndex();
    if (!this.matchComma()) {
      this.cursor = cursorBeforeRedirect;
      return undefined;
    }
    if (target === "enemynear") {
      return enemyNearRedirectContext(index, this.context);
    }
    if (target === "partner" || target === "enemy") {
      return rosterRedirectContext(target, index, this.context);
    }
    if (target === "target") {
      const targetId = resolveRedirectTargetId(index, this.context);
      if (targetId === "unsupported") {
        return "fail";
      }
      const redirected = this.context.target?.(targetId);
      if (!redirected) {
        return "fail";
      }
      return redirectedTargetContext(this.context, redirected);
    }
    if (target === "playerid") {
      const playerId = resolvePlayerIdIndex(index, this.context);
      if (playerId === "unsupported") {
        return "fail";
      }
      const redirected = this.context.playerIdTarget?.(playerId);
      if (!redirected) {
        if (!this.context.playerIdTarget) {
          this.context.reportUnsupported?.("playerid");
        }
        return "fail";
      }
      return redirectedTargetContext(this.context, redirected);
    }
    if (index) {
      this.context.reportUnsupported?.(`${target}(index)`);
      return "fail";
    }
    return parentOrRootRedirectContext(target === "parent" ? "parent" : "root", this.context);
  }

  private tryConsumeRedirectIndex(): string | undefined {
    if (!this.matchParen("(")) {
      return undefined;
    }
    const tokens: Token[] = [];
    let depth = 0;
    while (this.peek()) {
      const token = this.advance();
      if (!token) {
        break;
      }
      if (token.type === "paren" && token.value === "(") {
        depth += 1;
        tokens.push(token);
        continue;
      }
      if (token.type === "paren" && token.value === ")") {
        if (depth === 0) {
          return tokens.map(tokenToText).join("").trim();
        }
        depth -= 1;
        tokens.push(token);
        continue;
      }
      tokens.push(token);
    }
    return tokens.map(tokenToText).join("").trim();
  }

  private assignVariable(name: string, args: ExpressionValue[], assigned: ExpressionValue): ExpressionValue {
    const lower = name.toLowerCase();
    if (lower !== "var" && lower !== "fvar") {
      this.context.reportUnsupported?.(`${lower}(:=)`);
      return failedRedirectMarker;
    }
    if (isFailedRedirect(assigned) || isFailedRedirect(args[0] ?? 0)) {
      return failedRedirectMarker;
    }
    if (this.suppressWrites > 0) {
      return assigned;
    }
    if (this.context.allowVariableAssignment === false) {
      this.context.reportUnsupported?.(`${lower}(:=redirect)`);
      return failedRedirectMarker;
    }
    const index = Math.trunc(numeric(args[0] ?? 0));
    const maxIndex = lower === "fvar" ? 39 : 59;
    if (index < 0 || index > maxIndex) {
      this.context.reportUnsupported?.(`${lower}(index)`);
      return failedRedirectMarker;
    }
    if (lower === "var") {
      const value = Math.trunc(numeric(assigned));
      this.context.self.vars[index] = value;
      return taggedNumber("int", value);
    }
    const value = numeric(assigned);
    this.context.self.fvars[index] = value;
    return taggedNumber("float", value);
  }

  private withContext(context: ExpressionContext, evaluate: () => ExpressionValue): ExpressionValue {
    const previousContext = this.context;
    this.context = context;
    try {
      return evaluate();
    } finally {
      this.context = previousContext;
    }
  }

  private evaluateIdentifier(identifier: string): ExpressionValue {
    const lower = identifier.toLowerCase();
    if (lower === "time") {
      return this.context.stateTime ?? this.context.self.animTime;
    }
    if (lower === "ailevel") {
      return taggedNumber("int", clampAiLevel(this.context.self.aiLevel ?? 0));
    }
    if (lower === "stagetime" || lower === "gametime") {
      return this.context.stageTime ?? 0;
    }
    if (lower === "gamewidth") {
      return this.gameSpaceDimension("width");
    }
    if (lower === "gameheight") {
      return this.gameSpaceDimension("height");
    }
    if (lower === "screenwidth") {
      return this.screenSpaceDimension("width");
    }
    if (lower === "screenheight") {
      return this.screenSpaceDimension("height");
    }
    if (lower === "stateno") {
      return this.context.self.stateNo;
    }
    if (lower === "id") {
      if (!Number.isSafeInteger(this.context.playerId) || this.context.playerId! < 0) {
        this.context.reportUnsupported?.(identifier);
        return 0;
      }
      return this.context.playerId!;
    }
    if (lower === "playerno") {
      if (!Number.isSafeInteger(this.context.playerNo) || this.context.playerNo! < 1) {
        this.context.reportUnsupported?.(identifier);
        return 0;
      }
      return this.context.playerNo!;
    }
    if (lower === "animplayerno") {
      return this.context.animPlayerNo ?? 0;
    }
    if (lower === "statetime") {
      return this.context.stateTime ?? this.context.self.animTime;
    }
    if (lower === "animlength") {
      return this.context.animLength ?? 0;
    }
    if (lower === "animtime") {
      return this.context.animTimeRemaining ?? 0;
    }
    if (lower === "name" || lower === "p1name") {
      return this.context.name ?? "";
    }
    if (lower === "p2name") {
      return this.context.opponentName ?? "";
    }
    if (lower === "p3name") {
      return this.context.p3Name ?? "";
    }
    if (lower === "p4name") {
      return this.context.p4Name ?? "";
    }
    if (lower === "p5name") {
      return this.context.p5Name ?? "";
    }
    if (lower === "p6name") {
      return this.context.p6Name ?? "";
    }
    if (lower === "p7name") {
      return this.context.p7Name ?? "";
    }
    if (lower === "p8name") {
      return this.context.p8Name ?? "";
    }
    if (lower === "authorname") {
      return this.context.authorName ?? "";
    }
    if (lower === "anim") {
      return this.context.self.animNo;
    }
    if (lower === "life") {
      return this.context.self.life;
    }
    if (lower === "redlife") {
      return this.context.self.redLife ?? 0;
    }
    if (lower === "lifemax") {
      return this.context.lifeMax ?? this.context.self.lifeMax ?? 1000;
    }
    if (lower === "power") {
      return this.context.self.power;
    }
    if (lower === "powermax") {
      return this.context.powerMax ?? this.context.self.powerMax ?? 3000;
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
    if (lower === "pi") {
      return Math.PI;
    }
    if (lower === "e") {
      return Math.E;
    }
    if (lower === "velx") {
      return this.context.self.vel.x;
    }
    if (lower === "vely") {
      return this.context.self.vel.y;
    }
    if (lower === "velz") {
      return this.context.self.combatDepth?.velocity ?? 0;
    }
    if (lower === "posx") {
      return this.context.self.pos.x;
    }
    if (lower === "posy") {
      return this.context.self.pos.y;
    }
    if (lower === "posz") {
      return this.context.self.combatDepth?.position ?? 0;
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
    if (lower === "prevanim") {
      return this.context.self.prevAnimNo ?? 0;
    }
    if (lower === "prevstatetype") {
      return this.context.self.prevStateType ?? "S";
    }
    if (lower === "prevmovetype") {
      return this.context.self.prevMoveType ?? "I";
    }
    if (lower === "runorder") {
      return this.context.self.runOrder ?? -1;
    }
    if (lower === "roundno") {
      return this.context.self.roundNo ?? 1;
    }
    if (lower === "roundstate") {
      return runtimeRoundStateFromPhase(this.context.self.roundPhase);
    }
    if (lower === "introstate") {
      return this.context.introState ?? 0;
    }
    if (lower === "fighttime") {
      return this.context.fightScreen?.fightTime ?? 0;
    }
    if (lower === "roundsexisted" || lower === "matchover") {
      return lower === "roundsexisted" ? (this.context.self.roundsExisted ?? 0) : (this.context.self.matchOver ? 1 : 0);
    }
    if (lower === "win" || lower === "winko" || lower === "wintime" || lower === "winperfect") {
      const decision = this.context.roundDecision;
      if (!decision?.settled) {
        return 0;
      }
      if (lower === "win") return decision.win ? 1 : 0;
      if (lower === "winko") return decision.winKO ? 1 : 0;
      if (lower === "wintime") return decision.winTime ? 1 : 0;
      return decision.winPerfect ? 1 : 0;
    }
    if (lower === "lose" || lower === "loseko" || lower === "losetime") {
      const decision = this.context.roundDecision;
      if (!decision?.settled) {
        return 0;
      }
      if (lower === "lose") return decision.lose ? 1 : 0;
      if (lower === "loseko") return decision.loseKO ? 1 : 0;
      return decision.loseTime ? 1 : 0;
    }
    if (lower === "drawgame") {
      return this.context.roundDecision?.settled && this.context.roundDecision.draw ? 1 : 0;
    }
    if (lower === "teammode") {
      if (this.context.teamMode === undefined) {
        this.context.reportUnsupported?.("teammode");
        return failedRedirectMarker;
      }
      return this.context.teamMode;
    }
    if (lower === "teamside") {
      return Math.max(0, Math.trunc(this.context.teamSide ?? 0));
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
    if (lower === "receiveddamage") {
      return this.context.receivedDamage?.() ?? 0;
    }
    if (lower === "receivedhits") {
      return this.context.receivedHits?.() ?? 0;
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
    if (lower === "hitpausetime") {
      return Math.max(0, Math.floor(this.context.hitPauseTime?.() ?? 0));
    }
    if (lower === "command" || lower === "selfcommand") {
      return commandIdentifierMarker;
    }
    if (lower === "backedgebodydist") {
      return this.edgeDist("back", true);
    }
    if (lower === "frontedgebodydist") {
      return this.edgeDist("front", true);
    }
    if (lower === "backedgedist") {
      return this.edgeDist("back", false);
    }
    if (lower === "frontedgedist") {
      return this.edgeDist("front", false);
    }
    if (lower === "inguarddist") {
      return this.context.inGuardDist?.() ? 1 : 0;
    }
    if (lower === "ishelper") {
      return this.isHelper();
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
      return this.numEnemy();
    }
    if (lower === "numpartner") {
      return this.context.numPartner?.() ?? 0;
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
    if (lower === "projcanceltime") {
      return this.context.projCancelTime?.() ?? -1;
    }
    if (/^(s|c|a|l|i|h|n|sc|ca|sa|sca|na|nt|np|st|sp|ha|ht|hp)$/i.test(identifier)) {
      return identifier.toUpperCase();
    }
    if (/^(single|simul|turns|tag)$/i.test(identifier)) {
      return identifier.toLowerCase();
    }
    this.context.reportUnsupported?.(identifier);
    return 0;
  }

  private evaluateFunction(identifier: string, args: ExpressionValue[]): ExpressionValue {
    const lower = identifier.toLowerCase();
    const expectedArity = mathFunctionArity(lower);
    if (expectedArity !== undefined && args.length !== expectedArity) {
      this.context.reportUnsupported?.(`${lower}(arity)`);
      return failedRedirectMarker;
    }
    if (lower === "abs") {
      return Math.abs(numeric(args[0] ?? 0));
    }
    if (lower === "sin") {
      return this.mathUnary(args[0], Math.sin);
    }
    if (lower === "cos") {
      return this.mathUnary(args[0], Math.cos);
    }
    if (lower === "tan") {
      return this.mathUnary(args[0], Math.tan);
    }
    if (lower === "acos") {
      return this.mathUnary(args[0], Math.acos, (value) => value < -1 || value > 1);
    }
    if (lower === "asin") {
      return this.mathUnary(args[0], Math.asin, (value) => value < -1 || value > 1);
    }
    if (lower === "atan") {
      return this.mathUnary(args[0], Math.atan);
    }
    if (lower === "exp") {
      return this.mathUnary(args[0], Math.exp);
    }
    if (lower === "ln") {
      return this.mathUnary(args[0], Math.log, (value) => value <= 0);
    }
    if (lower === "log") {
      if (isFailedRedirect(args[0] ?? 0) || isFailedRedirect(args[1] ?? 0)) {
        return failedRedirectMarker;
      }
      const base = numeric(args[0] ?? 0);
      const value = numeric(args[1] ?? 0);
      if (base <= 0 || value <= 0 || base === 1) {
        this.context.reportUnsupported?.("log(domain)");
        return failedRedirectMarker;
      }
      const result = Math.log(value) / Math.log(base);
      if (!Number.isFinite(result)) {
        this.context.reportUnsupported?.("log(domain)");
        return failedRedirectMarker;
      }
      return result;
    }
    if (lower === "floor") {
      return this.mathRound(args[0], Math.floor);
    }
    if (lower === "ceil") {
      return this.mathRound(args[0], Math.ceil);
    }
    if (lower === "command" || lower === "selfcommand") {
      return this.context.commandActive?.(String(args[0] ?? "")) ? 1 : 0;
    }
    if (lower === "const") {
      return this.constValue(String(args[0] ?? ""));
    }
    if (lower === "playerid") {
      return numeric(args[0] ?? 0);
    }
    if (lower === "const240p") {
      return this.constCoordinateValue(args[0] ?? 0, 320);
    }
    if (lower === "const480p") {
      return this.constCoordinateValue(args[0] ?? 0, 640);
    }
    if (lower === "const720p") {
      return this.constCoordinateValue(args[0] ?? 0, 1280);
    }
    if (lower === "gethitvar") {
      return this.context.getHitVar?.(String(args[0] ?? "")) ?? defaultHitVar(String(args[0] ?? ""));
    }
    if (lower === "gethitvarattr") {
      const filter = args.map(String).join(",");
      return this.context.getHitVarAttr?.(this.context.self, filter) ? 1 : 0;
    }
    if (lower === "gethitvarguardflag") {
      return this.context.getHitVarGuardFlag?.(this.context.self, String(args[0] ?? "")) ? 1 : 0;
    }
    if (lower === "gethitvarhitflag") {
      return this.context.getHitVarHitFlag?.(this.context.self, String(args[0] ?? "")) ? 1 : 0;
    }
    if (lower === "fightscreenstate") {
      return this.context.fightScreenState?.(String(args[0] ?? ""))
        ?? runtimeFightScreenStateValue(this.context.fightScreen, String(args[0] ?? ""))
        ? 1
        : 0;
    }
    if (lower === "fightscreenvar") {
      return this.context.fightScreenVar?.(String(args[0] ?? ""))
        ?? runtimeFightScreenVarValue(this.context.fightScreen, String(args[0] ?? ""))
        ?? 0;
    }
    if (lower === "gamevar") {
      return this.context.gameVar?.(String(args[0] ?? ""))
        ?? runtimeGameVarValue(this.context.fightScreen, String(args[0] ?? ""))
        ?? 0;
    }
    if (lower === "helpervar") {
      const key = String(args[0] ?? "").toLowerCase();
      if (!this.context.helperVarEnabled) {
        return 0;
      }
      if (key === "id") {
        return this.context.helperId ?? 0;
      }
      if (key === "helpertype") {
        return this.context.helperType ?? 0;
      }
      if (key === "keyctrl") {
        return this.context.helperKeyCtrl === true ? 1 : 0;
      }
      if (key === "ownpal") {
        return this.context.isHelper && this.context.helperOwnPalette === true ? 1 : 0;
      }
      if (key === "ownprojectile") {
        return this.context.isHelper && this.context.helperOwnProjectile === true ? 1 : 0;
      }
      if (key === "preserve") {
        return this.context.isHelper && this.context.helperPreserve === true ? 1 : 0;
      }
      if (key === "ownclsnscale") {
        return this.context.isHelper && this.context.helperOwnClsnScale === true ? 1 : 0;
      }
      if (key === "clsnproxy") {
        return this.context.isHelper && this.context.helperClsnProxy === true ? 1 : 0;
      }
      this.context.reportUnsupported?.(`helpervar(${key})`);
      return 0;
    }
    if (lower === "ifelse") {
      if (isFailedRedirect(args[0] ?? 0)) {
        return failedRedirectMarker;
      }
      const selected = truthy(args[0] ?? 0) ? args[1] ?? 0 : args[2] ?? 0;
      return isFailedRedirect(selected) ? failedRedirectMarker : selected;
    }
    if (lower === "cond") {
      const condition = evaluateExpressionFragmentPreservingBottom(String(args[0] ?? "0"), this.context);
      if (isFailedRedirect(condition)) {
        return failedRedirectMarker;
      }
      const selectedExpression = truthy(condition) ? String(args[1] ?? "0") : String(args[2] ?? "0");
      const selected = evaluateExpressionFragmentPreservingBottom(selectedExpression, this.context);
      return isFailedRedirect(selected) ? failedRedirectMarker : selected;
    }
    if (lower === "selfanimexist") {
      return this.context.animExists?.(numeric(args[0] ?? 0)) ? 1 : 0;
    }
    if (lower === "animexist") {
      if (isFailedRedirect(args[0] ?? 0)) {
        return failedRedirectMarker;
      }
      return (this.context.activeAnimExists ?? this.context.animExists)?.(numeric(args[0] ?? 0)) ? 1 : 0;
    }
    if (lower === "selfstatenoexist") {
      return this.context.stateExists?.(numeric(args[0] ?? 0)) ? 1 : 0;
    }
    if (lower === "sysvar") {
      return taggedNumber("int", this.context.self.sysvars?.[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0);
    }
    if (lower === "sysfvar") {
      const index = Math.trunc(numeric(args[0] ?? 0));
      if (index < 0 || index > 4) {
        return taggedNumber("float", 0);
      }
      return taggedNumber("float", this.context.self.sysfvars?.[index] ?? 0);
    }
    if (lower === "var") {
      return taggedNumber("int", this.context.self.vars[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0);
    }
    if (lower === "fvar") {
      return taggedNumber("float", this.context.self.fvars[Math.max(0, Math.floor(numeric(args[0] ?? 0)))] ?? 0);
    }
    if (lower === "animelemvar") {
      return this.context.animElemVar?.(String(args[0] ?? "")) ?? 0;
    }
    if (lower === "clsnvar") {
      const group = String(args[0] ?? "").trim().toLowerCase();
      const coordinate = String(args[2] ?? "").trim().toLowerCase();
      if (!isRuntimeClsnVarGroup(group) || !isRuntimeClsnVarCoordinate(coordinate)) {
        this.context.reportUnsupported?.(`clsnvar(${group || "?"},${coordinate || "?"})`);
        return Number.NaN;
      }
      const indexValue = evaluateExpressionFragmentPreservingBottom(String(args[1] ?? "0"), this.context);
      if (isFailedRedirect(indexValue)) return failedRedirectMarker;
      const index = numeric(indexValue);
      if (!Number.isFinite(index)) return Number.NaN;
      const value = this.context.clsnVar?.(group, Math.trunc(index), coordinate);
      if (value === undefined || !Number.isFinite(value)) return Number.NaN;
      const currentWidth = this.localCoordWidth();
      const outputWidth = this.context.outputLocalCoord?.[0] ?? currentWidth;
      return value * outputWidth / currentWidth;
    }
    if (lower === "clsnoverlap") {
      const actorGroup = String(args[0] ?? "").trim().toLowerCase();
      const targetGroup = String(args.at(-1) ?? "").trim().toLowerCase();
      if (args.length < 3 || !isRuntimeClsnVarGroup(actorGroup) || !isRuntimeClsnVarGroup(targetGroup)) {
        this.context.reportUnsupported?.(`clsnoverlap(${actorGroup || "?"},${targetGroup || "?"})`);
        return 0;
      }
      const playerIdValue = evaluateExpressionFragmentPreservingBottom(args.slice(1, -1).map(String).join(","), this.context);
      if (isFailedRedirect(playerIdValue)) return failedRedirectMarker;
      const playerId = numeric(playerIdValue);
      if (!Number.isFinite(playerId)) return 0;
      return this.context.clsnOverlap?.(actorGroup, Math.trunc(playerId), targetGroup) ? 1 : 0;
    }
    if (lower === "projclsnoverlap") {
      const targetGroup = String(args.at(-1) ?? "").trim().toLowerCase();
      if (args.length < 3 || !isRuntimeClsnVarGroup(targetGroup)) {
        this.context.reportUnsupported?.(`projclsnoverlap(${targetGroup || "?"})`);
        return 0;
      }
      const indexValue = evaluateExpressionFragmentPreservingBottom(String(args[0] ?? "-1"), this.context);
      if (isFailedRedirect(indexValue)) return failedRedirectMarker;
      const playerIdValue = evaluateExpressionFragmentPreservingBottom(args.slice(1, -1).map(String).join(","), this.context);
      if (isFailedRedirect(playerIdValue)) return failedRedirectMarker;
      const index = numeric(indexValue);
      const playerId = numeric(playerIdValue);
      if (!Number.isFinite(index) || index < 0 || !Number.isFinite(playerId)) return 0;
      return this.context.projClsnOverlap?.(Math.trunc(index), Math.trunc(playerId), targetGroup) ? 1 : 0;
    }
    if (lower === "projvar") {
      const parameter = String(args.at(-1) ?? "").trim();
      if (args.length < 3 || !parameter) {
        this.context.reportUnsupported?.(`projvar(${parameter || "?"})`);
        return Number.NaN;
      }
      const projectileIdValue = evaluateExpressionFragmentPreservingBottom(String(args[0] ?? "-1"), this.context);
      if (isFailedRedirect(projectileIdValue)) return failedRedirectMarker;
      const indexValue = evaluateExpressionFragmentPreservingBottom(args.slice(1, -1).map(String).join(","), this.context);
      if (isFailedRedirect(indexValue)) return failedRedirectMarker;
      const projectileId = numeric(projectileIdValue);
      const index = numeric(indexValue);
      if (!Number.isFinite(projectileId) || !Number.isFinite(index) || index < 0) return Number.NaN;
      const value = this.context.projVar?.(
        Math.trunc(projectileId),
        Math.trunc(index),
        parameter,
        this.context.outputLocalCoord ?? this.context.localCoord,
      );
      return value === undefined || !Number.isFinite(value) ? Number.NaN : value;
    }
    if (/^projvar(?:attr|guardflag|hitflag)(?:not)?$/.test(lower)) {
      const parameter: RuntimeProjVarFlagParameter = lower.startsWith("projvarattr")
        ? "attr"
        : lower.startsWith("projvarguardflag")
          ? "guardflag"
          : "hitflag";
      const operator = lower.endsWith("not") ? "!=" : "=";
      const filter = String(args.at(-1) ?? "").trim();
      if (args.length < 3 || !filter) return 0;
      const projectileIdValue = evaluateExpressionFragmentPreservingBottom(String(args[0] ?? "-1"), this.context);
      if (isFailedRedirect(projectileIdValue)) return failedRedirectMarker;
      const indexValue = evaluateExpressionFragmentPreservingBottom(args.slice(1, -1).map(String).join(","), this.context);
      if (isFailedRedirect(indexValue)) return failedRedirectMarker;
      const projectileId = numeric(projectileIdValue);
      const index = numeric(indexValue);
      if (!Number.isFinite(projectileId) || !Number.isFinite(index) || index < 0) return 0;
      return this.context.projVarFlag?.(Math.trunc(projectileId), Math.trunc(index), parameter, filter, operator) ? 1 : 0;
    }
    if (lower === "animelemtime") {
      const elementNumber = Math.floor(numeric(args[0] ?? 0));
      return this.context.animElemTime?.(elementNumber) ?? (this.context.self.frameIndex + 1 === elementNumber ? 0 : -1);
    }
    if (lower === "animelemno") {
      if (isFailedRedirect(args[0] ?? 0)) {
        return failedRedirectMarker;
      }
      return this.context.animElemNo?.(Math.trunc(numeric(args[0] ?? 0))) ?? 0;
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
    if (lower === "ishelper") {
      return this.isHelper(optionalPositiveInteger(args[0]));
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
    if (lower === "projcanceltime") {
      return this.context.projCancelTime?.(optionalProjectileTimeId(args[0])) ?? -1;
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

    this.malformed = true;
    pushRawArg(args, current);
    return args;
  }

  private p2BodyDist(axis: "x" | "y"): number {
    const opponent = this.context.opponent;
    if (!opponent) {
      return Number.NaN;
    }
    if (axis === "y") {
      const selfScale = 320 / (this.context.localCoord?.[0] ?? 320);
      const opponentScale = 320 / (this.context.opponentLocalCoord?.[0] ?? 320);
      const outputScale = 320 / (this.context.outputLocalCoord?.[0] ?? this.context.localCoord?.[0] ?? 320);
      if (!this.context.p2BodyDistYUsesSizeBoxes) {
        return (opponent.pos.y * opponentScale - this.context.self.pos.y * selfScale) / outputScale;
      }
      const selfBox = this.context.sizeBoxY;
      const opponentBox = this.context.opponentSizeBoxY;
      if (!selfBox || !opponentBox) return Number.NaN;
      const selfTop = (this.context.self.pos.y + selfBox.y1) * selfScale;
      const selfBottom = (this.context.self.pos.y + selfBox.y2) * selfScale;
      const opponentTop = (opponent.pos.y + opponentBox.y1) * opponentScale;
      const opponentBottom = (opponent.pos.y + opponentBox.y2) * opponentScale;
      if (selfBottom < opponentTop) return (opponentTop - selfBottom) / outputScale;
      if (selfTop > opponentBottom) return (opponentBottom - selfTop) / outputScale;
      return 0;
    }
    const self = this.context.self;
    const selfScale = 320 / (this.context.localCoord?.[0] ?? 320);
    const opponentScale = 320 / (this.context.opponentLocalCoord?.[0] ?? 320);
    const outputScale = 320 / (this.context.outputLocalCoord?.[0] ?? this.context.localCoord?.[0] ?? 320);
    const selfBox = this.context.sizeBoxX === undefined ? { x1: -24, x2: 24 } : this.context.sizeBoxX;
    const opponentBox = this.context.opponentSizeBoxX === undefined ? { x1: -24, x2: 24 } : this.context.opponentSizeBoxX;
    if (!selfBox || !opponentBox) return Number.NaN;
    const distance = opponent.pos.x * opponentScale - self.pos.x * selfScale;
    const selfWidth = selfBox.x2 * self.facing * selfScale;
    const opponentUsesFront = ((distance * self.facing) >= 0) === (self.facing !== opponent.facing);
    const opponentWidth = (opponentUsesFront ? opponentBox.x2 : opponentBox.x1) * opponent.facing * opponentScale;
    return (distance - selfWidth + opponentWidth) / outputScale;
  }

  private edgeDist(direction: "front" | "back", body: boolean): number {
    const bounds = this.context.stageBounds;
    if (!bounds) {
      return 999;
    }
    const state = this.context.self;
    const axisDistance =
      direction === "front"
        ? state.facing === 1
          ? bounds.right - state.pos.x
          : state.pos.x - bounds.left
        : state.facing === 1
          ? state.pos.x - bounds.left
          : bounds.right - state.pos.x;
    if (!body) {
      return Math.max(0, axisDistance);
    }
    const width = state.bodyWidth ?? { front: 39, back: 39 };
    const bodyWidth = direction === "front" ? width.front : width.back;
    return Math.max(0, axisDistance - bodyWidth);
  }

  private gameSpaceDimension(axis: "width" | "height"): number {
    const gameSpace = this.context.gameSpace;
    if (!gameSpace) {
      return 0;
    }
    const zoom = Number.isFinite(gameSpace.zoom) && gameSpace.zoom !== undefined && gameSpace.zoom > 0 ? gameSpace.zoom : 1;
    return gameSpace[axis] / zoom;
  }

  private screenSpaceDimension(axis: "width" | "height"): number {
    const gameSpace = this.context.gameSpace;
    if (!gameSpace) {
      return 0;
    }
    return gameSpace[axis];
  }

  private constCoordinateValue(value: ExpressionValue, sourceWidth: number): number {
    return (numeric(value) * this.localCoordWidth()) / sourceWidth;
  }

  private localCoordWidth(): number {
    const width = this.context.localCoord?.[0];
    return Number.isFinite(width) && width !== undefined && width > 0 ? width : 320;
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

  private numEnemy(): number {
    const runtimeValue = this.context.numEnemy?.();
    if (runtimeValue === undefined) {
      return this.context.opponent ? 1 : 0;
    }
    if (!Number.isFinite(runtimeValue)) {
      return 0;
    }
    return Math.max(0, Math.trunc(runtimeValue));
  }

  private isHelper(helperId?: number): number {
    if (!this.context.isHelper) {
      return 0;
    }
    return helperId === undefined || this.context.helperId === helperId ? 1 : 0;
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

  private reportMalformed(): void {
    this.context.reportUnsupported?.("malformed expression");
  }
}

function tokenize(expression: string): Token[] {
  return tokenizeMugenExpression(expression).tokens;
}

const rawArgumentFunctions = new Set([
  "cond",
  "const",
  "gethitvar",
  "gethitvarattr",
  "gethitvarguardflag",
  "gethitvarhitflag",
  "fightscreenstate",
  "fightscreenvar",
  "gamevar",
  "helpervar",
  "hitdefattr",
  "animelemvar",
  "clsnvar",
  "clsnoverlap",
  "projclsnoverlap",
  "projvar",
  "projvarattr",
  "projvarattrnot",
  "projvarguardflag",
  "projvarguardflagnot",
  "projvarhitflag",
  "projvarhitflagnot",
]);

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
    "data.fall.defence_up": 50,
    "data.fall.defence_mul": 1.5,
    "default.lifetodizzypointsmul": 1.8,
    "super.lifetodizzypointsmul": 0,
  };
  return constants[name];
}

function defaultHitVar(name: string): number {
  const values: Record<string, number> = {
    animtype: 0,
    ctrltime: 0,
    damage: 0,
    fall: 0,
    "fall.damage": 0,
    "fall.defence_up": 100,
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
    "fall.zvel": 0,
    "fall.zvelocity": 0,
    airtype: 0,
    groundtype: 0,
    hittime: 0,
    hitshaketime: 0,
    guarded: 0,
    isbound: 0,
    slidetime: 0,
    xoff: 0,
    xvel: 0,
    yaccel: 0.44,
    yoff: 0,
    yvel: 0,
    zoff: 0,
  };
  return values[name.trim().toLowerCase()] ?? 0;
}

function truthy(value: ExpressionValue): boolean {
  if (isFailedRedirect(value)) {
    return false;
  }
  if (isTaggedNumber(value)) {
    return value.value !== 0;
  }
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
  const id = optionalPositiveInteger(value);
  return id === 0 ? undefined : id;
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

function isFailedRedirect(value: ExpressionValue): boolean {
  return value === failedRedirectMarker;
}

function resolveRedirectTargetId(index: string | undefined, context: ExpressionContext): number | "unsupported" | undefined {
  if (!index) {
    return undefined;
  }
  const trimmed = index.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return normalizeRedirectTargetId(Number(trimmed), context);
  }
  if (containsUnavailableEnemyNearIndex(trimmed)) {
    return "unsupported";
  }
  let indexUnsupported = false;
  const value = evaluateExpression(trimmed, {
    ...context,
    reportUnsupported: (feature) => {
      indexUnsupported = true;
      context.reportUnsupported?.(feature);
    },
  });
  if (indexUnsupported) {
    return "unsupported";
  }
  if (isFailedRedirect(value)) {
    return "unsupported";
  }
  return normalizeRedirectTargetId(numeric(value), context);
}

function resolvePlayerIdIndex(index: string | undefined, context: ExpressionContext): number | "unsupported" {
  if (!index || index.trim() === "") {
    context.reportUnsupported?.("playerid");
    return "unsupported";
  }
  const trimmed = index.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return normalizePlayerId(Number(trimmed), context);
  }
  let indexUnsupported = false;
  const value = evaluateExpression(trimmed, {
    ...context,
    reportUnsupported: (feature) => {
      indexUnsupported = true;
      context.reportUnsupported?.(feature);
    },
  });
  if (indexUnsupported || isFailedRedirect(value)) {
    return "unsupported";
  }
  return normalizePlayerId(numeric(value), context);
}

function containsUnavailableEnemyNearIndex(expression: string): boolean {
  return /\benemynear\s*\(\s*[1-9]\d*(?:\s*\)|\s*$)/i.test(expression);
}

function enemyNearRedirectContext(index: string | undefined, context: ExpressionContext): ExpressionContext | "fail" {
  const enemyIndex = resolveEnemyNearIndex(index, context);
  if (enemyIndex === "unsupported") {
    return "fail";
  }
  const redirected = context.enemyNear?.(enemyIndex);
  if (redirected) {
    return redirectedTargetContext(context, redirected);
  }
  if (enemyIndex > 0) {
    return "fail";
  }
  if (context.enemyNearFallbackToOpponent === false) {
    return "fail";
  }
  if (!context.opponent) {
    context.reportUnsupported?.("enemynear");
    return "fail";
  }
  return {
    ...context,
    self: context.opponent,
    playerId: context.opponentPlayerId,
    playerNo: context.opponentPlayerNo,
    animPlayerNo: context.opponentAnimPlayerNo,
    clsnVar: context.opponentClsnVar,
    opponentClsnVar: context.clsnVar,
    clsnOverlap: context.opponentClsnOverlap,
    opponentClsnOverlap: context.clsnOverlap,
    projClsnOverlap: context.opponentProjClsnOverlap,
    opponentProjClsnOverlap: context.projClsnOverlap,
    projVar: context.opponentProjVar,
    opponentProjVar: context.projVar,
    projVarFlag: context.opponentProjVarFlag,
    opponentProjVarFlag: context.projVarFlag,
    opponent: context.self,
    opponentPlayerId: context.playerId,
    opponentPlayerNo: context.playerNo,
    localCoord: context.opponentLocalCoord ?? context.localCoord,
    opponentLocalCoord: context.localCoord,
    outputLocalCoord: context.outputLocalCoord ?? context.localCoord,
    sizeBoxX: context.opponentSizeBoxX,
    opponentSizeBoxX: context.sizeBoxX,
    sizeBoxY: context.opponentSizeBoxY,
    opponentSizeBoxY: context.sizeBoxY,
    name: context.opponentName,
    authorName: context.opponentAuthorName,
    opponentName: context.name,
    opponentAuthorName: context.authorName,
    teamSide: context.opponentTeamSide,
    opponentTeamSide: context.teamSide,
    allowVariableAssignment: false,
  };
}

function rosterRedirectContext(target: "partner" | "enemy", index: string | undefined, context: ExpressionContext): ExpressionContext | "fail" {
  const rosterIndex = resolveRosterIndex(target, index, context);
  if (rosterIndex === "unsupported") {
    return "fail";
  }
  const redirected = target === "partner" ? context.partner?.(rosterIndex) : context.enemy?.(rosterIndex);
  if (!redirected) {
    if (!context.partner && target === "partner") {
      context.reportUnsupported?.("partner");
    } else if (!context.enemy && target === "enemy") {
      context.reportUnsupported?.("enemy");
    }
    return "fail";
  }
  return redirectedTargetContext(context, redirected);
}

function parentOrRootRedirectContext(target: "parent" | "root", context: ExpressionContext): ExpressionContext | "fail" {
  const packaged = target === "parent" ? context.parentRedirect : context.rootRedirect;
  if (packaged) {
    return redirectedTargetContext(context, packaged);
  }
  const redirectedSelf = target === "parent" ? context.parent : context.root;
  if (!redirectedSelf) {
    context.reportUnsupported?.(target);
    return "fail";
  }
  return redirectedTargetContext(context, {
    self: redirectedSelf,
    playerId: target === "parent" ? context.parentPlayerId : context.rootPlayerId,
    playerNo: target === "parent" ? context.parentPlayerNo : context.rootPlayerNo,
    localCoord: target === "parent" ? context.parentLocalCoord ?? context.localCoord : context.rootLocalCoord ?? context.localCoord,
    teamSide: target === "parent" ? context.parentTeamSide : context.rootTeamSide,
    clsnVar: target === "parent" ? context.parentClsnVar : context.rootClsnVar,
    clsnOverlap: target === "parent" ? context.parentClsnOverlap : context.rootClsnOverlap,
    projClsnOverlap: target === "parent" ? context.parentProjClsnOverlap : context.rootProjClsnOverlap,
    projVar: target === "parent" ? context.parentProjVar : context.rootProjVar,
    projVarFlag: target === "parent" ? context.parentProjVarFlag : context.rootProjVarFlag,
  });
}

function redirectedTargetContext(context: ExpressionContext, redirected: ExpressionRedirectTarget): ExpressionContext {
  return {
    ...context,
    self: redirected.self,
    playerId: redirected.playerId,
    playerNo: redirected.playerNo,
    animPlayerNo: redirected.animPlayerNo,
    animExists: redirected.animExists,
    activeAnimExists: redirected.activeAnimExists,
    animElemNo: redirected.animElemNo,
    roundDecision: redirected.roundDecision,
    clsnVar: redirected.clsnVar,
    opponentClsnVar: redirected.opponentClsnVar ?? context.clsnVar,
    clsnOverlap: redirected.clsnOverlap,
    opponentClsnOverlap: redirected.opponentClsnOverlap ?? context.clsnOverlap,
    projClsnOverlap: redirected.projClsnOverlap,
    opponentProjClsnOverlap: redirected.opponentProjClsnOverlap ?? context.projClsnOverlap,
    projVar: redirected.projVar,
    opponentProjVar: redirected.opponentProjVar ?? context.projVar,
    projVarFlag: redirected.projVarFlag,
    opponentProjVarFlag: redirected.opponentProjVarFlag ?? context.projVarFlag,
    opponent: redirected.opponent ?? context.self,
    opponentPlayerId: redirected.opponentPlayerId ?? context.playerId,
    opponentPlayerNo: redirected.opponentPlayerNo ?? context.playerNo,
    opponentAnimPlayerNo: redirected.opponentAnimPlayerNo ?? context.animPlayerNo,
    localCoord: redirected.localCoord ?? context.localCoord,
    opponentLocalCoord: redirected.opponentLocalCoord ?? context.localCoord,
    outputLocalCoord: context.outputLocalCoord ?? context.localCoord,
    sizeBoxX: redirected.sizeBoxX,
    opponentSizeBoxX: redirected.opponentSizeBoxX === undefined ? context.sizeBoxX : redirected.opponentSizeBoxX,
    sizeBoxY: redirected.sizeBoxY,
    opponentSizeBoxY: redirected.opponentSizeBoxY === undefined ? context.sizeBoxY : redirected.opponentSizeBoxY,
    name: redirected.name,
    authorName: redirected.authorName,
    opponentName: redirected.opponentName ?? context.name,
    opponentAuthorName: redirected.opponentAuthorName ?? context.authorName,
    teamSide: redirected.teamSide,
    opponentTeamSide: redirected.opponentTeamSide ?? context.teamSide,
    allowVariableAssignment: false,
  };
}

function isRuntimeClsnVarGroup(value: string): value is RuntimeClsnVarGroup {
  return value === "clsn1" || value === "clsn2" || value === "size";
}

function isRuntimeClsnVarCoordinate(value: string): value is RuntimeClsnVarCoordinate {
  return value === "back" || value === "front" || value === "top" || value === "bottom";
}

function resolveEnemyNearIndex(index: string | undefined, context: ExpressionContext): number | "unsupported" {
  if (!index) {
    return 0;
  }
  const trimmed = index.trim();
  if (trimmed === "") {
    return 0;
  }
  if (/^-?\d+$/.test(trimmed)) {
    return normalizeEnemyNearIndex(Number(trimmed), context);
  }
  let indexUnsupported = false;
  const value = evaluateExpression(trimmed, {
    ...context,
    reportUnsupported: (feature) => {
      indexUnsupported = true;
      context.reportUnsupported?.(feature);
    },
  });
  if (indexUnsupported || isFailedRedirect(value)) {
    return "unsupported";
  }
  return normalizeEnemyNearIndex(numeric(value), context);
}

function resolveRosterIndex(
  target: "partner" | "enemy",
  index: string | undefined,
  context: ExpressionContext,
): number | "unsupported" {
  if (!index || index.trim() === "") {
    return 0;
  }
  const trimmed = index.trim();
  if (/^-?\d+$/.test(trimmed)) {
    return normalizeRosterIndex(target, Number(trimmed), context);
  }
  let indexUnsupported = false;
  const value = evaluateExpression(trimmed, {
    ...context,
    reportUnsupported: (feature) => {
      indexUnsupported = true;
      context.reportUnsupported?.(feature);
    },
  });
  if (indexUnsupported || isFailedRedirect(value)) {
    return "unsupported";
  }
  return normalizeRosterIndex(target, numeric(value), context);
}

function normalizeEnemyNearIndex(value: number, context: ExpressionContext): number | "unsupported" {
  if (!Number.isFinite(value)) {
    context.reportUnsupported?.("enemynear(dynamic-invalid)");
    return "unsupported";
  }
  const enemyIndex = Math.trunc(value);
  if (enemyIndex < 0) {
    context.reportUnsupported?.("enemynear(negative)");
    return "unsupported";
  }
  return enemyIndex;
}

function normalizeRosterIndex(target: "partner" | "enemy", value: number, context: ExpressionContext): number | "unsupported" {
  if (!Number.isFinite(value)) {
    context.reportUnsupported?.(`${target}(dynamic-invalid)`);
    return "unsupported";
  }
  const rosterIndex = Math.trunc(value);
  if (rosterIndex < 0) {
    context.reportUnsupported?.(`${target}(negative)`);
    return "unsupported";
  }
  return rosterIndex;
}

function normalizeRedirectTargetId(value: number, context: ExpressionContext): number | "unsupported" {
  if (!Number.isFinite(value)) {
    context.reportUnsupported?.("target(dynamic-invalid)");
    return "unsupported";
  }
  const targetId = Math.trunc(value);
  if (targetId < 0) {
    context.reportUnsupported?.("target(negative)");
    return "unsupported";
  }
  return targetId;
}

function normalizePlayerId(value: number, context: ExpressionContext): number | "unsupported" {
  if (!Number.isFinite(value)) {
    context.reportUnsupported?.("playerid(dynamic-invalid)");
    return "unsupported";
  }
  const playerId = Math.trunc(value);
  if (playerId < 0) {
    context.reportUnsupported?.("playerid(negative)");
    return "unsupported";
  }
  return playerId;
}

function clampAiLevel(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(8, Math.trunc(value)));
}

function taggedNumber(kind: ExpressionNumericKind, value: number): TaggedNumber {
  return { numericKind: kind, value };
}

function isTaggedNumber(value: ExpressionValue): value is TaggedNumber {
  return typeof value === "object" && value !== null && "numericKind" in value;
}

function numericKindOf(value: ExpressionValue): ExpressionNumericKind {
  if (isTaggedNumber(value)) {
    return value.numericKind;
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? "int" : "float";
  }
  return "int";
}

function combinePower(
  left: ExpressionValue,
  right: ExpressionValue,
  reportUnsupported?: (feature: string) => void,
): ExpressionValue {
  if (isFailedRedirect(left) || isFailedRedirect(right)) {
    return failedRedirectMarker;
  }
  const exponent = numeric(right);
  const useFloat = numericKindOf(left) === "float" || numericKindOf(right) === "float" || exponent < 0;
  const result = Math.pow(numeric(left), exponent);
  if (!Number.isFinite(result)) {
    reportUnsupported?.("pow(domain)");
    return failedRedirectMarker;
  }
  if (useFloat) {
    return taggedNumber("float", result);
  }
  return taggedNumber("int", result);
}

function combineArithmetic(
  left: ExpressionValue,
  right: ExpressionValue,
  operate: (left: number, right: number) => number,
): ExpressionValue {
  if (isFailedRedirect(left) || isFailedRedirect(right)) {
    return failedRedirectMarker;
  }
  const result = operate(numeric(left), numeric(right));
  if (!Number.isFinite(result)) {
    return failedRedirectMarker;
  }
  const kind = numericKindOf(left) === "float" || numericKindOf(right) === "float" || !Number.isInteger(result) ? "float" : "int";
  return taggedNumber(kind, result);
}

function unwrapExpressionValue(value: ExpressionValue): boolean | number | string {
  if (isFailedRedirect(value)) {
    return 0;
  }
  if (isTaggedNumber(value)) {
    return value.value;
  }
  return value;
}

function classifyExpressionValue(value: ExpressionValue): ExpressionNumericResult {
  if (isFailedRedirect(value)) {
    return { kind: "invalid", value: Number.NaN };
  }
  if (isTaggedNumber(value)) {
    return { kind: value.numericKind, value: value.value };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return { kind: "invalid", value: Number.NaN };
    }
    return { kind: Number.isInteger(value) ? "int" : "float", value };
  }
  if (typeof value === "boolean") {
    return { kind: "int", value: value ? 1 : 0 };
  }
  return { kind: "invalid", value: Number.NaN };
}

function numeric(value: ExpressionValue): number {
  if (isTaggedNumber(value)) {
    return value.value;
  }
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
  const leftNumber = isTaggedNumber(left) ? left.value : Number(left);
  const rightNumber = isTaggedNumber(right) ? right.value : Number(right);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return leftNumber === rightNumber ? 0 : leftNumber < rightNumber ? -1 : 1;
  }
  const leftString = String(left).toLowerCase();
  const rightString = String(right).toLowerCase();
  return leftString === rightString ? 0 : leftString < rightString ? -1 : 1;
}
