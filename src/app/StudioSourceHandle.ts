import type { GameProjectSourcePackage } from "./StudioModel";
import type { SourceTransactionPermission } from "./StudioSourceTransaction";

export const SOURCE_HANDLE_SCHEMA = "mugen-web-sandbox/source-handle/v0" as const;
export const SOURCE_HANDLE_DB_NAME = "mugen-web-sandbox-source-handles-v0";
export const SOURCE_HANDLE_OBJECT_STORE = "handles";

export type SourceHandleCapability = "available" | "unsupported";
export type SourceHandleStorage = "memory" | "indexeddb";
export type SourceHandleKind = "file" | "directory";
export type SourceHandleState = "not-linked" | "not-requested" | "granted" | "denied" | "revoked" | "missing" | "stale";
export type SourceHandleNextAction = "link-handle" | "request-permission" | "recover-source" | "relink-source" | "none";
export type SourceHandlePermission = SourceTransactionPermission;

export type SourceHandleRecord = {
  schemaVersion: typeof SOURCE_HANDLE_SCHEMA;
  id: string;
  sourcePackageId: string;
  sourceName: string;
  sourceKind: GameProjectSourcePackage["kind"];
  handleKind: SourceHandleKind;
  capability: SourceHandleCapability;
  storage: SourceHandleStorage;
  persisted: boolean;
  permission: SourceHandlePermission;
  state: SourceHandleState;
  fileCount: number;
  expectedFingerprint?: string;
  observedFingerprint?: string;
  fingerprintAlgorithm?: GameProjectSourcePackage["fingerprintAlgorithm"];
  expectedByteLength?: number;
  observedByteLength?: number;
  canRead: boolean;
  nextAction: SourceHandleNextAction;
  warnings: string[];
  updatedAt: string;
};

export type SourceHandleReadInput = {
  sourcePackage: GameProjectSourcePackage;
  capability: SourceHandleCapability;
  storage: SourceHandleStorage;
  permission: SourceHandlePermission;
  handleLinked: boolean;
  persisted: boolean;
  sourceAvailable?: boolean;
  observedFingerprint?: string;
  observedByteLength?: number;
  handleKind?: SourceHandleKind;
  updatedAt?: string;
};

export function createSourceHandleRecord(input: SourceHandleReadInput): SourceHandleRecord {
  const { sourcePackage } = input;
  const observedFingerprint = input.observedFingerprint ?? sourcePackage.observedFingerprint;
  const observedByteLength = input.observedByteLength ?? sourcePackage.observedByteLength;
  const sourceAvailable = input.sourceAvailable ?? input.handleLinked;
  const fingerprintChanged = Boolean(
    sourcePackage.fingerprint &&
      observedFingerprint &&
      sourcePackage.fingerprint.toLowerCase() !== observedFingerprint.toLowerCase(),
  );
  const state = resolveSourceHandleState(input.permission, input.handleLinked, sourceAvailable, fingerprintChanged);
  const nextAction = resolveSourceHandleNextAction(
    input.capability,
    input.permission,
    sourcePackage.status,
    state,
    input.handleLinked,
  );
  const warnings = [
    ...(input.capability === "unsupported"
      ? ["This browser does not expose the File System Access API; use manual source relink."]
      : []),
    ...(input.storage === "memory" ? ["This source handle is retained for the current browser session only."] : []),
    ...(!input.handleLinked ? ["No persistent source handle is linked for this package."] : []),
    ...(input.permission === "not-requested" || input.permission === "prompt"
      ? ["Source handle read permission has not been granted."]
      : input.permission === "denied"
        ? ["Source handle read permission was denied."]
        : input.permission === "revoked"
          ? ["Source handle permission was revoked or the source is no longer available."]
          : []),
    ...(!sourceAvailable && input.handleLinked ? ["The persisted source handle no longer resolves to source bytes."] : []),
    ...(fingerprintChanged ? ["Source fingerprint changed; recover is blocked until the package is explicitly relinked."] : []),
  ];
  return {
    schemaVersion: SOURCE_HANDLE_SCHEMA,
    id: `source-handle:${sourcePackage.id}`,
    sourcePackageId: sourcePackage.id,
    sourceName: sourcePackage.name,
    sourceKind: sourcePackage.kind,
    handleKind: input.handleKind ?? (sourcePackage.kind === "folder" ? "directory" : "file"),
    capability: input.capability,
    storage: input.storage,
    persisted: input.persisted && input.storage === "indexeddb",
    permission: input.permission,
    state,
    fileCount: sourcePackage.fileCount,
    ...(sourcePackage.fingerprint ? { expectedFingerprint: sourcePackage.fingerprint } : {}),
    ...(observedFingerprint ? { observedFingerprint } : {}),
    ...(sourcePackage.fingerprintAlgorithm ? { fingerprintAlgorithm: sourcePackage.fingerprintAlgorithm } : {}),
    ...(sourcePackage.byteLength !== undefined ? { expectedByteLength: sourcePackage.byteLength } : {}),
    ...(observedByteLength !== undefined ? { observedByteLength } : {}),
    canRead: state === "granted" && input.permission === "granted" && sourceAvailable && !fingerprintChanged,
    nextAction,
    warnings: uniqueStrings(warnings),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

function resolveSourceHandleState(
  permission: SourceHandlePermission,
  handleLinked: boolean,
  sourceAvailable: boolean,
  fingerprintChanged: boolean,
): SourceHandleState {
  if (!handleLinked) return "not-linked";
  if (fingerprintChanged) return "stale";
  if (!sourceAvailable) return "missing";
  if (permission === "granted") return "granted";
  if (permission === "denied") return "denied";
  if (permission === "revoked") return "revoked";
  return "not-requested";
}

function resolveSourceHandleNextAction(
  capability: SourceHandleCapability,
  permission: SourceHandlePermission,
  sourcePackageStatus: GameProjectSourcePackage["status"],
  state: SourceHandleState,
  handleLinked: boolean,
): SourceHandleNextAction {
  if (!handleLinked) return capability === "available" ? "link-handle" : "relink-source";
  if (state === "stale" || state === "missing") return "relink-source";
  if (permission !== "granted") return capability === "available" ? "request-permission" : "relink-source";
  return sourcePackageStatus === "linked" ? "none" : "recover-source";
}

export type SourceHandleLike = {
  kind?: SourceHandleKind;
  name?: string;
  getFile?: () => Promise<File>;
  queryPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<string>;
  requestPermission?: (descriptor?: { mode?: "read" | "readwrite" }) => Promise<string>;
};

export type SourceHandleBrowserHost = {
  showOpenFilePicker?: (options?: {
    multiple?: boolean;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<SourceHandleLike[]>;
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<SourceHandleLike>;
  indexedDB?: IndexedDbFactoryLike;
};

export function detectSourceHandleCapability(host: SourceHandleBrowserHost): SourceHandleCapability {
  return typeof host.showOpenFilePicker === "function" || typeof host.showDirectoryPicker === "function"
    ? "available"
    : "unsupported";
}

export function detectSourceHandleStorage(host: SourceHandleBrowserHost): SourceHandleStorage {
  return host.indexedDB && typeof host.indexedDB.open === "function" ? "indexeddb" : "memory";
}

export async function pickSourceHandle(
  host: SourceHandleBrowserHost,
  kind: GameProjectSourcePackage["kind"],
): Promise<SourceHandleLike | undefined> {
  if (kind === "folder") {
    return host.showDirectoryPicker?.({ mode: "read" });
  }
  const handles = await host.showOpenFilePicker?.({
    multiple: false,
    types: [{ description: "MUGEN source ZIP", accept: { "application/zip": [".zip"] } }],
  });
  return handles?.[0];
}

export async function querySourceHandlePermission(handle: SourceHandleLike): Promise<SourceHandlePermission> {
  if (typeof handle.queryPermission !== "function") {
    return "not-requested";
  }
  try {
    return normalizePermission(await handle.queryPermission({ mode: "read" }));
  } catch (error) {
    return classifyPermissionError(error);
  }
}

export async function requestSourceHandlePermission(handle: SourceHandleLike): Promise<SourceHandlePermission> {
  const current = await querySourceHandlePermission(handle);
  if (current === "granted" || current === "denied" || current === "revoked") {
    return current;
  }
  if (typeof handle.requestPermission !== "function") {
    return current;
  }
  try {
    return normalizePermission(await handle.requestPermission({ mode: "read" }));
  } catch (error) {
    return classifyPermissionError(error);
  }
}

export class SourceHandleReadError extends Error {
  constructor(readonly code: "unsupported" | "permission-denied" | "missing" | "read-failed", message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SourceHandleReadError";
  }
}

export async function readSourceHandleFile(handle: SourceHandleLike): Promise<File> {
  if (typeof handle.getFile !== "function") {
    throw new SourceHandleReadError("unsupported", "The persisted source handle cannot read a file.");
  }
  try {
    const file = await handle.getFile();
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new SourceHandleReadError("read-failed", "The persisted source handle returned an invalid file.");
    }
    return file;
  } catch (error) {
    if (error instanceof SourceHandleReadError) {
      throw error;
    }
    const code = classifyReadError(error);
    throw new SourceHandleReadError(code, `Could not read the persisted source handle (${code}).`, { cause: error });
  }
}

export type SourceHandleStoreEntry = {
  record: SourceHandleRecord;
  handle?: SourceHandleLike;
};

export type SourceHandleStore = {
  list(): Promise<SourceHandleStoreEntry[]>;
  get(sourcePackageId: string): Promise<SourceHandleStoreEntry | undefined>;
  put(entry: SourceHandleStoreEntry): Promise<void>;
  delete(sourcePackageId: string): Promise<void>;
};

export function createMemorySourceHandleStore(): SourceHandleStore {
  const entries = new Map<string, SourceHandleStoreEntry>();
  return {
    async list() {
      return [...entries.values()].map(cloneStoreEntry);
    },
    async get(sourcePackageId) {
      const entry = entries.get(sourcePackageId);
      return entry ? cloneStoreEntry(entry) : undefined;
    },
    async put(entry) {
      entries.set(entry.record.sourcePackageId, cloneStoreEntry(entry));
    },
    async delete(sourcePackageId) {
      entries.delete(sourcePackageId);
    },
  };
}

export type IndexedDbFactoryLike = Pick<IDBFactory, "open">;

export function createIndexedDbSourceHandleStore(factory?: IndexedDbFactoryLike): SourceHandleStore | undefined {
  const candidate = factory ?? getGlobalIndexedDb();
  return candidate ? new IndexedDbSourceHandleStore(candidate) : undefined;
}

class IndexedDbSourceHandleStore implements SourceHandleStore {
  private database?: Promise<IDBDatabase>;

  constructor(private readonly factory: IndexedDbFactoryLike) {}

  async list(): Promise<SourceHandleStoreEntry[]> {
    const database = await this.open();
    const transaction = database.transaction(SOURCE_HANDLE_OBJECT_STORE, "readonly");
    const values = await requestToPromise<unknown[]>(transaction.objectStore(SOURCE_HANDLE_OBJECT_STORE).getAll());
    await transactionToPromise(transaction);
    return values.flatMap((value) => parseStoreEntry(value));
  }

  async get(sourcePackageId: string): Promise<SourceHandleStoreEntry | undefined> {
    const database = await this.open();
    const transaction = database.transaction(SOURCE_HANDLE_OBJECT_STORE, "readonly");
    const value = await requestToPromise<unknown>(transaction.objectStore(SOURCE_HANDLE_OBJECT_STORE).get(`source-handle:${sourcePackageId}`));
    await transactionToPromise(transaction);
    return value === undefined ? undefined : parseStoreEntry(value)[0];
  }

  async put(entry: SourceHandleStoreEntry): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(SOURCE_HANDLE_OBJECT_STORE, "readwrite");
    transaction.objectStore(SOURCE_HANDLE_OBJECT_STORE).put({
      id: entry.record.id,
      record: cloneRecord(entry.record),
      ...(entry.handle ? { handle: entry.handle } : {}),
    });
    await transactionToPromise(transaction);
  }

  async delete(sourcePackageId: string): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(SOURCE_HANDLE_OBJECT_STORE, "readwrite");
    transaction.objectStore(SOURCE_HANDLE_OBJECT_STORE).delete(`source-handle:${sourcePackageId}`);
    await transactionToPromise(transaction);
  }

  private open(): Promise<IDBDatabase> {
    if (!this.database) {
      this.database = new Promise<IDBDatabase>((resolve, reject) => {
        const request = this.factory.open(SOURCE_HANDLE_DB_NAME, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(SOURCE_HANDLE_OBJECT_STORE)) {
            database.createObjectStore(SOURCE_HANDLE_OBJECT_STORE, { keyPath: "id" });
          }
        };
        request.onblocked = () => reject(new Error("Source handle database upgrade is blocked by another browser context."));
        request.onerror = () => reject(request.error ?? new Error("Source handle database could not be opened."));
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => database.close();
          resolve(database);
        };
      }).catch((error) => {
        this.database = undefined;
        throw error;
      });
    }
    return this.database;
  }
}

function normalizePermission(value: string): SourceHandlePermission {
  return value === "granted" || value === "prompt" || value === "denied" ? value : "not-requested";
}

function classifyPermissionError(error: unknown): SourceHandlePermission {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "InvalidStateError") return "revoked";
  return "revoked";
}

function classifyReadError(error: unknown): SourceHandleReadError["code"] {
  const name = errorName(error);
  if (name === "NotAllowedError" || name === "SecurityError") return "permission-denied";
  if (name === "NotFoundError" || name === "InvalidStateError") return "missing";
  return "read-failed";
}

function errorName(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "name" in error && typeof error.name === "string"
    ? error.name
    : undefined;
}

function getGlobalIndexedDb(): IndexedDbFactoryLike | undefined {
  if (typeof globalThis === "undefined") return undefined;
  const host = globalThis as typeof globalThis & { indexedDB?: IndexedDbFactoryLike };
  return host.indexedDB;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
  });
}

function parseStoreEntry(value: unknown): SourceHandleStoreEntry[] {
  if (!isRecord(value)) return [];
  const record = parseRecord(value.record);
  if (!record) return [];
  const handle = isSourceHandleLike(value.handle) ? value.handle : undefined;
  return [{ record, ...(handle ? { handle } : {}) }];
}

function parseRecord(value: unknown): SourceHandleRecord | undefined {
  if (!isRecord(value) || value.schemaVersion !== SOURCE_HANDLE_SCHEMA) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.sourcePackageId !== "string" ||
    typeof value.sourceName !== "string" ||
    (value.sourceKind !== "zip" && value.sourceKind !== "folder") ||
    (value.handleKind !== "file" && value.handleKind !== "directory") ||
    (value.capability !== "available" && value.capability !== "unsupported") ||
    (value.storage !== "memory" && value.storage !== "indexeddb") ||
    typeof value.persisted !== "boolean" ||
    !isPermission(value.permission) ||
    !isState(value.state) ||
    typeof value.fileCount !== "number" ||
    !Number.isSafeInteger(value.fileCount) ||
    value.fileCount < 0 ||
    typeof value.canRead !== "boolean" ||
    !isNextAction(value.nextAction) ||
    !Array.isArray(value.warnings) ||
    !value.warnings.every((warning) => typeof warning === "string") ||
    typeof value.updatedAt !== "string"
  ) {
    return undefined;
  }
  return value as unknown as SourceHandleRecord;
}

function isSourceHandleLike(value: unknown): value is SourceHandleLike {
  return isRecord(value) &&
    (typeof value.getFile === "function" || typeof value.queryPermission === "function" || typeof value.requestPermission === "function");
}

function isPermission(value: unknown): value is SourceHandlePermission {
  return value === "not-requested" || value === "prompt" || value === "granted" || value === "denied" || value === "revoked" || value === "unsupported";
}

function isState(value: unknown): value is SourceHandleState {
  return value === "not-linked" || value === "not-requested" || value === "granted" || value === "denied" || value === "revoked" || value === "missing" || value === "stale";
}

function isNextAction(value: unknown): value is SourceHandleNextAction {
  return value === "link-handle" || value === "request-permission" || value === "recover-source" || value === "relink-source" || value === "none";
}

function cloneStoreEntry(entry: SourceHandleStoreEntry): SourceHandleStoreEntry {
  return { record: cloneRecord(entry.record), ...(entry.handle ? { handle: entry.handle } : {}) };
}

function cloneRecord(record: SourceHandleRecord): SourceHandleRecord {
  return { ...record, warnings: [...record.warnings] };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
