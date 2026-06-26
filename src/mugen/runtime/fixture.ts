import type { MugenAnimationAction } from "../model/MugenAnimation";

export function createFixtureAnimations(): Map<number, MugenAnimationAction> {
  return new Map([
    [
      0,
      {
        id: 0,
        loopStart: 0,
        rawLines: ["[Begin Action 0]"],
        frames: [
          {
            spriteGroup: 0,
            spriteIndex: 0,
            offsetX: 0,
            offsetY: 0,
            duration: 7,
            clsn1: [],
            clsn2: [{ x1: -22, y1: -88, x2: 22, y2: 0 }],
            raw: "0,0,0,0,7",
            line: 1,
          },
          {
            spriteGroup: 0,
            spriteIndex: 1,
            offsetX: 0,
            offsetY: 0,
            duration: 7,
            clsn1: [],
            clsn2: [{ x1: -24, y1: -90, x2: 24, y2: 0 }],
            raw: "0,1,0,0,7",
            line: 2,
          },
        ],
      },
    ],
    [
      200,
      {
        id: 200,
        rawLines: ["[Begin Action 200]"],
        frames: [
          {
            spriteGroup: 200,
            spriteIndex: 0,
            offsetX: 0,
            offsetY: 0,
            duration: 4,
            clsn1: [],
            clsn2: [{ x1: -25, y1: -86, x2: 24, y2: 0 }],
            raw: "200,0,0,0,4",
            line: 1,
          },
          {
            spriteGroup: 200,
            spriteIndex: 1,
            offsetX: 3,
            offsetY: 0,
            duration: 5,
            clsn1: [{ x1: 18, y1: -70, x2: 78, y2: -38 }],
            clsn2: [{ x1: -24, y1: -88, x2: 24, y2: 0 }],
            raw: "200,1,3,0,5",
            line: 2,
          },
          {
            spriteGroup: 200,
            spriteIndex: 2,
            offsetX: 1,
            offsetY: 0,
            duration: 6,
            clsn1: [],
            clsn2: [{ x1: -25, y1: -86, x2: 24, y2: 0 }],
            raw: "200,2,1,0,6",
            line: 3,
          },
        ],
      },
    ],
  ]);
}
