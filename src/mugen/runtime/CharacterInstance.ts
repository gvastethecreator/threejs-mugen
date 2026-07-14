import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { CharacterRuntimeState } from "./types";

export class CharacterInstance {
  readonly state: CharacterRuntimeState;
  private frameElapsed = 0;

  constructor(
    private readonly animations: Map<number, MugenAnimationAction>,
    initialActionId: number | undefined,
  ) {
    this.state = {
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      facing: 1,
      stateNo: 0,
      animNo: initialActionId ?? 0,
      animTime: 0,
      frameIndex: 0,
      lifeMax: 1000,
      life: 1000,
      dizzyPointsMax: 1000,
      dizzyPoints: 1000,
      redLife: 0,
      powerMax: 3000,
      power: 0,
      ctrl: true,
      stateType: "S",
      moveType: "I",
      physics: "S",
      vars: Array.from({ length: 60 }, () => 0),
      fvars: Array.from({ length: 40 }, () => 0),
    };
  }

  selectAction(actionId: number): void {
    this.state.animNo = actionId;
    this.state.frameIndex = 0;
    this.state.animTime = 0;
    this.frameElapsed = 0;
  }

  step(ticks = 1): void {
    for (let tick = 0; tick < ticks; tick += 1) {
      this.advanceOneTick();
    }
  }

  getAction(): MugenAnimationAction | undefined {
    return this.animations.get(this.state.animNo);
  }

  private advanceOneTick(): void {
    const action = this.getAction();
    if (!action || action.frames.length === 0) {
      return;
    }

    this.state.animTime += 1;
    const frame = action.frames[this.state.frameIndex];
    const duration = Math.max(1, frame?.duration ?? 1);
    this.frameElapsed += 1;
    if (this.frameElapsed < duration) {
      return;
    }

    this.frameElapsed = 0;
    const nextFrame = this.state.frameIndex + 1;
    if (nextFrame < action.frames.length) {
      this.state.frameIndex = nextFrame;
    } else {
      this.state.frameIndex = action.loopStart ?? 0;
    }
  }
}
