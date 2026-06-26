import JSZip from "jszip";
import { VirtualFileSystem } from "./VirtualFileSystem";

export class ZipCharacterSource {
  constructor(private readonly file: File) {}

  async load(): Promise<VirtualFileSystem> {
    const zip = await JSZip.loadAsync(await this.file.arrayBuffer());
    const vfs = new VirtualFileSystem();
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);

    await Promise.all(
      entries.map(async (entry) => {
        const buffer = await entry.async("arraybuffer");
        vfs.addFile(entry.name, buffer);
      }),
    );

    return vfs;
  }

  get name(): string {
    return this.file.name;
  }
}
