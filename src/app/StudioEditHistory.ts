export type StudioProjectEditState = {
  projectName: string;
  p1: string;
  p2: string;
  stage: string;
};

type StudioEdit = {
  before: StudioProjectEditState;
  after: StudioProjectEditState;
};

export class StudioEditHistory {
  private readonly undoStack: StudioEdit[] = [];
  private readonly redoStack: StudioEdit[] = [];

  constructor(private readonly limit = 50) {}

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  get undoCount(): number {
    return this.undoStack.length;
  }

  get redoCount(): number {
    return this.redoStack.length;
  }

  reset(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }

  record(before: StudioProjectEditState, after: StudioProjectEditState): boolean {
    if (sameState(before, after)) {
      return false;
    }
    this.undoStack.push({ before: cloneState(before), after: cloneState(after) });
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
    this.redoStack.length = 0;
    return true;
  }

  undo(current: StudioProjectEditState): StudioProjectEditState | undefined {
    const edit = this.undoStack.at(-1);
    if (!edit || !sameState(edit.after, current)) {
      return undefined;
    }
    this.undoStack.pop();
    this.redoStack.push(edit);
    return cloneState(edit.before);
  }

  redo(current: StudioProjectEditState): StudioProjectEditState | undefined {
    const edit = this.redoStack.at(-1);
    if (!edit || !sameState(edit.before, current)) {
      return undefined;
    }
    this.redoStack.pop();
    this.undoStack.push(edit);
    return cloneState(edit.after);
  }
}

function sameState(left: StudioProjectEditState, right: StudioProjectEditState): boolean {
  return left.projectName === right.projectName && left.p1 === right.p1 && left.p2 === right.p2 && left.stage === right.stage;
}

function cloneState(state: StudioProjectEditState): StudioProjectEditState {
  return { ...state };
}
