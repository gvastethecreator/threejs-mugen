/** PCM WAV (format 1) with in-bounds fmt and data chunks. Not a decoder. */
export function isPcmWave(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 12) {
    return false;
  }
  const view = new DataView(bytes);
  if (readAscii(view, 0) !== "RIFF" || readAscii(view, 8) !== "WAVE") {
    return false;
  }
  let offset = 12;
  let hasPcmFormat = false;
  let hasData = false;
  while (offset + 8 <= bytes.byteLength) {
    const id = readAscii(view, offset);
    const size = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    if (size < 0 || payload + size > bytes.byteLength) {
      return false;
    }
    if (id === "fmt ") {
      if (size < 16) {
        return false;
      }
      const format = view.getUint16(payload, true);
      const channels = view.getUint16(payload + 2, true);
      const bits = view.getUint16(payload + 14, true);
      if (format !== 1 || channels < 1 || bits === 0) {
        return false;
      }
      hasPcmFormat = true;
    } else if (id === "data") {
      hasData = true;
    }
    offset = payload + size + (size % 2);
  }
  return hasPcmFormat && hasData;
}

function readAscii(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}
