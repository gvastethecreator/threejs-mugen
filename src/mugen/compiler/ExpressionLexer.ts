export type ExpressionLexToken =
  | { type: "number"; value: string }
  | { type: "string"; value: string }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma"; value: "," }
  | { type: "invalid"; value: string };

export type TokenizedMugenExpression = {
  tokens: ExpressionLexToken[];
  invalidCharacters: string[];
};

const expressionTokenPattern =
  /\s*(?:((?:\d+(?:\.\d+)?|\.\d+))|"(.*?)"|([A-Za-z_][A-Za-z0-9_.]*)|(&&|\|\||!=|<=|>=|[=<>+\-*/!])|([()])|(,))/gy;

export function tokenizeMugenExpression(expression: string): TokenizedMugenExpression {
  const tokens: ExpressionLexToken[] = [];
  const invalidCharacters: string[] = [];
  let cursor = 0;
  while (cursor < expression.length) {
    expressionTokenPattern.lastIndex = cursor;
    const match = expressionTokenPattern.exec(expression);
    if (!match || match.index !== cursor) {
      const character = expression[cursor] ?? "";
      if (/\s/.test(character)) {
        cursor += 1;
        continue;
      }
      tokens.push({ type: "invalid", value: character });
      invalidCharacters.push(character);
      cursor += 1;
      continue;
    }
    cursor = expressionTokenPattern.lastIndex;
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
  return { tokens, invalidCharacters };
}

export function isMalformedMugenExpression(lexed: TokenizedMugenExpression): boolean {
  if (lexed.invalidCharacters.length > 0) {
    return true;
  }
  const tokens = lexed.tokens;
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) {
      continue;
    }
    if (token.type === "paren" && token.value === "(") {
      depth += 1;
    } else if (token.type === "paren" && token.value === ")") {
      depth -= 1;
      if (depth < 0) {
        return true;
      }
    }
    const next = tokens[index + 1];
    if (next && adjacentValueTokens(token, next)) {
      return true;
    }
  }
  if (depth !== 0) {
    return true;
  }
  const first = tokens[0];
  if (first?.type === "operator" && first.value !== "-" && first.value !== "!") {
    return true;
  }
  const last = tokens[tokens.length - 1];
  return last?.type === "operator";
}

function adjacentValueTokens(left: ExpressionLexToken, right: ExpressionLexToken): boolean {
  if (left.type === "identifier" && right.type === "paren" && right.value === "(") {
    return false;
  }
  return isValueEndToken(left) && isValueStartToken(right);
}

function isValueEndToken(token: ExpressionLexToken): boolean {
  return (
    token.type === "number" ||
    token.type === "string" ||
    token.type === "identifier" ||
    (token.type === "paren" && token.value === ")")
  );
}

function isValueStartToken(token: ExpressionLexToken): boolean {
  return (
    token.type === "number" ||
    token.type === "string" ||
    token.type === "identifier" ||
    (token.type === "paren" && token.value === "(")
  );
}
