import { describe, expect, it } from "vitest";
import {
  IKEMEN_DEFAULT_PLAYER_ID_BASELINE,
  RuntimeCharacterIdentityWorld,
  type RuntimeCharacterIdentityActor,
} from "../mugen/runtime/RuntimeCharacterIdentitySystem";

describe("RuntimeCharacterIdentityWorld", () => {
  it("assigns present odd roots before present even roots from the official default baseline", () => {
    const p1 = actor("p1", 1);
    const p2 = actor("p2", 2);
    const p3 = actor("p3", 3);
    const p4 = actor("p4", 4);
    const registry = new RuntimeCharacterIdentityWorld().create([p4, p2, p3, p1]);

    expect(IKEMEN_DEFAULT_PLAYER_ID_BASELINE).toBe(56);
    expect(registry.diagnostic()).toEqual({
      schema: "RuntimeCharacterIdentity/v0",
      firstPlayerId: 56,
      nextPlayerId: 60,
      characters: [
        entry("p1", 56, 1),
        entry("p3", 57, 3),
        entry("p2", 58, 2),
        entry("p4", 59, 4),
      ],
    });
    expect(registry.findByPlayerId(56)).toBe(p1);
    expect(registry.findByPlayerId(57)).toBe(p3);
    expect(registry.playerIdFor("p2")).toBe(58);
  });

  it("supports a configurable baseline without conflating PlayerID and PlayerNo", () => {
    const registry = new RuntimeCharacterIdentityWorld().create([actor("p2", 2), actor("p1", 1)], {
      firstPlayerId: 100,
    });

    expect(registry.playerIdFor("p1")).toBe(100);
    expect(registry.playerIdFor("p2")).toBe(101);
    expect(registry.diagnostic().characters.map(({ playerId, playerNo }) => [playerId, playerNo])).toEqual([
      [100, 1],
      [101, 2],
    ]);
  });

  it("rejects invalid lookups and filters destroyed or disabled characters while retaining standby", () => {
    const p1 = actor("p1", 1, { standby: true });
    const p2 = actor("p2", 2, { disabled: true });
    const p3 = actor("p3", 3, { destroyed: true });
    const registry = new RuntimeCharacterIdentityWorld().create([p1, p2, p3]);

    expect(registry.findByPlayerId(56)).toBe(p1);
    expect(registry.findByPlayerId(57)).toBeUndefined();
    expect(registry.findByPlayerId(58)).toBeUndefined();
    expect(registry.findByPlayerId(-1)).toBeUndefined();
    expect(registry.findByPlayerId(56.5)).toBeUndefined();
    expect(registry.findByPlayerId(999)).toBeUndefined();
    expect(registry.diagnostic().characters.map(({ actorId, lookupEligible }) => [actorId, lookupEligible])).toEqual([
      ["p1", true],
      ["p3", false],
      ["p2", false],
    ]);
  });

  it("allocates later characters monotonically and never reuses a removed PlayerID or actor id", () => {
    const registry = new RuntimeCharacterIdentityWorld().create<RuntimeCharacterIdentityActor>([
      actor("p1", 1),
      actor("p2", 2),
    ]);
    const firstHelper = actor("p1-helper-0", 1, { rootId: "p1", parentId: "p1" });
    const secondHelper = actor("p1-helper-1", 1, { rootId: "p1", parentId: "p1-helper-0" });

    expect(registry.register(firstHelper)).toBe(58);
    expect(registry.diagnostic().characters[2]).toMatchObject({
      actorId: "p1-helper-0",
      playerId: 58,
      playerNo: 1,
      kind: "helper",
      rootId: "p1",
      parentId: "p1",
    });
    expect(registry.register(secondHelper)).toBe(59);
    expect(registry.unregister(firstHelper.id)).toBe(true);
    expect(registry.unregister(firstHelper.id)).toBe(false);
    expect(registry.findByPlayerId(58)).toBeUndefined();
    expect(registry.findByPlayerId(59)).toBe(secondHelper);
    expect(() => registry.register(actor("p1-helper-0", 1, { rootId: "p1", parentId: "p1" }))).toThrow("was already registered");
    expect(registry.diagnostic().nextPlayerId).toBe(60);
  });

  it("rejects ambiguous initial identity and invalid later registration", () => {
    const world = new RuntimeCharacterIdentityWorld();

    expect(() => world.create([actor("p1", 1), actor("p1", 3)])).toThrow("Duplicate initial runtime character id: p1");
    expect(() => world.create([actor("p1", 1), actor("p3", 1)])).toThrow("Duplicate initial runtime PlayerNo: 1");
    expect(() => world.create([actor("helper", 1, { rootId: "p1" })])).toThrow("is not a root");
    expect(() => world.create([actor("", 1)])).toThrow("id must not be empty");
    expect(() => world.create([actor("p1", 0)])).toThrow("Invalid runtime PlayerNo");
    expect(() => world.create([], { firstPlayerId: -1 })).toThrow("Invalid first PlayerID");

    const registry = world.create<RuntimeCharacterIdentityActor>([actor("p1", 1)]);
    expect(() => registry.register(actor("orphan-helper", 1, { rootId: "p9" }))).toThrow("unknown root p9");
    expect(() => registry.register(actor("orphan-parent", 1, { rootId: "p1", parentId: "missing" }))).toThrow("unknown parent missing");
    expect(() => registry.register(actor("wrong-playerno", 2, { rootId: "p1", parentId: "p1" }))).toThrow(
      "does not inherit root PlayerNo 1",
    );
  });

  it("publishes detached deeply frozen diagnostics while reading live eligibility", () => {
    const p1 = actor("p1", 1);
    const registry = new RuntimeCharacterIdentityWorld().create([p1]);
    const initial = registry.diagnostic();

    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial.characters)).toBe(true);
    expect(Object.isFrozen(initial.characters[0])).toBe(true);
    expect(() => (initial.characters as unknown as object[]).push({})).toThrow();
    p1.disabled = true;
    expect(initial.characters[0]?.lookupEligible).toBe(true);
    expect(registry.diagnostic().characters[0]?.lookupEligible).toBe(false);
  });
});

function actor(
  id: string,
  playerNo: number,
  state: Partial<Omit<RuntimeCharacterIdentityActor, "id" | "playerNo">> = {},
): RuntimeCharacterIdentityActor {
  return { id, playerNo, ...state };
}

function entry(actorId: string, playerId: number, playerNo: number) {
  return {
    actorId,
    playerId,
    playerNo,
    kind: "root",
    disabled: false,
    destroyed: false,
    standby: false,
    lookupEligible: true,
  };
}
