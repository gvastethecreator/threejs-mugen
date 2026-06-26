import { VirtualFileSystem } from "./VirtualFileSystem";

export class FolderCharacterSource {
  constructor(private readonly files: FileList | File[]) {}

  async load(): Promise<VirtualFileSystem> {
    const vfs = new VirtualFileSystem();
    const files = Array.from(this.files);

    await Promise.all(
      files.map(async (file) => {
        const path = getRelativePath(file);
        vfs.addFile(path, await file.arrayBuffer());
      }),
    );

    return vfs;
  }

  get name(): string {
    const first = Array.from(this.files)[0];
    return first ? getRelativePath(first).split("/")[0] ?? "folder" : "folder";
  }
}

function getRelativePath(file: File): string {
  const withWebkit = file as File & { webkitRelativePath?: string };
  return withWebkit.webkitRelativePath || file.name;
}
