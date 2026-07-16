export type CollisionBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type MugenCollisionBoxType = "clsn1" | "clsn2" | "size" | "none";

export function normalizeMugenCollisionBoxType(value: string | undefined): MugenCollisionBoxType | undefined {
  const normalized = value?.trim().replace(/^"|"$/g, "").replace(/[\s_-]+/g, "").toLowerCase();
  if (normalized === "clsn1") return "clsn1";
  if (normalized === "clsn2") return "clsn2";
  if (normalized === "size") return "size";
  if (normalized === "none") return "none";
  return undefined;
}

export type LocatedCollisionBox = CollisionBox & {
  raw?: string;
  line?: number;
};
