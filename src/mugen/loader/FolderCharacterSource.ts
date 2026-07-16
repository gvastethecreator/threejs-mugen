import { VirtualFileSystem } from "./VirtualFileSystem";

export type FolderCharacterSourceFile = {
  file: File;
  relativePath: string;
};

export type FolderCharacterSourceInput = FileList | readonly (File | FolderCharacterSourceFile)[];

export class FolderCharacterSource {
  constructor(private readonly files: FolderCharacterSourceInput) {}

  async load(): Promise<VirtualFileSystem> {
    const vfs = new VirtualFileSystem();
    const files = Array.from(this.files, toFolderSourceFile);
    const selectedRoot = isBrowserFileList(this.files) ? commonSelectedRoot(files) : undefined;

    await Promise.all(
      files.map(async (file) => {
        vfs.addFile(stripSelectedRoot(file.relativePath, selectedRoot), await file.file.arrayBuffer());
      }),
    );

    return vfs;
  }

  get name(): string {
    const first = Array.from(this.files, toFolderSourceFile)[0];
    return first ? first.relativePath.split("/")[0] ?? "folder" : "folder";
  }
}

function toFolderSourceFile(file: File | FolderCharacterSourceFile): FolderCharacterSourceFile {
  if (isFolderCharacterSourceFile(file)) {
    return file;
  }
  return { file, relativePath: getRelativePath(file) };
}

function isFolderCharacterSourceFile(value: File | FolderCharacterSourceFile): value is FolderCharacterSourceFile {
  return typeof value === "object" && value !== null && "file" in value && "relativePath" in value;
}

function getRelativePath(file: File): string {
  const withWebkit = file as File & { webkitRelativePath?: string };
  return withWebkit.webkitRelativePath || file.name;
}

function isBrowserFileList(value: FolderCharacterSourceInput): value is FileList {
  return !Array.isArray(value) && typeof value === "object" && typeof (value as { item?: unknown }).item === "function";
}

function commonSelectedRoot(files: readonly FolderCharacterSourceFile[]): string | undefined {
  const segments = files.map((file) => file.relativePath.replace(/\\/g, "/").split("/").filter(Boolean));
  const root = segments[0]?.[0];
  if (!root || segments.some((parts) => parts.length < 2 || parts[0] !== root)) return undefined;
  return root;
}

function stripSelectedRoot(relativePath: string, selectedRoot: string | undefined): string {
  if (!selectedRoot) return relativePath;
  const normalized = relativePath.replace(/\\/g, "/");
  const prefix = `${selectedRoot}/`;
  return normalized.startsWith(prefix) ? normalized.slice(prefix.length) : relativePath;
}
