export const IKEMEN_DEFAULT_PLAYER_ID_BASELINE = 56;

export type RuntimeCharacterIdentityActor = {
  id: string;
  playerNo: number;
  rootId?: string;
  disabled?: boolean;
  destroyed?: boolean;
  standby?: boolean;
};

export type RuntimeCharacterIdentityDiagnosticEntry = {
  actorId: string;
  playerId: number;
  playerNo: number;
  kind: "root" | "helper";
  rootId?: string;
  disabled: boolean;
  destroyed: boolean;
  standby: boolean;
  lookupEligible: boolean;
};

export type RuntimeCharacterIdentityDiagnostic = {
  schema: "RuntimeCharacterIdentity/v0";
  firstPlayerId: number;
  nextPlayerId: number;
  characters: readonly Readonly<RuntimeCharacterIdentityDiagnosticEntry>[];
};

export type RuntimeCharacterIdentityOptions = {
  firstPlayerId?: number;
};

type RuntimeCharacterIdentityRecord<TActor> = {
  actor: TActor;
  playerId: number;
};

export class RuntimeCharacterIdentityRegistry<TActor extends RuntimeCharacterIdentityActor> {
  private readonly firstPlayerId: number;
  private nextPlayerId: number;
  private readonly records: RuntimeCharacterIdentityRecord<TActor>[] = [];
  private readonly recordByActorId = new Map<string, RuntimeCharacterIdentityRecord<TActor>>();
  private readonly recordByPlayerId = new Map<number, RuntimeCharacterIdentityRecord<TActor>>();
  private readonly usedActorIds = new Set<string>();

  constructor(initialRoots: readonly TActor[], options: RuntimeCharacterIdentityOptions = {}) {
    this.firstPlayerId = requirePlayerId(options.firstPlayerId ?? IKEMEN_DEFAULT_PLAYER_ID_BASELINE, "first PlayerID");
    this.nextPlayerId = this.firstPlayerId;
    const orderedRoots = orderInitialRoots(initialRoots);
    for (const root of orderedRoots) this.register(root);
  }

  register(actor: TActor): number {
    validateCharacter(actor);
    if (this.usedActorIds.has(actor.id)) {
      throw new Error(`Runtime character ${actor.id} was already registered`);
    }
    if (actor.rootId !== undefined && !this.recordByActorId.has(actor.rootId)) {
      throw new Error(`Runtime character ${actor.id} has unknown root ${actor.rootId}`);
    }

    const playerId = this.allocatePlayerId();
    const record = { actor, playerId };
    this.records.push(record);
    this.recordByActorId.set(actor.id, record);
    this.recordByPlayerId.set(playerId, record);
    this.usedActorIds.add(actor.id);
    return playerId;
  }

  unregister(actorId: string): boolean {
    const record = this.recordByActorId.get(actorId);
    if (!record) return false;
    this.recordByActorId.delete(actorId);
    this.recordByPlayerId.delete(record.playerId);
    const index = this.records.indexOf(record);
    if (index >= 0) this.records.splice(index, 1);
    return true;
  }

  playerIdFor(actorId: string): number | undefined {
    return this.recordByActorId.get(actorId)?.playerId;
  }

  findByPlayerId(playerId: number): TActor | undefined {
    if (!Number.isInteger(playerId) || playerId < 0) return undefined;
    const actor = this.recordByPlayerId.get(playerId)?.actor;
    return actor && isLookupEligible(actor) ? actor : undefined;
  }

  diagnostic(): RuntimeCharacterIdentityDiagnostic {
    const characters = this.records.map(({ actor, playerId }) =>
      Object.freeze({
        actorId: actor.id,
        playerId,
        playerNo: actor.playerNo,
        kind: actor.rootId === undefined ? "root" as const : "helper" as const,
        ...(actor.rootId === undefined ? {} : { rootId: actor.rootId }),
        disabled: actor.disabled === true,
        destroyed: actor.destroyed === true,
        standby: actor.standby === true,
        lookupEligible: isLookupEligible(actor),
      }),
    );
    return Object.freeze({
      schema: "RuntimeCharacterIdentity/v0",
      firstPlayerId: this.firstPlayerId,
      nextPlayerId: this.nextPlayerId,
      characters: Object.freeze(characters),
    });
  }

  private allocatePlayerId(): number {
    const playerId = this.nextPlayerId;
    if (!Number.isSafeInteger(playerId)) throw new Error("Runtime character PlayerID space exhausted");
    this.nextPlayerId += 1;
    return playerId;
  }
}

export class RuntimeCharacterIdentityWorld {
  create<TActor extends RuntimeCharacterIdentityActor>(
    initialRoots: readonly TActor[],
    options: RuntimeCharacterIdentityOptions = {},
  ): RuntimeCharacterIdentityRegistry<TActor> {
    return new RuntimeCharacterIdentityRegistry(initialRoots, options);
  }
}

function orderInitialRoots<TActor extends RuntimeCharacterIdentityActor>(roots: readonly TActor[]): TActor[] {
  const actorIds = new Set<string>();
  const playerNos = new Set<number>();
  for (const root of roots) {
    validateCharacter(root);
    if (root.rootId !== undefined) throw new Error(`Initial runtime character ${root.id} is not a root`);
    if (actorIds.has(root.id)) throw new Error(`Duplicate initial runtime character id: ${root.id}`);
    if (playerNos.has(root.playerNo)) throw new Error(`Duplicate initial runtime PlayerNo: ${root.playerNo}`);
    actorIds.add(root.id);
    playerNos.add(root.playerNo);
  }
  return [...roots].sort((left, right) => {
    const sideOrder = Number(left.playerNo % 2 === 0) - Number(right.playerNo % 2 === 0);
    return sideOrder || left.playerNo - right.playerNo;
  });
}

function validateCharacter(actor: RuntimeCharacterIdentityActor): void {
  if (!actor.id.trim()) throw new Error("Runtime character id must not be empty");
  if (!Number.isInteger(actor.playerNo) || actor.playerNo < 1) {
    throw new Error(`Invalid runtime PlayerNo for ${actor.id}: ${actor.playerNo}`);
  }
  if (actor.rootId !== undefined && !actor.rootId.trim()) {
    throw new Error(`Runtime character ${actor.id} has an empty root id`);
  }
}

function requirePlayerId(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error(`Invalid ${label}: ${value}`);
  return value;
}

function isLookupEligible(actor: RuntimeCharacterIdentityActor): boolean {
  return actor.destroyed !== true && actor.disabled !== true;
}
