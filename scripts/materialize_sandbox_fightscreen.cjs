const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { pathToFileURL } = require("node:url");

async function main() {
  const repoRoot = path.resolve(process.cwd());
  // Dynamic import of TS is not available; re-run via node after build is heavy.
  // Instead shell out is avoided: write by requiring the vitest-free duplication
  // is bad. Use pnpm exec tsx/node --experimental if available.
  // Prefer spawning vitest-free path: compile with node --import tsx when present.
  let materialize;
  let hashFiles;
  let manifest;
  try {
    const mod = await import(pathToFileURL(path.join(repoRoot, "src/mugen/runtime/FightScreenFixture.ts")).href);
    materialize = mod.materializeSandboxFightScreenFolder;
    hashFiles = mod.hashSandboxFightScreenFiles;
    manifest = mod.SANDBOX_FIGHTSCREEN_MANIFEST;
  } catch (error) {
    // Fallback: use pnpm exec vite-node / tsx
    const { spawnSync } = require("node:child_process");
    const runner = spawnSync(
      "pnpm",
      ["exec", "tsx", "-e", `
        import { materializeSandboxFightScreenFolder, hashSandboxFightScreenFiles, SANDBOX_FIGHTSCREEN_MANIFEST, createSandboxFightScreenZipBytes } from "./src/mugen/runtime/FightScreenFixture.ts";
        import { writeFileSync, mkdirSync } from "node:fs";
        import { resolve } from "node:path";
        const root = resolve("public");
        const written = await materializeSandboxFightScreenFolder(root);
        const hashes = hashSandboxFightScreenFiles();
        const zip = Buffer.from(await createSandboxFightScreenZipBytes());
        mkdirSync(resolve("public/system"), { recursive: true });
        writeFileSync(resolve("public/system/sandbox-fightscreen.zip"), zip);
        writeFileSync(resolve("public/system/sandbox-fightscreen.hashes.json"), JSON.stringify({ manifest: SANDBOX_FIGHTSCREEN_MANIFEST, hashes }, null, 2) + "\\n");
        console.log(JSON.stringify({ status: "passed", written, zipBytes: zip.length, hashes }, null, 2));
      `],
      { encoding: "utf8", cwd: repoRoot, shell: true },
    );
    if (runner.status !== 0) {
      process.stderr.write(runner.stderr || runner.stdout || "materialize failed\n");
      process.exitCode = 1;
      return;
    }
    process.stdout.write(runner.stdout);
    return;
  }

  const root = path.join(repoRoot, "public");
  const written = await materialize(root);
  const hashes = hashFiles();
  const { createSandboxFightScreenZipBytes } = await import(
    pathToFileURL(path.join(repoRoot, "src/mugen/runtime/FightScreenFixture.ts")).href
  );
  const zip = Buffer.from(await createSandboxFightScreenZipBytes());
  fs.mkdirSync(path.join(repoRoot, "public", "system"), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, "public", "system", "sandbox-fightscreen.zip"), zip);
  fs.writeFileSync(
    path.join(repoRoot, "public", "system", "sandbox-fightscreen.hashes.json"),
    `${JSON.stringify({ manifest, hashes }, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify({
    status: "passed",
    written,
    zipBytes: zip.length,
    hashes,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
