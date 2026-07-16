export type MugenTeamSide = 1 | 2;
export type MugenAffectTeam = -1 | 0 | 1;

export function normalizeMugenAffectTeam(value: string | undefined): MugenAffectTeam | undefined {
  const token = value?.trim().replace(/^"|"$/g, "").toLowerCase()[0];
  if (token === "f") return -1;
  if (token === "b") return 0;
  if (token === "e") return 1;
  return undefined;
}

export function normalizeMugenTeamSide(value: number | undefined): MugenTeamSide | undefined {
  return value === 1 || value === 2 ? value : undefined;
}
