/**
 * DA30-023: machine-readable product route inventory.
 */

export type ProductRoute = {
  id: string;
  path: string;
  setup: string;
  expected: string;
  owner: string;
  viewport: Array<"desktop" | "mobile">;
};

export type ProductRouteInventory = {
  schema: "Da30ProductRouteInventory/v1";
  id: "DA30-023";
  routes: ProductRoute[];
  omissions: string[];
  claimCeiling: string;
};

export function validateProductRouteInventory(doc: Partial<ProductRouteInventory>): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (doc.schema !== "Da30ProductRouteInventory/v1") errors.push("bad schema");
  if (!Array.isArray(doc.routes) || doc.routes.length < 5) errors.push("need >=5 routes");
  if (!Array.isArray(doc.omissions)) errors.push("missing omissions");
  const ids = new Set<string>();
  for (const r of doc.routes ?? []) {
    if (!r.id?.trim()) errors.push("route missing id");
    else if (ids.has(r.id)) errors.push(`duplicate route ${r.id}`);
    else ids.add(r.id);
    if (!r.path?.startsWith("/")) errors.push(`${r.id}: path must start with /`);
    if (!r.setup?.trim()) errors.push(`${r.id}: missing setup`);
    if (!r.expected?.trim()) errors.push(`${r.id}: missing expected`);
    if (!r.owner?.trim()) errors.push(`${r.id}: missing owner`);
    if (!Array.isArray(r.viewport) || r.viewport.length === 0) errors.push(`${r.id}: missing viewport`);
  }
  return { ok: errors.length === 0, errors };
}

export function defaultProductRouteInventory(): ProductRouteInventory {
  return {
    schema: "Da30ProductRouteInventory/v1",
    id: "DA30-023",
    routes: [
      {
        id: "play-match",
        path: "/?mode=match",
        setup: "load nova vs mira stage rooftop",
        expected: "combat HUD + stage",
        owner: "App.ts",
        viewport: ["desktop", "mobile"],
      },
      {
        id: "inspect",
        path: "/?mode=inspect",
        setup: "open package",
        expected: "source/capability facts",
        owner: "App.ts",
        viewport: ["desktop"],
      },
      {
        id: "studio-workbench",
        path: "/?mode=studio",
        setup: "open project",
        expected: "tabs authoring",
        owner: "App.ts",
        viewport: ["desktop", "mobile"],
      },
      {
        id: "studio-import",
        path: "/?mode=studio&panel=import",
        setup: "pick archive",
        expected: "scan result or error",
        owner: "Studio",
        viewport: ["desktop"],
      },
      {
        id: "studio-save",
        path: "/?mode=studio",
        setup: "edit+save",
        expected: "revision receipt or trust fail",
        owner: "Studio write",
        viewport: ["desktop"],
      },
      {
        id: "select-chars",
        path: "/?mode=select",
        setup: "roster",
        expected: "legal/blocked entries",
        owner: "selection",
        viewport: ["desktop", "mobile"],
      },
      {
        id: "error-recovery",
        path: "/?mode=studio",
        setup: "force quota/permission",
        expected: "actionable trust UI",
        owner: "Studio trust",
        viewport: ["desktop"],
      },
    ],
    omissions: ["netplay lobby", "arcade mode full", "storyboard player"],
    claimCeiling: "route inventory only",
  };
}

export function routeById(inv: ProductRouteInventory, id: string): ProductRoute | undefined {
  return inv.routes.find((r) => r.id === id);
}
