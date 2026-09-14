import {
  type MugenStateController,
  type MugenStateDef,
  type MugenStateFile,
  type MugenStateSpecial,
  type MugenTrigger,
} from "../model/MugenState";
import { applyMugenStateDefParam } from "./CnsParser";
import { createDiagnostic } from "./text";

export type ZssParseResult = MugenStateFile & {
  zss: {
    status: "compiled" | "blocked";
    stateDefs: number;
    controllers: number;
  };
};

type ZssPredicate = {
  expression: string;
  line: number;
  raw: string;
};

type ZssModifiers = {
  ignoreHitPause?: true;
  persistent?: string;
};

type ZssContext = {
  predicates: ZssPredicate[];
  modifiers: ZssModifiers;
};

const UNSUPPORTED_ZSS_KEYWORDS = new Set([
  "for",
  "while",
  "switch",
  "case",
  "default",
  "let",
  "call",
  "break",
  "continue",
]);

const EXECUTABLE_ZSS_CONTROLLER_TYPES = new Set([
  "null",
  "posadd",
  "changestate",
  "velset",
  "changeanim",
  "changeanim2",
  "posset",
  "veladd",
  "velmul",
  "ctrlset",
  "statetypeset",
  "varset",
  "varadd",
  "hitdef",
]);

/**
 * Parses the intentionally small executable ZSS slice used by the package
 * loader. It lowers into MugenStateFile so CNS and ZSS continue through the
 * same source resolver, compiler, and runtime dispatcher.
 *
 * Grammar deliberately accepted here:
 * - [StateDef id; key: value;]
 * - controller{key: value;}
 * - if / else if / else blocks
 * - ignoreHitPause and persistent(<positive integer>) wrapper blocks
 *
 * Unsupported or malformed grammar invalidates the entire source. Returning
 * no states is intentional: a partially parsed ZSS source must never run.
 */
export function parseZss(text: string, file?: string): ZssParseResult {
  return new ZssParser(text, file).parse();
}

class ZssParser {
  private readonly source: string;
  private readonly lineStarts: number[];
  private readonly states: MugenStateDef[] = [];
  private readonly controllers: MugenStateController[] = [];
  private readonly diagnostics: MugenStateFile["diagnostics"] = [];
  private position = 0;
  private failed = false;

  constructor(
    private readonly rawSource: string,
    private readonly file?: string,
  ) {
    this.source = stripZssComments(rawSource);
    this.lineStarts = lineStarts(rawSource);
  }

  parse(): ZssParseResult {
    this.skipTrivia();
    while (!this.atEnd()) {
      if (this.peek() !== "[") {
        this.fail("Expected a [StateDef ...] header before ZSS code", this.position, this.position + 1);
        this.skipToNextHeader();
        this.skipTrivia();
        continue;
      }
      this.parseStateDef();
      this.skipTrivia();
    }

    const status = this.failed ? "blocked" : "compiled";
    return {
      states: status === "compiled" ? this.states : [],
      controllers: status === "compiled" ? this.controllers : [],
      constants: {},
      diagnostics: this.diagnostics,
      zss: {
        status,
        stateDefs: this.states.length,
        controllers: this.controllers.length,
      },
    };
  }

  private parseStateDef(): void {
    const headerStart = this.position;
    const header = this.readBalanced("[", "]", "Unterminated ZSS StateDef header");
    if (!header) {
      return;
    }
    const fields = splitTopLevel(header.content, ";").map((field) => field.trim());
    const stateHeader = fields.shift() ?? "";
    const identity = parseStateIdentity(stateHeader);
    if (!identity) {
      const feature = /^function\b/i.test(stateHeader) ? "ZSS functions" : "ZSS header";
      this.fail(`${feature} are outside the executable ZSS subset`, headerStart, header.end);
      this.skipToNextHeader();
      return;
    }

    const state: MugenStateDef = {
      ...identity,
      rawParams: {},
      controllers: [],
      line: this.lineAt(headerStart),
    };
    for (const field of fields) {
      if (!field) {
        continue;
      }
      const pair = splitZssPair(field);
      if (!pair) {
        this.fail("StateDef parameters must use key: value and end with ;", headerStart, header.end);
        continue;
      }
      applyMugenStateDefParam(state, pair.key, pair.value);
    }
    this.states.push(state);
    this.parseStatements(state, emptyContext(), () => this.peek() === "[");
  }

  private parseStatements(state: MugenStateDef, context: ZssContext, stop: () => boolean): void {
    while (!this.atEnd()) {
      this.skipTrivia();
      if (stop() || this.atEnd()) {
        return;
      }
      this.parseStatement(state, context);
    }
  }

  private parseStatement(state: MugenStateDef, context: ZssContext): void {
    const start = this.position;
    const name = this.readIdentifier();
    if (!name) {
      this.fail("Unsupported ZSS statement", start, Math.min(start + 1, this.source.length));
      this.skipStatement();
      return;
    }
    const normalized = name.toLowerCase();
    if (normalized === "if") {
      this.parseIf(state, context, start);
      return;
    }
    if (normalized === "else") {
      this.fail("ZSS else must directly follow an if block", start, this.position);
      this.skipStatement();
      return;
    }
    if (normalized === "ignorehitpause" || normalized === "persistent") {
      this.parseWrapper(state, context, start, normalized);
      return;
    }
    if (isUnsupportedKeyword(normalized)) {
      this.fail(`${name} is outside the executable ZSS subset`, start, this.position);
      this.skipStatement();
      return;
    }
    this.parseController(state, context, start, name);
  }

  private parseWrapper(state: MugenStateDef, context: ZssContext, start: number, first: string): void {
    let modifiers: ZssModifiers = { ...context.modifiers };
    let current = first;
    let currentStart = start;

    while (true) {
      if (current === "ignorehitpause") {
        modifiers.ignoreHitPause = true;
      } else {
        this.skipTrivia();
        if (this.peek() !== "(") {
          this.fail("persistent requires a positive integer interval", currentStart, this.position);
          return;
        }
        const interval = this.readBalanced("(", ")", "Unterminated persistent interval");
        if (!interval) {
          return;
        }
        const value = interval.content.trim();
        if (!/^\d+$/.test(value) || Number(value) < 1) {
          this.fail("persistent only supports a positive integer interval in the executable ZSS subset", interval.start, interval.end);
          return;
        }
        modifiers.persistent = String(Number(value));
      }

      this.skipTrivia();
      const nextStart = this.position;
      const next = this.readIdentifier();
      if (!next) {
        break;
      }
      const normalized = next.toLowerCase();
      if (normalized === "ignorehitpause" || normalized === "persistent") {
        current = normalized;
        currentStart = nextStart;
        continue;
      }
      if (normalized === "if") {
        this.parseIf(state, { predicates: context.predicates, modifiers }, nextStart);
        return;
      }
      this.position = nextStart;
      break;
    }

    this.skipTrivia();
    if (this.peek() !== "{") {
      this.fail("ZSS wrappers must enclose a block or precede if", start, this.position);
      this.skipStatement();
      return;
    }
    this.parseBlock(state, { predicates: context.predicates, modifiers });
  }

  private parseIf(state: MugenStateDef, context: ZssContext, start: number): void {
    const condition = this.readCondition(start);
    if (!condition) {
      return;
    }
    const alternatives: ZssPredicate[] = [condition];
    this.parseBlock(state, {
      predicates: [...context.predicates, condition],
      modifiers: context.modifiers,
    });

    while (true) {
      this.skipTrivia();
      const elseStart = this.position;
      const elseKeyword = this.readIdentifier();
      if (elseKeyword?.toLowerCase() !== "else") {
        this.position = elseStart;
        return;
      }
      this.skipTrivia();
      const branchStart = this.position;
      const branchKeyword = this.readIdentifier();
      const priorNegation = alternatives.map(negatePredicate);
      if (branchKeyword?.toLowerCase() === "if") {
        const elseIf = this.readCondition(branchStart);
        if (!elseIf) {
          return;
        }
        alternatives.push(elseIf);
        this.parseBlock(state, {
          predicates: [...context.predicates, ...priorNegation, elseIf],
          modifiers: context.modifiers,
        });
        continue;
      }
      if (branchKeyword) {
        this.position = branchStart;
      }
      this.skipTrivia();
      if (this.peek() !== "{") {
        this.fail("ZSS else must be followed by a block", elseStart, this.position);
        return;
      }
      this.parseBlock(state, {
        predicates: [...context.predicates, ...priorNegation],
        modifiers: context.modifiers,
      });
      return;
    }
  }

  private parseBlock(state: MugenStateDef, context: ZssContext): void {
    const start = this.position;
    if (this.peek() !== "{") {
      this.fail("Expected a ZSS block", start, start + 1);
      return;
    }
    const end = this.findBalancedEnd(start, "{", "}");
    if (end === undefined) {
      this.fail("Unterminated ZSS block", start, this.source.length);
      this.position = this.source.length;
      return;
    }
    this.position = start + 1;
    this.parseStatements(state, context, () => this.position >= end);
    this.position = end + 1;
  }

  private parseController(state: MugenStateDef, context: ZssContext, start: number, type: string): void {
    this.skipTrivia();
    if (this.peek() !== "{") {
      this.fail(`ZSS controller ${type} must use controller{key: value;}`, start, this.position);
      this.skipStatement();
      return;
    }
    const block = this.readBalanced("{", "}", `Unterminated ZSS controller ${type}`);
    if (!block) {
      return;
    }
    const params = parseControllerParams(block.content);
    if (!params) {
      this.fail(`ZSS controller ${type} has an invalid parameter list`, block.start, block.end);
      return;
    }
    if (!EXECUTABLE_ZSS_CONTROLLER_TYPES.has(type.toLowerCase())) {
      this.fail(`ZSS controller ${type} is outside the executable ZSS subset`, start, block.end);
      return;
    }
    if (context.modifiers.ignoreHitPause) {
      params.ignorehitpause = "1";
    }
    if (context.modifiers.persistent !== undefined) {
      params.persistent = context.modifiers.persistent;
    }
    const triggers = context.predicates.length === 0 ? [] : [combinePredicates(context.predicates)];
    const controller: MugenStateController = {
      stateId: state.id,
      ...(state.special ? { special: state.special } : {}),
      name: type,
      type,
      triggers,
      params,
      line: this.lineAt(start),
      rawHeader: this.rawSource.slice(start, block.end),
    };
    this.controllers.push(controller);
    state.controllers.push(controller);
  }

  private readCondition(start: number): ZssPredicate | undefined {
    const conditionStart = this.position;
    const brace = this.findNextTopLevel("{");
    if (brace === undefined) {
      this.fail("ZSS if requires a braced block", start, this.position);
      return undefined;
    }
    const expression = this.source.slice(conditionStart, brace).trim();
    if (!expression) {
      this.fail("ZSS if requires a condition", start, brace);
      return undefined;
    }
    const raw = this.rawSource.slice(conditionStart, brace).trim();
    this.position = brace;
    return {
      expression,
      line: this.lineAt(conditionStart),
      raw,
    };
  }

  private readBalanced(open: string, close: string, message: string): { start: number; end: number; contentStart: number; contentEnd: number; content: string } | undefined {
    const start = this.position;
    if (this.peek() !== open) {
      this.fail(message, start, start + 1);
      return undefined;
    }
    this.position += 1;
    const contentStart = this.position;
    let depth = 1;
    let quote: string | undefined;
    let escaped = false;
    while (!this.atEnd()) {
      const character = this.peek();
      this.position += 1;
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === quote) {
          quote = undefined;
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
      } else if (character === open) {
        depth += 1;
      } else if (character === close) {
        depth -= 1;
        if (depth === 0) {
          const contentEnd = this.position - 1;
          return {
            start,
            end: this.position,
            contentStart,
            contentEnd,
            content: this.source.slice(contentStart, contentEnd),
          };
        }
      }
    }
    this.fail(message, start, this.source.length);
    return undefined;
  }

  private findNextTopLevel(target: string): number | undefined {
    let quote: string | undefined;
    let escaped = false;
    let parentheses = 0;
    for (let index = this.position; index < this.source.length; index += 1) {
      const character = this.source[index]!;
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === quote) {
          quote = undefined;
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
      } else if (character === "(") {
        parentheses += 1;
      } else if (character === ")") {
        parentheses = Math.max(0, parentheses - 1);
      } else if (character === target && parentheses === 0) {
        return index;
      }
    }
    return undefined;
  }

  private findBalancedEnd(start: number, open: string, close: string): number | undefined {
    let depth = 0;
    let quote: string | undefined;
    let escaped = false;
    for (let index = start; index < this.source.length; index += 1) {
      const character = this.source[index]!;
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (character === "\\") {
          escaped = true;
        } else if (character === quote) {
          quote = undefined;
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
      } else if (character === open) {
        depth += 1;
      } else if (character === close) {
        depth -= 1;
        if (depth === 0) {
          return index;
        }
      }
    }
    return undefined;
  }

  private readIdentifier(): string | undefined {
    const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.source.slice(this.position));
    if (!match?.[0]) {
      return undefined;
    }
    this.position += match[0].length;
    return match[0];
  }

  private skipTrivia(): void {
    while (!this.atEnd() && /\s/.test(this.peek())) {
      this.position += 1;
    }
  }

  private skipStatement(): void {
    while (!this.atEnd()) {
      const character = this.peek();
      if (character === "\n" || character === ";" || character === "[") {
        if (character !== "[") {
          this.position += 1;
        }
        return;
      }
      this.position += 1;
    }
  }

  private skipToNextHeader(): void {
    const next = this.source.indexOf("[", this.position);
    this.position = next >= 0 ? next : this.source.length;
  }

  private lineAt(position: number): number {
    let lower = 0;
    let upper = this.lineStarts.length;
    while (lower + 1 < upper) {
      const middle = Math.floor((lower + upper) / 2);
      if ((this.lineStarts[middle] ?? 0) <= position) {
        lower = middle;
      } else {
        upper = middle;
      }
    }
    return lower + 1;
  }

  private fail(message: string, start: number, end: number): void {
    this.failed = true;
    this.diagnostics.push(
      createDiagnostic("error", message, {
        format: "zss",
        file: this.file,
        line: this.lineAt(start),
        raw: this.rawSource.slice(start, Math.max(start + 1, end)),
      }),
    );
  }

  private atEnd(): boolean {
    return this.position >= this.source.length;
  }

  private peek(): string {
    return this.source[this.position] ?? "";
  }
}

function emptyContext(): ZssContext {
  return { predicates: [], modifiers: {} };
}

function parseStateIdentity(header: string): { id: number; special?: MugenStateSpecial } | undefined {
  const match = /^statedef\s+(-?\d+|\+1)$/i.exec(header.trim());
  if (!match?.[1]) {
    return undefined;
  }
  if (match[1] === "+1") {
    return { id: 1, special: "plus-one" };
  }
  return { id: Number(match[1]) };
}

function parseControllerParams(content: string): Record<string, string> | undefined {
  const params: Record<string, string> = {};
  for (const field of splitTopLevel(content, ";")) {
    const trimmed = field.trim();
    if (!trimmed) {
      continue;
    }
    const pair = splitZssPair(trimmed);
    if (!pair) {
      return undefined;
    }
    params[pair.key] = pair.value;
  }
  return params;
}

function splitZssPair(value: string): { key: string; value: string } | undefined {
  const separator = indexOfTopLevel(value, ":");
  if (separator < 1) {
    return undefined;
  }
  const key = value.slice(0, separator).trim();
  const expression = value.slice(separator + 1).trim();
  if (!/^[A-Za-z_][A-Za-z0-9_.]*$/.test(key) || !expression) {
    return undefined;
  }
  return { key, value: expression };
}

function combinePredicates(predicates: readonly ZssPredicate[]): MugenTrigger {
  return {
    index: 1,
    expression: predicates.map((predicate) => `(${predicate.expression})`).join(" && "),
    raw: predicates.map((predicate) => predicate.raw).join(" && "),
    line: predicates[0]?.line ?? 1,
  };
}

function negatePredicate(predicate: ZssPredicate): ZssPredicate {
  return {
    expression: `!(${predicate.expression})`,
    line: predicate.line,
    raw: `!(${predicate.raw})`,
  };
}

function isUnsupportedKeyword(value: string): boolean {
  return UNSUPPORTED_ZSS_KEYWORDS.has(value);
}

function splitTopLevel(value: string, delimiter: string): string[] {
  const fields: string[] = [];
  let start = 0;
  let quote: string | undefined;
  let escaped = false;
  let parentheses = 0;
  let braces = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index]!;
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "(") {
      parentheses += 1;
    } else if (character === ")") {
      parentheses = Math.max(0, parentheses - 1);
    } else if (character === "{") {
      braces += 1;
    } else if (character === "}") {
      braces = Math.max(0, braces - 1);
    } else if (character === delimiter && parentheses === 0 && braces === 0) {
      fields.push(value.slice(start, index));
      start = index + 1;
    }
  }
  fields.push(value.slice(start));
  return fields;
}

function indexOfTopLevel(value: string, target: string): number {
  const fields = splitTopLevel(value, target);
  if (fields.length < 2) {
    return -1;
  }
  return fields[0]?.length ?? -1;
}

function stripZssComments(source: string): string {
  const characters = source.split("");
  let quote: string | undefined;
  let escaped = false;
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index]!;
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "#") {
      for (let comment = index; comment < characters.length && characters[comment] !== "\n"; comment += 1) {
        characters[comment] = " ";
      }
    }
  }
  return characters.join("");
}

function lineStarts(source: string): number[] {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "\n") {
      starts.push(index + 1);
    }
  }
  return starts;
}
