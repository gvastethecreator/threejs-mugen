export type MugenInputState = Set<string>;

const keyMap = new Map<string, string>([
  ["ArrowLeft", "B"],
  ["ArrowDown", "D"],
  ["ArrowRight", "F"],
  ["ArrowUp", "U"],
  ["a", "x"],
  ["s", "y"],
  ["d", "z"],
  ["z", "a"],
  ["x", "b"],
  ["c", "c"],
  ["Enter", "s"],
]);

export function mapKeyboardKey(key: string): string | undefined {
  return keyMap.get(key);
}

export class KeyboardInputAdapter {
  private readonly physicalPressed = new Set<string>();
  private readonly virtualPressed = new Set<string>();

  constructor(private readonly target: Window = window) {}

  start(): void {
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("blur", this.onBlur);
  }

  stop(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("blur", this.onBlur);
  }

  getState(): MugenInputState {
    return addDerivedDirections(new Set([...this.physicalPressed, ...this.virtualPressed]));
  }

  setVirtualIntent(intent: string, active: boolean): void {
    if (active) {
      this.virtualPressed.add(intent);
    } else {
      this.virtualPressed.delete(intent);
    }
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const mapped = mapKeyboardKey(event.key);
    if (mapped) {
      event.preventDefault();
      this.physicalPressed.add(mapped);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const mapped = mapKeyboardKey(event.key);
    if (mapped) {
      event.preventDefault();
      this.physicalPressed.delete(mapped);
    }
  };

  private readonly onBlur = (): void => {
    this.physicalPressed.clear();
    this.virtualPressed.clear();
  };
}

function addDerivedDirections(values: Set<string>): Set<string> {
  const result = new Set(values);
  if (values.has("D") && values.has("F")) {
    result.add("DF");
  }
  if (values.has("D") && values.has("B")) {
    result.add("DB");
  }
  if (values.has("U") && values.has("F")) {
    result.add("UF");
  }
  if (values.has("U") && values.has("B")) {
    result.add("UB");
  }
  return result;
}
