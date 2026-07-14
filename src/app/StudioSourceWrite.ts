import type { GameProjectSourcePackage } from "./StudioModel";
import type { SourceHandleLike, SourceHandleRecord } from "./StudioSourceHandle";
import type { SourceTransactionRecord } from "./StudioSourceTransaction";

export type SourceWritePlanStatus = "ready" | "blocked";
export type SourceWriteBlockReason =
  | "zip-source"
  | "missing-source"
  | "identity-unknown"
  | "identity-changed"
  | "project-conflict"
  | "permission-denied"
  | "missing-handle"
  | "unsupported-handle"
  | "unsafe-path";

export type SourceWritePlan = {
  status: SourceWritePlanStatus;
  sourcePackageId: string;
  path: string;
  detail: string;
  reason?: SourceWriteBlockReason;
};

export type SourceWritePlanInput = {
  sourcePackage: GameProjectSourcePackage;
  sourceTransaction: SourceTransactionRecord | undefined;
  sourceHandle: SourceHandleRecord | undefined;
  handle: SourceHandleLike | undefined;
  path: string;
};

export class SourceHandleWriteError extends Error {
  constructor(
    readonly code: "unsupported" | "permission-denied" | "missing" | "conflict" | "write-failed",
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SourceHandleWriteError";
  }
}

export function createSourceWritePlan(input: SourceWritePlanInput): SourceWritePlan {
  const base = { sourcePackageId: input.sourcePackage.id, path: input.path };
  if (input.sourcePackage.kind !== "folder") {
    return { ...base, status: "blocked", reason: "zip-source", detail: "ZIP source packages are read-only until archive rewrite is implemented." };
  }
  if (input.sourcePackage.status !== "linked") {
    return { ...base, status: "blocked", reason: "missing-source", detail: "Relink the folder before editing source files." };
  }
  if (input.sourcePackage.identityStatus === "changed") {
    return { ...base, status: "blocked", reason: "identity-changed", detail: "Source identity changed; reimport the folder before editing source files." };
  }
  if (input.sourcePackage.identityStatus !== "matched") {
    return { ...base, status: "blocked", reason: "identity-unknown", detail: "A matched source fingerprint is required before editing source files." };
  }
  if (input.sourceTransaction?.state === "conflict" || input.sourceTransaction?.revisionStatus === "changed") {
    return { ...base, status: "blocked", reason: "project-conflict", detail: "Resolve the project revision conflict before editing source files." };
  }
  if (!input.sourceHandle || !input.handle) {
    return { ...base, status: "blocked", reason: "missing-handle", detail: "Remember the source folder before editing source files." };
  }
  if (input.sourceHandle.permission !== "granted" || input.sourceHandle.state !== "granted") {
    return { ...base, status: "blocked", reason: "permission-denied", detail: "Grant read/write permission to the remembered source folder." };
  }
  if (input.handle.kind !== "directory" || input.sourceHandle.handleKind !== "directory") {
    return { ...base, status: "blocked", reason: "unsupported-handle", detail: "A writable directory handle is required for source editing." };
  }
  if (!isSafeSourceWritePath(input.path)) {
    return { ...base, status: "blocked", reason: "unsafe-path", detail: "Source paths must stay inside the remembered folder." };
  }
  if (typeof input.handle.getDirectoryHandle !== "function" || typeof input.handle.getFileHandle !== "function") {
    return { ...base, status: "blocked", reason: "unsupported-handle", detail: "This browser handle cannot resolve writable source paths." };
  }
  return { ...base, status: "ready", detail: "Folder source is writable with an exclusive transactional stream." };
}

export async function writeSourceHandleText(
  handle: SourceHandleLike,
  sourcePath: string,
  text: string,
): Promise<{ path: string; byteLength: number }> {
  if (handle.kind !== "directory") {
    throw new SourceHandleWriteError("unsupported", "Only directory source handles can write source files.");
  }
  const segments = sourceWritePathSegments(handle.name, sourcePath);
  let directory = handle;
  for (const segment of segments.slice(0, -1)) {
    if (typeof directory.getDirectoryHandle !== "function") {
      throw new SourceHandleWriteError("unsupported", "The source folder cannot resolve nested directories.");
    }
    try {
      directory = await directory.getDirectoryHandle(segment, { create: false });
    } catch (error) {
      throw new SourceHandleWriteError(classifyWriteError(error), `Could not open source directory '${segment}'.`, { cause: error });
    }
  }
  const fileName = segments.at(-1);
  if (!fileName || typeof directory.getFileHandle !== "function") {
    throw new SourceHandleWriteError("unsupported", "The source folder cannot resolve the target file.");
  }
  let fileHandle: SourceHandleLike;
  try {
    fileHandle = await directory.getFileHandle(fileName, { create: false });
  } catch (error) {
    throw new SourceHandleWriteError(classifyWriteError(error), `Could not open source file '${sourcePath}'.`, { cause: error });
  }
  if (typeof fileHandle.createWritable !== "function") {
    throw new SourceHandleWriteError("unsupported", "The source file handle cannot create a writable stream.");
  }
  let writable: Awaited<ReturnType<NonNullable<SourceHandleLike["createWritable"]>>> | undefined;
  let closed = false;
  try {
    writable = await fileHandle.createWritable({ keepExistingData: false, mode: "exclusive" });
    await writable.write(text);
    await writable.close();
    closed = true;
  } catch (error) {
    if (writable && !closed && typeof writable.abort === "function") {
      try {
        await writable.abort();
      } catch {
        // Preserve the original write failure; the browser owns rollback of the staged stream.
      }
    }
    throw new SourceHandleWriteError(classifyWriteError(error), `Could not write source file '${sourcePath}'.`, { cause: error });
  }
  return { path: sourcePath, byteLength: new TextEncoder().encode(text).byteLength };
}

export function sourceWritePathSegments(rootName: string | undefined, sourcePath: string): string[] {
  const normalized = sourcePath.replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new SourceHandleWriteError("unsupported", "The source path is not safe to write.");
  }
  const segments = normalized.split("/");
  if (rootName && segments[0] === rootName) {
    segments.shift();
  }
  if (!segments.length || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\0"))) {
    throw new SourceHandleWriteError("unsupported", "The source path is not safe to write.");
  }
  return segments;
}

function isSafeSourceWritePath(path: string): boolean {
  try {
    sourceWritePathSegments(undefined, path);
    return true;
  } catch {
    return false;
  }
}

function classifyWriteError(error: unknown): SourceHandleWriteError["code"] {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "SecurityError") return "permission-denied";
  if (name === "NotFoundError" || name === "InvalidStateError") return "missing";
  if (name === "NoModificationAllowedError") return "conflict";
  return "write-failed";
}

function errorName(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
    ? error.name
    : undefined;
}
