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

    await Promise.all(
      files.map(async (file) => {
        vfs.addFile(file.relativePath, await file.file.arrayBuffer());
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
