import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";

const HIT_SPARK_GROUPS = new Set([7000, 7001, 7002]);

type HitSparkVariant = {
  core: string;
  edge: string;
  accent: string;
  radius: number;
};

const variants: Record<number, HitSparkVariant> = {
  7000: { core: "#e8fbff", edge: "#68d8ff", accent: "#1f8cff", radius: 24 },
  7001: { core: "#fff7d0", edge: "#ffc247", accent: "#ff7a18", radius: 28 },
  7002: { core: "#fff4f8", edge: "#ff6fb1", accent: "#b84cff", radius: 32 },
};

export class NativeHitSparkSpriteProvider implements SpriteProvider {
  private readonly cache = new Map<string, MugenSprite>();

  async getSprite(group: number, index: number): Promise<MugenSprite | undefined> {
    if (!HIT_SPARK_GROUPS.has(group) || index < 0 || index > 2) {
      return undefined;
    }
    const key = `${group}:${index}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }

    const sprite = createHitSparkSprite(group, index);
    this.cache.set(key, sprite);
    return sprite;
  }
}

function createHitSparkSprite(group: number, index: number): MugenSprite {
  const variant = variants[group] ?? variants[7001]!;
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    drawSpark(context, variant, index, size);
  }
  return {
    group,
    index,
    width: size,
    height: size,
    axisX: size / 2,
    axisY: size / 2,
    canvas,
    raw: { nativeHitSpark: true, variant: group, frame: index },
  };
}

function drawSpark(context: CanvasRenderingContext2D, variant: HitSparkVariant, frame: number, size: number): void {
  const center = size / 2;
  const progress = frame / 2;
  const radius = variant.radius * (1 + progress * 0.28);
  context.clearRect(0, 0, size, size);
  context.globalCompositeOperation = "lighter";

  const glow = context.createRadialGradient(center, center, 1, center, center, radius * 1.2);
  glow.addColorStop(0, rgba(variant.core, 0.95 - progress * 0.25));
  glow.addColorStop(0.45, rgba(variant.edge, 0.58 - progress * 0.18));
  glow.addColorStop(1, rgba(variant.accent, 0));
  context.fillStyle = glow;
  context.beginPath();
  context.arc(center, center, radius * 1.25, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.translate(center, center);
  context.rotate(frame * 0.36);
  context.strokeStyle = rgba(variant.edge, 0.88 - progress * 0.2);
  context.lineWidth = 5 - progress;
  for (let ray = 0; ray < 8; ray += 1) {
    const angle = (Math.PI * 2 * ray) / 8;
    const inner = radius * 0.22;
    const outer = radius * (ray % 2 === 0 ? 1.15 : 0.78);
    context.beginPath();
    context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    context.stroke();
  }
  context.restore();

  context.fillStyle = rgba(variant.core, 0.96 - progress * 0.2);
  context.beginPath();
  context.arc(center, center, 9 - progress * 2.4, 0, Math.PI * 2);
  context.fill();
}

function rgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}
