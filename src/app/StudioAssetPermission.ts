import {
  STUDIO_LICENSE_EXPRESSION_PROFILE,
  isSupportedStudioLicenseExpression,
} from "./StudioLicenseExpression";

export const ASSET_PERMISSION_SCHEMA = "mugen-web-sandbox/asset-permission/v0" as const;

export const FIRST_PARTY_ASSET_PERMISSION_PATHS: Readonly<Record<string, string>> = {
  "nova-boxer": "/characters/nova-boxer/asset-permission.json",
};

export type AssetPermissionFile = {
  path: string;
  bytes: number;
  sha256: string;
};

export type AssetPermissionMetadata = {
  schemaVersion: typeof ASSET_PERMISSION_SCHEMA;
  assetId: string;
  ownership: "repository-owned";
  permission: "repository-owned";
  license: {
    expression: string;
    profile: typeof STUDIO_LICENSE_EXPRESSION_PROFILE;
    sourceRef: string;
    verified: true;
  };
  sourceFiles: AssetPermissionFile[];
  outputFiles: AssetPermissionFile[];
};

export function getAssetPermissionMetadataPath(assetId: string): string | undefined {
  return FIRST_PARTY_ASSET_PERMISSION_PATHS[assetId];
}

export function parseAssetPermissionMetadata(value: unknown): AssetPermissionMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  if (
    value.schemaVersion !== ASSET_PERMISSION_SCHEMA ||
    typeof value.assetId !== "string" ||
    !/^[a-z0-9][a-z0-9._-]*$/.test(value.assetId) ||
    value.ownership !== "repository-owned" ||
    value.permission !== "repository-owned"
  ) {
    return undefined;
  }
  const license = parseLicense(value.license);
  const sourceFiles = parseFiles(value.sourceFiles);
  const outputFiles = parseFiles(value.outputFiles);
  if (!license || !sourceFiles?.length || !outputFiles?.length) {
    return undefined;
  }
  return {
    schemaVersion: ASSET_PERMISSION_SCHEMA,
    assetId: value.assetId,
    ownership: "repository-owned",
    permission: "repository-owned",
    license,
    sourceFiles,
    outputFiles,
  };
}

export function isSafeAssetMetadataPath(value: string): boolean {
  const normalized = value.trim().replace(/\\/g, "/");
  return Boolean(normalized) && !/^(?:[a-z]:|\/|file:)/i.test(normalized) && !normalized.split("/").includes("..");
}

function parseLicense(value: unknown): AssetPermissionMetadata["license"] | undefined {
  if (
    !isRecord(value) ||
    typeof value.expression !== "string" ||
    value.profile !== STUDIO_LICENSE_EXPRESSION_PROFILE ||
    typeof value.sourceRef !== "string" ||
    value.verified !== true
  ) {
    return undefined;
  }
  const expression = value.expression.trim();
  const sourceRef = value.sourceRef.trim().replace(/\\/g, "/");
  if (!isSupportedStudioLicenseExpression(expression) || !isSafeAssetMetadataPath(sourceRef)) {
    return undefined;
  }
  return { expression, profile: STUDIO_LICENSE_EXPRESSION_PROFILE, sourceRef, verified: true };
}

function parseFiles(value: unknown): AssetPermissionFile[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const files = value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.path !== "string" || !isSafeAssetMetadataPath(entry.path) || typeof entry.bytes !== "number" || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || typeof entry.sha256 !== "string" || !/^[0-9a-f]{64}$/i.test(entry.sha256)) {
      return [];
    }
    return [{
      path: entry.path.trim().replace(/\\/g, "/"),
      bytes: entry.bytes,
      sha256: entry.sha256.toLowerCase(),
    }];
  });
  if (files.length !== value.length) {
    return undefined;
  }
  const unique = new Set<string>();
  for (const file of files) {
    const key = file.path.toLowerCase();
    if (unique.has(key)) {
      return undefined;
    }
    unique.add(key);
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
