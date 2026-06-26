import { describe, expect, it } from "vitest";
import type { MugenSprite, SpriteProvider } from "../mugen/model/MugenSprite";
import { CompositeSpriteProvider } from "../game/textures/CompositeSpriteProvider";

describe("CompositeSpriteProvider", () => {
  it("prefers an owner route before global group ranges", async () => {
    const fallback = provider("fallback", 900);
    const global = provider("global", 100);
    const owner = provider("owner", 200);
    const sprites = new CompositeSpriteProvider(fallback);

    sprites.registerGroupRange(0, 999, global, "global");
    sprites.registerOwner("p1", owner, "owner");

    await expect(sprites.getSprite(500, 0)).resolves.toMatchObject({ raw: { source: "global" } });
    await expect(sprites.getSprite(500, 0, { ownerId: "p1" })).resolves.toMatchObject({ raw: { source: "owner" } });
  });

  it("falls back to group ranges when an owner route does not contain the sprite", async () => {
    const fallback = provider("fallback", 900);
    const global = provider("global", 100);
    const missingOwner: SpriteProvider = {
      async getSprite() {
        return undefined;
      },
    };
    const sprites = new CompositeSpriteProvider(fallback);

    sprites.registerGroupRange(0, 999, global, "global");
    sprites.registerOwner("p1", missingOwner, "owner");

    await expect(sprites.getSprite(500, 0, { ownerId: "p1" })).resolves.toMatchObject({ raw: { source: "global" } });
  });
});

function provider(source: string, groupOffset: number): SpriteProvider {
  return {
    async getSprite(group: number, index: number): Promise<MugenSprite> {
      return {
        group: group + groupOffset,
        index,
        width: 8,
        height: 8,
        axisX: 4,
        axisY: 8,
        raw: { source },
      };
    },
  };
}
