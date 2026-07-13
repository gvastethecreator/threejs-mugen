export type StudioProjectSurface = "match" | "inspect" | "studio";

export function needsStudioProjectNavigationGuard(surface: StudioProjectSurface, projectDirty: boolean): boolean {
  return surface === "studio" && projectDirty;
}

export function studioProjectDiscardMessage(destination: string): string {
  return `This Studio project has unsaved changes. Continue to ${destination}?`;
}
