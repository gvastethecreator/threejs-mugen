/**
 * DA30-077: separate authoring views with narrow ownership.
 */

export type AuthoringViewId =
  | "character"
  | "state-controller"
  | "command"
  | "animation"
  | "palette"
  | "stage"
  | "asset"
  | "evidence"
  | "project-settings";

export type AuthoringView = {
  id: AuthoringViewId;
  validation: boolean;
  sourceLocation: boolean;
  undoRedo: boolean;
  keyboardAccess: boolean;
  owner: string;
};

const VIEWS: AuthoringView[] = [
  { id: "character", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "char-editor" },
  { id: "state-controller", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "cns-editor" },
  { id: "command", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "cmd-editor" },
  { id: "animation", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "air-editor" },
  { id: "palette", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "act-editor" },
  { id: "stage", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "stage-editor" },
  { id: "asset", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "asset-browser" },
  { id: "evidence", validation: true, sourceLocation: true, undoRedo: false, keyboardAccess: true, owner: "evidence-panel" },
  { id: "project-settings", validation: true, sourceLocation: true, undoRedo: true, keyboardAccess: true, owner: "project" },
];

export function listAuthoringViews(): AuthoringView[] {
  return VIEWS.map((v) => ({ ...v }));
}

export function assertNarrowOwnership(views: AuthoringView[]): boolean {
  const owners = views.map((v) => v.owner);
  return new Set(owners).size === owners.length;
}

export function runAuthoringViewsCheck(): { ok: boolean; count: number; narrow: boolean } {
  const views = listAuthoringViews();
  const narrow = assertNarrowOwnership(views);
  const complete = views.every((v) => v.validation && v.sourceLocation && v.keyboardAccess);
  return { ok: views.length >= 9 && narrow && complete, count: views.length, narrow };
}
