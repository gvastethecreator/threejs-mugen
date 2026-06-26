import type { MugenSnapshot } from "../../mugen/runtime/types";

export interface MugenRenderer {
  mount(target: HTMLElement): void;
  render(snapshot: MugenSnapshot): Promise<void>;
  resize(): void;
  dispose(): void;
}
