import type { MugenDiagnostic } from "../model/MugenAnimation";

export type ParsedActPalette = {
  colors: string[];
  data?: Uint8Array;
  colorCount: number;
  transparentIndex?: number;
  diagnostics: MugenDiagnostic[];
  raw?: {
    byteLength: number;
    hasAdobeFooter: boolean;
  };
};

export function parseAct(buffer: ArrayBuffer, file?: string): ParsedActPalette {
  const bytes = new Uint8Array(buffer);
  const diagnostics: MugenDiagnostic[] = [];
  if (bytes.length < 768) {
    diagnostics.push({
      severity: "error",
      format: "act",
      file,
      message: `ACT palette is too short: ${bytes.length}/768 bytes`,
    });
    return { colors: [], colorCount: 0, diagnostics, raw: { byteLength: bytes.length, hasAdobeFooter: false } };
  }

  const hasAdobeFooter = bytes.length >= 772;
  const declaredCount = hasAdobeFooter ? readBigEndianU16(bytes, 768) : undefined;
  const declaredTransparent = hasAdobeFooter ? readBigEndianU16(bytes, 770) : undefined;
  const colorCount = declaredCount && declaredCount > 0 && declaredCount <= 256 ? declaredCount : 256;
  const transparentIndex = declaredTransparent !== undefined && declaredTransparent < 256 ? declaredTransparent : undefined;
  const data = bytes.slice(0, 768);
  if (bytes.length !== 768 && bytes.length !== 772) {
    diagnostics.push({
      severity: "warning",
      format: "act",
      file,
      message: `ACT palette has ${bytes.length} bytes; parsed first 768 color bytes and ignored trailing data`,
    });
  }

  return {
    colors: Array.from({ length: colorCount }, (_value, index) => colorAt(data, index)),
    data,
    colorCount,
    transparentIndex,
    diagnostics,
    raw: {
      byteLength: bytes.length,
      hasAdobeFooter,
    },
  };
}

function colorAt(bytes: Uint8Array, index: number): string {
  const offset = index * 3;
  return `#${hex(bytes[offset] ?? 0)}${hex(bytes[offset + 1] ?? 0)}${hex(bytes[offset + 2] ?? 0)}`;
}

function hex(value: number): string {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");
}

function readBigEndianU16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}
