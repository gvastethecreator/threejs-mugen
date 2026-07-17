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

export type SourceWritePreimage = {
  path: string;
  bytes: Uint8Array;
  digest: string;
  byteLength: number;
};

export type SourceWriteCompensation = {
  status: "not-needed" | "restored" | "restore-failed";
  preimageDigest?: string;
  preimageByteLength?: number;
  restoredDigest?: string;
  restoredByteLength?: number;
  diagnostics: string[];
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
    readonly code: "unsupported" | "permission-denied" | "missing" | "read-failed" | "conflict" | "write-failed",
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
  return writeSourceHandleData(handle, sourcePath, text);
}

export async function captureSourceWritePreimage(
  handle: SourceHandleLike,
  sourcePath: string,
): Promise<SourceWritePreimage> {
  const observed = await readSourceHandleBytes(handle, sourcePath);
  return {
    path: sourcePath,
    bytes: observed.bytes,
    digest: observed.digest,
    byteLength: observed.byteLength,
  };
}

export async function readSourceHandleBytes(
  handle: SourceHandleLike,
  sourcePath: string,
): Promise<{ path: string; bytes: Uint8Array; digest: string; byteLength: number }> {
  const fileHandle = await resolveSourceFileHandle(handle, sourcePath);
  if (typeof fileHandle.getFile !== "function") {
    throw new SourceHandleWriteError("unsupported", "The source file handle cannot read file bytes.");
  }
  let file: File;
  try {
    file = await fileHandle.getFile();
  } catch (error) {
    throw new SourceHandleWriteError(classifyWriteError(error), `Could not read source file '${sourcePath}'.`, { cause: error });
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    throw new SourceHandleWriteError("read-failed", `Could not read bytes from source file '${sourcePath}'.`, { cause: error });
  }
  return {
    path: sourcePath,
    bytes,
    digest: await sha256SourceBytes(bytes),
    byteLength: bytes.byteLength,
  };
}

export async function restoreSourceWritePreimage(
  handle: SourceHandleLike,
  preimage: SourceWritePreimage,
): Promise<SourceWriteCompensation> {
  const base = {
    preimageDigest: preimage.digest,
    preimageByteLength: preimage.byteLength,
  };
  try {
    await writeSourceHandleBytes(handle, preimage.path, preimage.bytes);
    const restored = await readSourceHandleBytes(handle, preimage.path);
    const byteEquivalent = bytesEqual(preimage.bytes, restored.bytes);
    if (!byteEquivalent || restored.digest.toLowerCase() !== preimage.digest.toLowerCase() || restored.byteLength !== preimage.byteLength) {
      return {
        ...base,
        status: "restore-failed",
        restoredDigest: restored.digest,
        restoredByteLength: restored.byteLength,
        diagnostics: ["Restored source bytes do not match the retained preimage."],
      };
    }
    return {
      ...base,
      status: "restored",
      restoredDigest: restored.digest,
      restoredByteLength: restored.byteLength,
      diagnostics: [],
    };
  } catch (error) {
    return {
      ...base,
      status: "restore-failed",
      diagnostics: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export async function sha256SourceBytes(
  bytes: Uint8Array,
  digestApi: Pick<SubtleCrypto, "digest"> | undefined = globalThis.crypto?.subtle,
): Promise<string> {
  if (!digestApi) {
    throw new SourceHandleWriteError("unsupported", "Web Crypto SHA-256 is unavailable for source compensation.");
  }
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await digestApi.digest("SHA-256", copy);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function writeSourceHandleBytes(
  handle: SourceHandleLike,
  sourcePath: string,
  bytes: Uint8Array,
): Promise<{ path: string; byteLength: number }> {
  return writeSourceHandleData(handle, sourcePath, bytes);
}

async function writeSourceHandleData(
  handle: SourceHandleLike,
  sourcePath: string,
  data: string | Uint8Array,
): Promise<{ path: string; byteLength: number }> {
  if (handle.kind !== "directory") {
    throw new SourceHandleWriteError("unsupported", "Only directory source handles can write source files.");
  }
  const fileHandle = await resolveSourceFileHandle(handle, sourcePath);
  if (typeof fileHandle.createWritable !== "function") {
    throw new SourceHandleWriteError("unsupported", "The source file handle cannot create a writable stream.");
  }
  let writable: Awaited<ReturnType<NonNullable<SourceHandleLike["createWritable"]>>> | undefined;
  let closed = false;
  try {
    writable = await fileHandle.createWritable({ keepExistingData: false, mode: "exclusive" });
    await writable.write(data);
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
  return { path: sourcePath, byteLength: typeof data === "string" ? new TextEncoder().encode(data).byteLength : data.byteLength };
}

async function resolveSourceFileHandle(handle: SourceHandleLike, sourcePath: string): Promise<SourceHandleLike> {
  if (handle.kind !== "directory") {
    throw new SourceHandleWriteError("unsupported", "Only directory source handles can resolve source files.");
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
  try {
    return await directory.getFileHandle(fileName, { create: false });
  } catch (error) {
    throw new SourceHandleWriteError(classifyWriteError(error), `Could not open source file '${sourcePath}'.`, { cause: error });
  }
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

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}
