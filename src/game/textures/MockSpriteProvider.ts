import type { MugenSprite, SpriteProvider } from "../../mugen/model/MugenSprite";

export class MockSpriteProvider implements SpriteProvider {
  async getSprite(group: number, index: number): Promise<MugenSprite> {
    const size = getSpriteSize(group, index);
    return {
      group,
      index,
      width: size.width,
      height: size.height,
      axisX: Math.round(size.width / 2),
      axisY: size.height - 8,
      canvas: createMockCanvas(group, index, size.width, size.height),
      raw: { mock: true },
    };
  }
}

function getSpriteSize(group: number, index: number): { width: number; height: number } {
  const action = group % 1000;
  if (group >= 10000) {
    if (action === 10) {
      return { width: 82, height: 92 };
    }
    if (action === 40) {
      return { width: 82, height: 118 };
    }
    if (action === 200) {
      return { width: 116, height: 118 };
    }
    if (action === 210) {
      return { width: 128, height: 112 };
    }
    if (action === 500) {
      return { width: 94, height: 108 };
    }
    return { width: 82 + (index % 2) * 6, height: 118 };
  }
  return {
    width: 68 + Math.abs((group * 13 + index * 7) % 28),
    height: 104 + Math.abs((group * 11 + index * 5) % 24),
  };
}

function createMockCanvas(group: number, index: number, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }
  context.clearRect(0, 0, width, height);
  const palette = getPalette(group);
  const action = group % 1000;
  context.fillStyle = "rgba(0,0,0,0.22)";
  context.beginPath();
  context.ellipse(width / 2, height - 7, width * 0.3, 4, 0, 0, Math.PI * 2);
  context.fill();
  drawFighter(context, { action, frame: index, width, height, fill: palette.fill, stroke: palette.stroke });
  context.fillStyle = "rgba(255,255,255,0.55)";
  context.font = "9px monospace";
  context.textAlign = "center";
  context.fillText(`${group}:${index}`, width / 2, height - 12);
  return canvas;
}

function getPalette(group: number): { fill: string; stroke: string } {
  const family = Math.floor(group / 1000) * 1000;
  if (family === 10000) {
    return { fill: "#4458d8", stroke: "#b9c3ff" };
  }
  if (family === 11000) {
    return { fill: "#b13f7a", stroke: "#ffd0e6" };
  }
  const hue = Math.abs((group * 37) % 360);
  return { fill: `hsl(${hue} 55% 42%)`, stroke: "rgba(255,255,255,0.72)" };
}

function drawFighter(
  context: CanvasRenderingContext2D,
  options: { action: number; frame: number; width: number; height: number; fill: string; stroke: string },
): void {
  const { action, frame, width, height, fill, stroke } = options;
  const center = width * 0.5;
  const floor = height - 8;
  const crouch = action === 10;
  const jump = action === 40;
  const hitstun = action === 500;
  const punch = action === 200;
  const kick = action === 210;
  const bob = Math.sin(frame * 1.2) * 2;
  const hipY = floor - (crouch ? 34 : 46) + (jump ? -8 : bob);
  const chestY = hipY - (crouch ? 22 : 34);
  const headY = chestY - 18;
  const lean = hitstun ? -10 : punch ? 5 : 0;

  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = stroke;
  context.fillStyle = fill;

  context.lineWidth = 10;
  drawLimb(context, center - 9 + lean, hipY, center - 22, floor - 4);
  drawLimb(context, center + 9 + lean, hipY, center + (kick ? 48 : 18), floor - (kick ? 26 : 4));

  context.lineWidth = 8;
  drawLimb(context, center - 14 + lean, chestY + 10, center - 30, chestY + 28);
  drawLimb(context, center + 14 + lean, chestY + 10, center + (punch ? 50 : 28), chestY + (punch ? 6 : 24));

  roundRect(context, center - 17 + lean, chestY - 2, 34, hipY - chestY + 14, 9);
  context.fill();
  context.stroke();

  context.beginPath();
  context.arc(center + lean + (hitstun ? -4 : 0), headY, 13, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.32)";
  roundRect(context, center - 7 + lean, chestY + 8, 14, 20, 5);
  context.fill();
}

function drawLimb(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}
