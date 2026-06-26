import type { MugenCharacterDef } from "../model/MugenCharacter";

export function detectMugenVersion(definition: MugenCharacterDef): string {
  return definition.info.mugenVersion?.trim() || "unknown";
}
