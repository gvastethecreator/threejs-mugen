const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const shouldFix = args.includes("--fix-exact");
const shouldFixShadowed = args.includes("--fix-shadowed");
const shouldFixCrossFileShadowed = args.includes("--fix-cross-file-shadowed");
const shouldFixEmptyAtRules = args.includes("--fix-empty-at-rules");
const shouldFixLegacyStyleShadowed = args.includes("--fix-legacy-style-shadowed");
const shouldPrintOverlapDetails = args.includes("--detail-overlaps");
const shouldPrintRepeatedDetails = args.includes("--detail-repeated");
const detailLimitArg = args.find((arg) => arg.startsWith("--detail-limit="));
const detailLimit = Math.max(1, Number.parseInt(detailLimitArg?.slice("--detail-limit=".length) ?? "30", 10) || 30);
const repeatedLimitArg = args.find((arg) => arg.startsWith("--detail-repeated-limit="));
const repeatedLimit = Math.max(1, Number.parseInt(repeatedLimitArg?.slice("--detail-repeated-limit=".length) ?? "20", 10) || 20);
const budgetArgs = {
  bytes: parseOptionalNumberArg("--max-bytes="),
  rules: parseOptionalNumberArg("--max-rules="),
  duplicateSelectorKeys: parseOptionalNumberArg("--max-duplicate-selector-keys="),
  exactDuplicateRuleKeys: parseOptionalNumberArg("--max-exact-duplicate-rule-keys="),
  repeatedDeclarationGroups: parseOptionalNumberArg("--max-repeated-declaration-groups="),
  crossFileOverlaps: parseOptionalNumberArg("--max-cross-file-overlaps="),
  srcStyleOverlaps: parseOptionalNumberArg("--max-src-style-overlaps="),
  crossFileShadowedRules: parseOptionalNumberArg("--max-cross-file-shadowed-rules="),
};
const pruneSelectors = args
  .filter((arg) => arg.startsWith("--prune-selector="))
  .map((arg) => arg.slice("--prune-selector=".length))
  .filter(Boolean);
const explicitFiles = args.filter((arg) => !arg.startsWith("--"));

function parseOptionalNumberArg(prefix) {
  const value = args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function cssImportTargets(file) {
  const css = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const imports = [];
  const importPattern = /@import\s+(?:url\(\s*)?(?:"([^"]+\.css)"|'([^']+\.css)')\s*\)?[^;]*;/g;
  for (const match of css.matchAll(importPattern)) {
    const target = match[1] ?? match[2];
    if (!target || !target.startsWith(".")) {
      continue;
    }
    imports.push(path.resolve(path.dirname(file), target));
  }
  return imports;
}

function collectCssDependencyGraph(file, ordered, seen) {
  const resolved = path.resolve(file);
  if (seen.has(resolved) || !fs.existsSync(resolved)) {
    return;
  }

  seen.add(resolved);
  ordered.push(resolved);
  for (const imported of cssImportTargets(resolved)) {
    collectCssDependencyGraph(imported, ordered, seen);
  }
}

function resolveLocalImport(fromFile, target) {
  if (!target.startsWith(".")) {
    return undefined;
  }

  const base = path.resolve(path.dirname(fromFile), target);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.css`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function collectScriptCssDependencies(file, ordered, seenCss, seenScripts) {
  const resolved = path.resolve(file);
  if (seenScripts.has(resolved) || !fs.existsSync(resolved)) {
    return;
  }

  seenScripts.add(resolved);
  const source = fs.readFileSync(resolved, "utf8");
  const importPattern = /import\s+(?:[^'";]+?\s+from\s+)?["']([^"']+)["'];/g;
  for (const match of source.matchAll(importPattern)) {
    const target = resolveLocalImport(resolved, match[1]);
    if (!target) {
      continue;
    }
    if (target.endsWith(".css")) {
      collectCssDependencyGraph(target, ordered, seenCss);
      continue;
    }
    if (/\.(?:tsx?|mjs|js)$/.test(target)) {
      collectScriptCssDependencies(target, ordered, seenCss, seenScripts);
    }
  }
}

function defaultCssFiles() {
  const discovered = [path.join(repoRoot, "src", "style.css")];
  const stylesDir = path.join(repoRoot, "src", "styles");
  if (fs.existsSync(stylesDir)) {
    for (const entry of fs.readdirSync(stylesDir).sort()) {
      if (entry.endsWith(".css")) {
        discovered.push(path.join(stylesDir, entry));
      }
    }
  }

  const mainPath = path.join(repoRoot, "src", "main.ts");
  const ordered = [];
  const seen = new Set();
  if (fs.existsSync(mainPath)) {
    collectScriptCssDependencies(mainPath, ordered, seen, new Set());
  }
  for (const file of discovered) {
    collectCssDependencyGraph(file, ordered, seen);
  }
  return ordered;
}

const files = (explicitFiles.length ? explicitFiles.map((file) => path.resolve(repoRoot, file)) : defaultCssFiles()).filter((file) =>
  fs.existsSync(file),
);

function cleanPrelude(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDeclarations(input) {
  return input
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .sort()
    .join(";");
}

function declarationEntries(input) {
  return input
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const colon = declaration.indexOf(":");
      if (colon <= 0) {
        return undefined;
      }
      const property = declaration.slice(0, colon).trim().toLowerCase();
      const value = declaration.slice(colon + 1).trim();
      if (!property || !value) {
        return undefined;
      }
      return { property, value, important: /!important\s*$/i.test(value) };
    })
    .filter(Boolean);
}

function matchingClose(css, openIndex) {
  let depth = 1;
  for (let index = openIndex + 1; index < css.length; index += 1) {
    if (css[index] === "{") {
      depth += 1;
    } else if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function lineOf(css, index) {
  return css.slice(0, index).split(/\r?\n/).length;
}

function parseLeafRules(css) {
  const rules = [];

  function parseBlock(start, end, context) {
    let position = start;
    while (position < end) {
      const open = css.indexOf("{", position);
      if (open < 0 || open >= end) {
        break;
      }
      const previousClose = css.lastIndexOf("}", open - 1);
      const preludeStart = Math.max(position, previousClose + 1);
      const rawPrelude = css.slice(preludeStart, open);
      const prelude = cleanPrelude(rawPrelude);
      const close = matchingClose(css, open);
      if (close < 0 || close > end) {
        break;
      }

      const body = css.slice(open + 1, close);
      if (prelude.startsWith("@")) {
        parseBlock(open + 1, close, context.concat(prelude));
      } else if (prelude && !body.includes("{")) {
        const rawDeclarations = css.slice(open + 1, close);
        const declarations = normalizeDeclarations(body);
        if (declarations) {
          rules.push({
            selector: prelude,
            declarations,
            entries: declarationEntries(rawDeclarations),
            context: context.join(" | "),
            start: preludeStart,
            open,
            end: close + 1,
            line: lineOf(css, preludeStart),
          });
        }
      } else {
        parseBlock(open + 1, close, context);
      }
      position = close + 1;
    }
  }

  parseBlock(0, css.length, []);
  return rules;
}

function splitSelectorList(selector) {
  const parts = [];
  let current = "";
  let parenDepth = 0;
  let bracketDepth = 0;
  let quote = "";
  let escaped = false;

  for (const char of selector) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "\"" || char === "'") {
      current += char;
      quote = char;
      continue;
    }
    if (char === "(") {
      parenDepth += 1;
    } else if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
    } else if (char === "[") {
      bracketDepth += 1;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    }

    if (char === "," && parenDepth === 0 && bracketDepth === 0) {
      const trimmed = current.trim();
      if (trimmed) {
        parts.push(trimmed);
      }
      current = "";
      continue;
    }
    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) {
    parts.push(trimmed);
  }
  return parts;
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function selectorMatchesPruneTarget(selector, target) {
  return new RegExp(`${escapeRegExp(target)}(?![-_a-zA-Z0-9])`).test(selector);
}

function applyEdits(css, edits) {
  const sorted = edits.slice().sort((a, b) => b.start - a.start);
  let output = css;
  for (const edit of sorted) {
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  }
  return output;
}

function pruneUnusedSelectors(css, targets) {
  const edits = [];
  let prunedSelectors = 0;
  let removedRules = 0;

  for (const rule of parseLeafRules(css)) {
    const selectors = splitSelectorList(rule.selector);
    if (!selectors.length) {
      continue;
    }

    const kept = selectors.filter((selector) => !targets.some((target) => selectorMatchesPruneTarget(selector, target)));
    if (kept.length === selectors.length) {
      continue;
    }

    prunedSelectors += selectors.length - kept.length;
    if (!kept.length) {
      removedRules += 1;
      edits.push({ start: rule.start, end: rule.end, text: "" });
      continue;
    }

    const originalPrelude = css.slice(rule.start, rule.open);
    const leadingWhitespace = originalPrelude.match(/^\s*/)?.[0] ?? "";
    const lineIndent = originalPrelude.match(/\n([ \t]*)[^\n]*$/)?.[1] ?? "";
    edits.push({
      start: rule.start,
      end: rule.open,
      text: `${leadingWhitespace}${kept.join(`,\n${lineIndent}`)} `,
    });
  }

  return {
    css: applyEdits(css, edits),
    prunedSelectors,
    removedRules,
  };
}

function summarize(file) {
  const css = fs.readFileSync(file, "utf8");
  return summarizeFromCss(css);
}

function summarizeFromCss(css) {
  const rules = parseLeafRules(css);
  const selectors = new Map();
  const exact = new Map();
  const declarationGroups = new Map();

  for (const rule of rules) {
    const selectorKey = rule.context ? `${rule.context} || ${rule.selector}` : rule.selector;
    const exactKey = `${selectorKey} || ${rule.declarations}`;
    selectors.set(selectorKey, [...(selectors.get(selectorKey) ?? []), rule]);
    exact.set(exactKey, [...(exact.get(exactKey) ?? []), rule]);
    declarationGroups.set(rule.declarations, [...(declarationGroups.get(rule.declarations) ?? []), rule]);
  }

  const exactRemovals = [];
  for (const group of exact.values()) {
    if (group.length > 1) {
      exactRemovals.push(...group.slice(0, -1));
    }
  }

  return {
    css,
    rules,
    selectors,
    exact,
    declarationGroups,
    exactRemovals,
    metrics: {
      bytes: css.length,
      rules: rules.length,
      uniqueSelectors: selectors.size,
      duplicateSelectorKeys: [...selectors.values()].filter((group) => group.length > 1).length,
      duplicateSelectorInstances: [...selectors.values()].filter((group) => group.length > 1).reduce((sum, group) => sum + group.length, 0),
      exactDuplicateRuleKeys: [...exact.values()].filter((group) => group.length > 1).length,
      exactDuplicateRuleInstances: [...exact.values()].filter((group) => group.length > 1).reduce((sum, group) => sum + group.length, 0),
      repeatedDeclarationKeys: [...declarationGroups.values()].filter((group) => group.length > 1).length,
    },
  };
}

function removeRanges(css, ranges) {
  const sorted = ranges.slice().sort((a, b) => b.start - a.start);
  let output = css;
  for (const range of sorted) {
    output = output.slice(0, range.start) + output.slice(range.end);
  }
  return output;
}

function findShadowedSameSelectorRules(summary) {
  const removals = [];

  for (const group of summary.selectors.values()) {
    if (group.length < 2) {
      continue;
    }

    const laterProperties = new Map();
    for (let index = group.length - 1; index >= 0; index -= 1) {
      const rule = group[index];
      const entries = rule.entries ?? [];
      if (!entries.length) {
        continue;
      }

      const fullyShadowed = entries.every((entry) => {
        const later = laterProperties.get(entry.property);
        if (!later) {
          return false;
        }
        return entry.important ? later.important : true;
      });

      if (fullyShadowed) {
        removals.push(rule);
        continue;
      }

      for (const entry of entries) {
        if (!laterProperties.has(entry.property) || entry.important) {
          laterProperties.set(entry.property, entry);
        }
      }
    }
  }

  return removals;
}

function findCrossFileShadowedLegacyStyleRules(summaryMap, orderedFiles) {
  const legacyStyleFile = path.join(repoRoot, "src", "style.css");
  const legacySummary = summaryMap.get(legacyStyleFile);
  if (!legacySummary) {
    return [];
  }

  const fileIndex = new Map(orderedFiles.map((file, index) => [file, index]));
  const legacyIndex = fileIndex.get(legacyStyleFile) ?? 0;
  const laterRulesBySelector = new Map();

  for (const [file, summary] of summaryMap) {
    const index = fileIndex.get(file);
    if (index === undefined || index <= legacyIndex) {
      continue;
    }

    for (const rule of summary.rules) {
      const selectorKey = selectorKeyForRule(rule);
      laterRulesBySelector.set(selectorKey, [...(laterRulesBySelector.get(selectorKey) ?? []), rule]);
    }
  }

  const removals = [];
  for (const rule of legacySummary.rules) {
    const entries = rule.entries ?? [];
    if (!entries.length) {
      continue;
    }

    const laterRules = laterRulesBySelector.get(selectorKeyForRule(rule));
    if (!laterRules?.length) {
      continue;
    }

    const laterProperties = new Map();
    for (const laterRule of laterRules) {
      for (const entry of laterRule.entries ?? []) {
        laterProperties.set(entry.property, entry);
      }
    }

    const fullyShadowed = entries.every((entry) => {
      const later = laterProperties.get(entry.property);
      if (!later) {
        return false;
      }
      return entry.important ? later.important : true;
    });

    if (fullyShadowed) {
      removals.push(rule);
    }
  }

  return removals;
}

function findCrossFileShadowedRules(summaryMap, orderedFiles) {
  const removalsByFile = new Map();

  for (let fileIndex = 0; fileIndex < orderedFiles.length; fileIndex += 1) {
    const file = orderedFiles[fileIndex];
    const summary = summaryMap.get(file);
    if (!summary) {
      continue;
    }

    for (const rule of summary.rules) {
      const entries = rule.entries ?? [];
      if (!entries.length) {
        continue;
      }

      const selectorKey = selectorKeyForRule(rule);
      const laterProperties = new Map();
      for (const laterFile of orderedFiles.slice(fileIndex + 1)) {
        const laterSummary = summaryMap.get(laterFile);
        if (!laterSummary) {
          continue;
        }
        for (const laterRule of laterSummary.rules) {
          if (selectorKeyForRule(laterRule) !== selectorKey) {
            continue;
          }
          for (const entry of laterRule.entries ?? []) {
            if (!laterProperties.has(entry.property) || entry.important) {
              laterProperties.set(entry.property, entry);
            }
          }
        }
      }

      const fullyShadowed = entries.every((entry) => {
        const later = laterProperties.get(entry.property);
        if (!later) {
          return false;
        }
        return entry.important ? later.important : true;
      });

      if (fullyShadowed) {
        removalsByFile.set(file, [...(removalsByFile.get(file) ?? []), rule]);
      }
    }
  }

  return removalsByFile;
}

function removeEmptyAtRules(css) {
  const edits = [];
  let removed = 0;

  let position = 0;
  while (position < css.length) {
    const open = css.indexOf("{", position);
    if (open < 0) {
      break;
    }

    const previousClose = css.lastIndexOf("}", open - 1);
    const preludeStart = Math.max(position, previousClose + 1);
    const prelude = cleanPrelude(css.slice(preludeStart, open));
    const close = matchingClose(css, open);
    if (close < 0) {
      break;
    }

    if (prelude.startsWith("@") && !css.slice(open + 1, close).trim()) {
      edits.push({ start: preludeStart, end: close + 1, text: "" });
      removed += 1;
    }

    position = close + 1;
  }

  return { css: applyEdits(css, edits), removed };
}

function detectLineEnding(input) {
  return input.includes("\r\n") ? "\r\n" : "\n";
}

function normalizeLineEndings(input, lineEnding) {
  return lineEnding === "\r\n" ? input.replace(/\r?\n/g, "\r\n") : input.replace(/\r\n/g, "\n");
}

const summaries = new Map();
for (const file of files) {
  summaries.set(file, summarize(file));
}

if (shouldFix || shouldFixShadowed || shouldFixEmptyAtRules || pruneSelectors.length) {
  for (const [file, summary] of summaries) {
    let nextCss = summary.css;
    let removedExact = 0;
    let removedShadowed = 0;
    let removedEmptyAtRules = 0;
    let pruned = { prunedSelectors: 0, removedRules: 0 };

    if (shouldFix && summary.exactRemovals.length) {
      nextCss = removeRanges(nextCss, summary.exactRemovals);
      removedExact = summary.exactRemovals.length;
    }

    if (shouldFixShadowed) {
      const shadowedRemovals = findShadowedSameSelectorRules(summarizeFromCss(nextCss));
      if (shadowedRemovals.length) {
        nextCss = removeRanges(nextCss, shadowedRemovals);
        removedShadowed = shadowedRemovals.length;
      }
    }

    if (pruneSelectors.length) {
      pruned = pruneUnusedSelectors(nextCss, pruneSelectors);
      nextCss = pruned.css;
    }

    if (shouldFixEmptyAtRules) {
      const emptyAtRuleResult = removeEmptyAtRules(nextCss);
      nextCss = emptyAtRuleResult.css;
      removedEmptyAtRules = emptyAtRuleResult.removed;
    }

    if (nextCss === summary.css) {
      continue;
    }
    fs.writeFileSync(file, normalizeLineEndings(nextCss, detectLineEnding(summary.css)));
    const rel = path.relative(repoRoot, file);
    const messages = [];
    if (removedExact) {
      messages.push(`removed ${removedExact} exact duplicate rules`);
    }
    if (removedShadowed) {
      messages.push(`removed ${removedShadowed} fully shadowed same-selector rules`);
    }
    if (removedEmptyAtRules) {
      messages.push(`removed ${removedEmptyAtRules} empty at-rules`);
    }
    if (pruned.prunedSelectors) {
      messages.push(`pruned ${pruned.prunedSelectors} unused selectors`);
    }
    if (pruned.removedRules) {
      messages.push(`removed ${pruned.removedRules} unused rules`);
    }
    console.log(`${rel}: ${messages.join(", ")}`);
  }
}

if (shouldFixLegacyStyleShadowed) {
  const current = new Map(files.map((file) => [file, summarize(file)]));
  const removals = findCrossFileShadowedLegacyStyleRules(current, files);
  const legacyStyleFile = path.join(repoRoot, "src", "style.css");
  const legacySummary = current.get(legacyStyleFile);
  if (removals.length && legacySummary) {
    const nextCss = removeRanges(legacySummary.css, removals);
    fs.writeFileSync(legacyStyleFile, normalizeLineEndings(nextCss, detectLineEnding(legacySummary.css)));
    console.log(`${fileSummaryLabel(legacyStyleFile)}: removed ${removals.length} legacy cross-file shadowed rules`);
  }
}

if (shouldFixCrossFileShadowed) {
  const current = new Map(files.map((file) => [file, summarize(file)]));
  const removalsByFile = findCrossFileShadowedRules(current, files);
  for (const [file, removals] of removalsByFile) {
    if (!removals.length) {
      continue;
    }
    const summary = current.get(file);
    if (!summary) {
      continue;
    }
    const nextCss = removeRanges(summary.css, removals);
    fs.writeFileSync(file, normalizeLineEndings(nextCss, detectLineEnding(summary.css)));
    console.log(`${fileSummaryLabel(file)}: removed ${removals.length} cross-file fully shadowed rules`);
  }
}

let total = {
  bytes: 0,
  rules: 0,
  uniqueSelectors: 0,
  duplicateSelectorKeys: 0,
  duplicateSelectorInstances: 0,
  exactDuplicateRuleKeys: 0,
  exactDuplicateRuleInstances: 0,
  repeatedDeclarationKeys: 0,
};

const didMutateCss =
  shouldFix ||
  shouldFixShadowed ||
  shouldFixEmptyAtRules ||
  shouldFixLegacyStyleShadowed ||
  shouldFixCrossFileShadowed ||
  pruneSelectors.length;

const currentSummaries = didMutateCss ? new Map(files.map((file) => [file, summarize(file)])) : summaries;

function selectorKeyForRule(rule) {
  return rule.context ? `${rule.context} || ${rule.selector}` : rule.selector;
}

function fileSummaryLabel(file) {
  return path.relative(repoRoot, file);
}

function collectCrossFileOverlaps(summaryMap) {
  const selectorFiles = new Map();

  for (const [file, summary] of summaryMap) {
    for (const rule of summary.rules) {
      const selectorKey = selectorKeyForRule(rule);
      let filesForSelector = selectorFiles.get(selectorKey);
      if (!filesForSelector) {
        filesForSelector = new Map();
        selectorFiles.set(selectorKey, filesForSelector);
      }
      filesForSelector.set(file, [...(filesForSelector.get(file) ?? []), rule.line]);
    }
  }

  const groups = [...selectorFiles.entries()].filter(([, fileMap]) => fileMap.size > 1);
  const legacyStyleFile = path.join(repoRoot, "src", "style.css");
  const legacyGroups = groups.filter(([, fileMap]) => fileMap.has(legacyStyleFile));
  const legacyModuleCounts = new Map();

  for (const [, fileMap] of legacyGroups) {
    for (const file of fileMap.keys()) {
      if (file === legacyStyleFile) {
        continue;
      }
      legacyModuleCounts.set(file, (legacyModuleCounts.get(file) ?? 0) + 1);
    }
  }

  return {
    groups,
    legacyGroups,
    legacyModuleCounts: [...legacyModuleCounts.entries()].sort((a, b) => b[1] - a[1]),
  };
}

function formatOverlapEntry(selector, fileMap) {
  const fileList = [...fileMap.entries()]
    .map(([file, lines]) => `${fileSummaryLabel(file)}:${lines.slice(0, 3).join(",")}`)
    .join(" | ");
  return `  ${fileList} :: ${selector}`;
}

function collectRepeatedDeclarationDetails(summaryMap) {
  const groups = new Map();

  for (const [file, summary] of summaryMap) {
    for (const rule of summary.rules) {
      if (!rule.declarations) {
        continue;
      }
      groups.set(rule.declarations, [
        ...(groups.get(rule.declarations) ?? []),
        {
          file,
          line: rule.line,
          selector: rule.context ? `${rule.context} || ${rule.selector}` : rule.selector,
        },
      ]);
    }
  }

  return [...groups.entries()]
    .filter(([, rules]) => rules.length > 1)
    .sort((a, b) => b[1].length - a[1].length || b[0].length - a[0].length);
}

function truncateText(input, maxLength) {
  if (input.length <= maxLength) {
    return input;
  }
  return `${input.slice(0, Math.max(0, maxLength - 3))}...`;
}

for (const [file, summary] of currentSummaries) {
  const rel = path.relative(repoRoot, file);
  console.log(`${rel}`);
  console.log(`  bytes ${summary.metrics.bytes}`);
  console.log(`  rules ${summary.metrics.rules}`);
  console.log(`  duplicate selectors ${summary.metrics.duplicateSelectorKeys} keys / ${summary.metrics.duplicateSelectorInstances} instances`);
  console.log(`  exact duplicate rules ${summary.metrics.exactDuplicateRuleKeys} keys / ${summary.metrics.exactDuplicateRuleInstances} instances`);

  for (const key of Object.keys(total)) {
    total[key] += summary.metrics[key];
  }
}

console.log("total");
console.log(`  bytes ${total.bytes}`);
console.log(`  rules ${total.rules}`);
console.log(`  duplicate selectors ${total.duplicateSelectorKeys} keys / ${total.duplicateSelectorInstances} instances`);
console.log(`  exact duplicate rules ${total.exactDuplicateRuleKeys} keys / ${total.exactDuplicateRuleInstances} instances`);
console.log(`  repeated declaration groups ${total.repeatedDeclarationKeys}`);

const crossFileOverlaps = collectCrossFileOverlaps(currentSummaries);
const legacyShadowedRuleCount = findCrossFileShadowedLegacyStyleRules(currentSummaries, files).length;
const crossFileShadowedRuleCount = [...findCrossFileShadowedRules(currentSummaries, files).values()].reduce(
  (sum, removals) => sum + removals.length,
  0,
);
console.log("cross-file overlap");
console.log(`  duplicate selectors across files ${crossFileOverlaps.groups.length}`);
console.log(`  selectors shared with src\\style.css ${crossFileOverlaps.legacyGroups.length}`);
console.log(`  legacy src\\style.css rules fully shadowed by later CSS imports ${legacyShadowedRuleCount}`);
console.log(`  cross-file rules fully shadowed by later CSS imports ${crossFileShadowedRuleCount}`);
for (const [file, count] of crossFileOverlaps.legacyModuleCounts.slice(0, 8)) {
  console.log(`  ${fileSummaryLabel(file)} ${count}`);
}

const budgetFailures = [];
function checkBudget(label, value, limit) {
  if (limit === undefined) {
    return;
  }
  console.log(`budget ${label} ${value}/${limit}`);
  if (value > limit) {
    budgetFailures.push(`${label} ${value} > ${limit}`);
  }
}

checkBudget("bytes", total.bytes, budgetArgs.bytes);
checkBudget("rules", total.rules, budgetArgs.rules);
checkBudget("duplicate selector keys", total.duplicateSelectorKeys, budgetArgs.duplicateSelectorKeys);
checkBudget("exact duplicate rule keys", total.exactDuplicateRuleKeys, budgetArgs.exactDuplicateRuleKeys);
checkBudget("repeated declaration groups", total.repeatedDeclarationKeys, budgetArgs.repeatedDeclarationGroups);
checkBudget("cross-file overlaps", crossFileOverlaps.groups.length, budgetArgs.crossFileOverlaps);
checkBudget("src style overlaps", crossFileOverlaps.legacyGroups.length, budgetArgs.srcStyleOverlaps);
checkBudget("cross-file shadowed rules", crossFileShadowedRuleCount, budgetArgs.crossFileShadowedRules);

if (budgetFailures.length) {
  console.error("CSS budget failed");
  for (const failure of budgetFailures) {
    console.error(`  ${failure}`);
  }
  process.exitCode = 1;
}

if (shouldPrintOverlapDetails) {
  console.log(`cross-file overlap details first ${Math.min(detailLimit, crossFileOverlaps.groups.length)} of ${crossFileOverlaps.groups.length}`);
  for (const [selector, fileMap] of crossFileOverlaps.groups.slice(0, detailLimit)) {
    console.log(formatOverlapEntry(selector, fileMap));
  }

  if (crossFileOverlaps.legacyGroups.length) {
    console.log(`src\\style.css overlap details first ${Math.min(detailLimit, crossFileOverlaps.legacyGroups.length)} of ${crossFileOverlaps.legacyGroups.length}`);
    for (const [selector, fileMap] of crossFileOverlaps.legacyGroups.slice(0, detailLimit)) {
      console.log(formatOverlapEntry(selector, fileMap));
    }
  }
}

if (shouldPrintRepeatedDetails) {
  const repeatedDetails = collectRepeatedDeclarationDetails(currentSummaries);
  console.log(`repeated declaration details first ${Math.min(repeatedLimit, repeatedDetails.length)} of ${repeatedDetails.length}`);
  for (const [declarations, rules] of repeatedDetails.slice(0, repeatedLimit)) {
    console.log(`  ${rules.length}x :: ${truncateText(declarations, 180)}`);
    for (const rule of rules.slice(0, 5)) {
      console.log(`    ${fileSummaryLabel(rule.file)}:${rule.line} :: ${truncateText(rule.selector, 160)}`);
    }
  }
}
