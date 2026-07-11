import { runtimeTeamSide, type RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export type RuntimeTagTeamOrderRoot = {
  id: string;
  rootId?: string;
  playerType?: boolean;
};

export type RuntimeTagTeamOrderSideDiagnostic = {
  side: RuntimeTeamSide;
  stableRootIds: string[];
  memberOrderIds: string[];
  leaderId: string;
};

export type RuntimeTagTeamOrderDiagnostic = {
  schema: "RuntimeTagTeamOrder/v0";
  sides: RuntimeTagTeamOrderSideDiagnostic[];
};

export type RuntimeTagTeamMode = "single" | "tag";

export class RuntimeTagTeamOrder {
  private readonly stableBySide: Record<RuntimeTeamSide, string[]>;
  private orderBySide: Record<RuntimeTeamSide, string[]>;
  private leaderBySide: Record<RuntimeTeamSide, string>;

  constructor(stableBySide: Record<RuntimeTeamSide, string[]>) {
    this.stableBySide = cloneSides(stableBySide);
    this.orderBySide = cloneSides(stableBySide);
    this.leaderBySide = { 1: requireLeader(stableBySide[1], 1), 2: requireLeader(stableBySide[2], 2) };
  }

  swapMember(side: RuntimeTeamSide, callerId: string, targetPosition: number): void {
    const order = this.orderBySide[side];
    const callerIndex = order.indexOf(callerId);
    const targetIndex = targetPosition - 1;
    if (callerIndex < 0) throw new Error(`Unknown Tag member ${callerId} on side ${side}`);
    if (!Number.isInteger(targetPosition) || targetIndex < 0 || targetIndex >= order.length) {
      throw new Error(`Invalid Tag member position ${targetPosition} on side ${side}`);
    }
    const next = [...order];
    [next[callerIndex], next[targetIndex]] = [next[targetIndex]!, next[callerIndex]!];
    this.orderBySide = { ...this.orderBySide, [side]: next };
  }

  rotateLeader(side: RuntimeTeamSide, leaderId: string, isAlive: (id: string) => boolean = () => true): void {
    const order = this.orderBySide[side];
    const leaderIndex = order.indexOf(leaderId);
    if (leaderIndex < 0) throw new Error(`Unknown Tag leader ${leaderId} on side ${side}`);
    let next = [...order];
    if (leaderIndex > 0) {
      const lastAlive = findLastAlive(next, isAlive);
      next = move(next, leaderIndex, 0);
      if (leaderIndex < lastAlive && lastAlive > 1) next = move(next, 1, lastAlive);
    }
    next = [next[0]!, ...next.slice(1).filter(isAlive), ...next.slice(1).filter((id) => !isAlive(id))];
    this.orderBySide = { ...this.orderBySide, [side]: next };
    this.leaderBySide = { ...this.leaderBySide, [side]: next[0]! };
  }

  reset(): void {
    this.orderBySide = cloneSides(this.stableBySide);
    this.leaderBySide = { 1: requireLeader(this.stableBySide[1], 1), 2: requireLeader(this.stableBySide[2], 2) };
  }

  diagnostic(): RuntimeTagTeamOrderDiagnostic {
    return {
      schema: "RuntimeTagTeamOrder/v0",
      sides: ([1, 2] as const).map((side) => ({
        side,
        stableRootIds: [...this.stableBySide[side]],
        memberOrderIds: [...this.orderBySide[side]],
        leaderId: this.leaderBySide[side],
      })),
    };
  }
}

export class RuntimeTagTeamOrderWorld {
  create(roots: readonly RuntimeTagTeamOrderRoot[], mode: RuntimeTagTeamMode): RuntimeTagTeamOrder | undefined {
    if (mode !== "tag") return undefined;
    const seen = new Set<string>();
    const stableBySide: Record<RuntimeTeamSide, string[]> = { 1: [], 2: [] };
    for (const root of roots) {
      if (seen.has(root.id)) throw new Error(`Duplicate Tag root ${root.id}`);
      seen.add(root.id);
      if (root.rootId !== undefined || root.playerType === false) throw new Error(`Tag member ${root.id} is not a player root`);
      const side = runtimeTeamSide(root);
      if (side === undefined) throw new Error(`Tag member ${root.id} has no valid team side`);
      stableBySide[side].push(root.id);
    }
    for (const side of [1, 2] as const) stableBySide[side].sort((a, b) => playerSlot(a) - playerSlot(b));
    return new RuntimeTagTeamOrder(stableBySide);
  }
}

function cloneSides(source: Record<RuntimeTeamSide, string[]>): Record<RuntimeTeamSide, string[]> {
  return { 1: [...source[1]], 2: [...source[2]] };
}

function requireLeader(ids: readonly string[], side: RuntimeTeamSide): string {
  if (!ids[0]) throw new Error(`Tag mode requires a root on side ${side}`);
  return ids[0];
}

function playerSlot(id: string): number {
  const match = /^p(\d+)$/i.exec(id);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function findLastAlive(order: readonly string[], isAlive: (id: string) => boolean): number {
  for (let index = order.length - 1; index >= 0; index -= 1) if (isAlive(order[index]!)) return index;
  return 0;
}

function move(order: readonly string[], from: number, to: number): string[] {
  const next = [...order];
  const [value] = next.splice(from, 1);
  next.splice(to, 0, value!);
  return next;
}
