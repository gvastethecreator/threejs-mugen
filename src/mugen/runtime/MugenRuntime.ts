import type { MugenAnimationAction } from "../model/MugenAnimation";
import { CharacterInstance } from "./CharacterInstance";
import { trainingStage } from "./demoStage";
import type { MugenSnapshot, RuntimeCommand, SnapshotRuntime } from "./types";

export class MugenRuntime implements SnapshotRuntime {
  private tick = 0;
  private playing = true;
  private speed = 1;
  private readonly actor: CharacterInstance;
  private readonly logs: string[] = [];
  private toggles = {
    showClsn1: true,
    showClsn2: true,
    showAxis: true,
    showGrid: true,
  };

  constructor(animations: Map<number, MugenAnimationAction>) {
    const firstAction = [...animations.keys()].sort((a, b) => a - b)[0];
    this.actor = new CharacterInstance(animations, firstAction);
  }

  dispatch(command: RuntimeCommand): MugenSnapshot {
    if (command.type === "select-action") {
      this.actor.selectAction(command.actionId);
      this.logs.unshift(`Selected Action ${command.actionId}`);
    } else if (command.type === "set-playing") {
      this.playing = command.playing;
    } else if (command.type === "step") {
      this.step(command.ticks ?? 1);
    } else if (command.type === "set-speed") {
      this.speed = Math.max(0.1, Math.min(4, command.speed));
    } else if (command.type === "toggle") {
      this.toggles = { ...this.toggles, [command.key]: command.value };
    }

    return this.getSnapshot();
  }

  step(ticks = 1): MugenSnapshot {
    const scaledTicks = Math.max(1, Math.round(ticks * this.speed));
    this.actor.step(scaledTicks);
    this.tick += scaledTicks;
    return this.getSnapshot();
  }

  getSnapshot(): MugenSnapshot {
    const action = this.actor.getAction();
    const frame = action?.frames[this.actor.state.frameIndex];
    return {
      tick: this.tick,
      selectedActionId: this.actor.state.animNo,
      selectedAction: action,
      playing: this.playing,
      speed: this.speed,
      ...this.toggles,
      stage: {
        id: trainingStage.id,
        displayName: trainingStage.displayName,
        floorY: trainingStage.floorY,
        zOffset: trainingStage.zOffset,
        bounds: trainingStage.bounds,
        camera: { x: 72, y: trainingStage.camera.startY, zoom: trainingStage.camera.zoom },
        layers: trainingStage.layers,
        animations: trainingStage.animations,
      },
      actors: [
        {
          id: "p1",
          label: "P1",
          actorKind: "player",
          ownerId: "p1",
          rootId: "p1",
          parentId: "p1",
          spriteOwnerId: "p1",
          spriteOwnerDefinitionId: "inspector",
          spriteOwnerLabel: "P1",
          runtime: structuredClone(this.actor.state),
          frame,
          clsn1: frame?.clsn1.map((box) => ({ ...box })) ?? [],
          clsn2: frame?.clsn2.map((box) => ({ ...box })) ?? [],
        },
        createDummyActor(),
      ],
      logs: this.logs.slice(0, 80),
    };
  }
}

function createDummyActor(): MugenSnapshot["actors"][number] {
  return {
    id: "p2",
    label: "Dummy P2",
    actorKind: "player",
    ownerId: "p2",
    rootId: "p2",
    parentId: "p2",
    spriteOwnerId: "p2",
    spriteOwnerDefinitionId: "dummy",
    spriteOwnerLabel: "Dummy P2",
    runtime: {
      pos: { x: 180, y: 0 },
      vel: { x: 0, y: 0 },
      facing: -1,
      stateNo: 0,
      animNo: 0,
      animTime: 0,
      frameIndex: 0,
      life: 1000,
      redLife: 0,
      power: 0,
      ctrl: false,
      stateType: "S",
      moveType: "I",
      physics: "S",
      vars: [],
      fvars: [],
    },
    clsn1: [],
    clsn2: [{ x1: -24, y1: -92, x2: 24, y2: 0 }],
  };
}
