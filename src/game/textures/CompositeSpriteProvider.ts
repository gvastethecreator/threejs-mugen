import type { MugenSprite, SpriteLookupContext, SpriteProvider } from "../../mugen/model/MugenSprite";

type SpriteRoute = {
  minGroup: number;
  maxGroup: number;
  provider: SpriteProvider;
  tag?: string;
};

type OwnerRoute = {
  ownerId: string;
  provider: SpriteProvider;
  tag?: string;
};

export class CompositeSpriteProvider implements SpriteProvider {
  private readonly routes: SpriteRoute[] = [];
  private readonly ownerRoutes: OwnerRoute[] = [];

  constructor(private readonly fallback: SpriteProvider) {}

  registerGroupRange(minGroup: number, maxGroup: number, provider: SpriteProvider, tag?: string): void {
    this.routes.push({ minGroup, maxGroup, provider, tag });
  }

  registerOwner(ownerId: string, provider: SpriteProvider, tag?: string): void {
    this.ownerRoutes.push({ ownerId, provider, tag });
  }

  clearRoutesByTag(tag: string): void {
    for (let index = this.routes.length - 1; index >= 0; index -= 1) {
      if (this.routes[index]?.tag === tag) {
        this.routes.splice(index, 1);
      }
    }
    for (let index = this.ownerRoutes.length - 1; index >= 0; index -= 1) {
      if (this.ownerRoutes[index]?.tag === tag) {
        this.ownerRoutes.splice(index, 1);
      }
    }
  }

  async getSprite(group: number, index: number, context: SpriteLookupContext = {}): Promise<MugenSprite | undefined> {
    if (context.ownerId) {
      for (let routeIndex = this.ownerRoutes.length - 1; routeIndex >= 0; routeIndex -= 1) {
        const route = this.ownerRoutes[routeIndex];
        if (route?.ownerId === context.ownerId) {
          const sprite = await route.provider.getSprite(group, index, context);
          if (sprite) {
            return sprite;
          }
        }
      }
    }

    for (let routeIndex = this.routes.length - 1; routeIndex >= 0; routeIndex -= 1) {
      const route = this.routes[routeIndex];
      if (route && group >= route.minGroup && group <= route.maxGroup) {
        const sprite = await route.provider.getSprite(group, index, context);
        if (sprite) {
          return sprite;
        }
      }
    }
    return this.fallback.getSprite(group, index, context);
  }
}
