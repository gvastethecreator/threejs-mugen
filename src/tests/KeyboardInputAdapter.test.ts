import { describe, expect, it } from "vitest";
import { mapKeyboardKey } from "../game/input/KeyboardInputAdapter";

describe("KeyboardInputAdapter", () => {
  it("maps the six MUGEN attack buttons to distinct keyboard keys", () => {
    expect(mapKeyboardKey("a")).toBe("x");
    expect(mapKeyboardKey("s")).toBe("y");
    expect(mapKeyboardKey("d")).toBe("z");
    expect(mapKeyboardKey("z")).toBe("a");
    expect(mapKeyboardKey("x")).toBe("b");
    expect(mapKeyboardKey("c")).toBe("c");
  });
});
