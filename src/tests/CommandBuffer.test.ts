import { describe, expect, it } from "vitest";
import type { MugenCommand } from "../mugen/model/MugenCommand";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { CommandBuffer } from "../mugen/runtime/CommandBuffer";

describe("CommandBuffer", () => {
  it("exposes a bounded chronological input history for debug surfaces", () => {
    const buffer = new CommandBuffer(3);

    buffer.push(10, ["x", "F"]);
    buffer.push(11, []);
    buffer.push(12, ["D"], { hitPause: true });
    buffer.push(13, ["a"]);

    expect(buffer.getHistory()).toEqual([
      { frame: 11, values: [], hitPause: false },
      { frame: 12, values: ["D"], hitPause: true },
      { frame: 13, values: ["a"], hitPause: false },
    ]);
    expect(buffer.getHistory(2)).toEqual([
      { frame: 12, values: ["D"], hitPause: true },
      { frame: 13, values: ["a"], hitPause: false },
    ]);
  });

  it("clears pending input history when an intro skip resets an actor", () => {
    const buffer = new CommandBuffer();
    buffer.push(10, ["x"]);

    buffer.clear();

    expect(buffer.getHistory()).toEqual([]);
  });

  it("detects quarter-circle commands using derived diagonal samples", () => {
    const commands = commandsFrom(`
[Command]
name = "QCF_x"
command = ~D, DF, F, x
time = 15
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    buffer.push(2, ["D", "F", "DF"]);
    buffer.push(3, ["F"]);
    buffer.push(4, ["x"]);

    expect(buffer.isCommandActive("QCF_x", commands)).toBe(true);
  });

  it("detects KFM-style QCF while not treating held forward as a dash", () => {
    const commands = commandsFrom(`
[Defaults]
command.time = 15
command.buffer.time = 1

[Command]
name = "QCF_x"
command = ~D, DF, F, x

[Command]
name = "FF"
command = F, F
time = 10

[Command]
name = "x"
command = x
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    buffer.push(2, ["D", "F", "DF"]);
    buffer.push(3, ["F"]);
    buffer.push(4, ["F", "x"]);

    expect(buffer.isCommandActive("QCF_x", commands)).toBe(true);
    expect(buffer.isCommandActive("FF", commands)).toBe(false);
    expect(buffer.isCommandActive("x", commands)).toBe(true);
  });

  it("requires a fresh button press for plain button commands", () => {
    const commands = commandsFrom(`
[Defaults]
command.buffer.time = 1

[Command]
name = "x"
command = x
time = 10
`);
    const fresh = new CommandBuffer();
    fresh.push(1, ["x"]);

    const held = new CommandBuffer();
    held.push(1, ["x"]);
    held.push(2, ["x"]);
    held.push(3, ["x"]);

    expect(fresh.isCommandActive("x", commands)).toBe(true);
    expect(held.isCommandActive("x", commands)).toBe(false);
  });

  it("does not confuse back direction B with button b", () => {
    const commands = commandsFrom(`
[Command]
name = "button_b"
command = b

[Command]
name = "holdback"
command = /$B
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["B"]);

    expect(buffer.isCommandActive("button_b", commands)).toBe(false);
    expect(buffer.isCommandActive("holdback", commands)).toBe(true);
  });

  it("matches slash-modified hold commands while a button remains pressed", () => {
    const commands = commandsFrom(`
[Command]
name = "hold_x"
command = /x
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["x"]);
    buffer.push(2, ["x"]);
    buffer.push(3, ["x"]);

    expect(buffer.isCommandActive("hold_x", commands)).toBe(true);
  });

  it("matches tilde-modified button release commands", () => {
    const commands = commandsFrom(`
[Command]
name = "release_x"
command = ~x
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["x"]);
    buffer.push(2, []);

    expect(buffer.isCommandActive("release_x", commands)).toBe(true);
  });

  it("matches tilde direction release in the same sample as the next diagonal step", () => {
    const commands = commandsFrom(`
[Command]
name = "release_down_to_diagonal"
command = ~D, DF
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    buffer.push(2, ["D", "F", "DF"]);

    expect(buffer.isCommandActive("release_down_to_diagonal", commands)).toBe(true);
  });

  it("matches numeric charged direction release commands", () => {
    const commands = commandsFrom(`
[Command]
name = "charged_down"
command = ~5$D, F, x
time = 20
steptime = 10
`);
    const buffer = new CommandBuffer();

    for (let frame = 1; frame <= 5; frame += 1) {
      buffer.push(frame, ["D"]);
    }
    buffer.push(6, ["F"]);
    buffer.push(7, ["F", "x"]);

    expect(buffer.isCommandActive("charged_down", commands)).toBe(true);
  });

  it("rejects charged releases when the held direction is too short", () => {
    const commands = commandsFrom(`
[Command]
name = "charged_down"
command = ~5$D, F, x
time = 20
steptime = 10
`);
    const buffer = new CommandBuffer();

    for (let frame = 1; frame <= 4; frame += 1) {
      buffer.push(frame, ["D"]);
    }
    buffer.push(5, ["F"]);
    buffer.push(6, ["F", "x"]);

    expect(buffer.isCommandActive("charged_down", commands)).toBe(false);
  });

  it("matches numeric slash hold charge commands", () => {
    const commands = commandsFrom(`
[Command]
name = "charged_hold"
command = /5x
time = 20
`);
    const buffer = new CommandBuffer();

    for (let frame = 1; frame <= 5; frame += 1) {
      buffer.push(frame, ["x"]);
    }

    expect(buffer.isCommandActive("charged_hold", commands)).toBe(true);
  });

  it("requires a fresh direction activation for repeated direction commands", () => {
    const commands = commandsFrom(`
[Command]
name = "FF"
command = F, F
time = 10
`);
    const held = new CommandBuffer();
    held.push(1, ["F"]);
    held.push(2, ["F"]);
    held.push(3, ["F"]);
    expect(held.isCommandActive("FF", commands)).toBe(false);

    const tapped = new CommandBuffer();
    tapped.push(1, ["F"]);
    tapped.push(2, []);
    tapped.push(3, ["F"]);
    expect(tapped.isCommandActive("FF", commands)).toBe(true);
  });

  it("matches dollar direction families for hold-style commands", () => {
    const commands = commandsFrom(`
[Command]
name = "down_a"
command = /$D, a
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D", "F", "DF"]);
    buffer.push(2, ["a"]);

    expect(buffer.isCommandActive("down_a", commands)).toBe(true);
  });

  it("limits the gap between matched command steps with steptime", () => {
    const commands = commandsFrom(`
[Command]
name = "tight_qcf"
command = D, F, x
time = 40
steptime = 5
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    buffer.push(2, []);
    buffer.push(3, []);
    buffer.push(4, []);
    buffer.push(5, ["F"]);
    buffer.push(6, []);
    buffer.push(7, ["x"]);

    expect(buffer.isCommandActive("tight_qcf", commands)).toBe(true);
  });

  it("rejects commands whose steps are inside command time but outside steptime", () => {
    const commands = commandsFrom(`
[Command]
name = "tight_qcf"
command = D, F, x
time = 40
steptime = 5
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    for (let frame = 2; frame <= 15; frame += 1) {
      buffer.push(frame, []);
    }
    buffer.push(16, ["F"]);
    buffer.push(17, ["x"]);

    expect(buffer.isCommandActive("tight_qcf", commands)).toBe(false);
  });

  it("requires plus-combo buttons in the same input sample", () => {
    const commands = commandsFrom(`
[Command]
name = "two"
command = x+y
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["x"]);
    buffer.push(2, ["y"]);
    expect(buffer.isCommandActive("two", commands)).toBe(false);

    const freshCombo = new CommandBuffer();
    freshCombo.push(1, ["x", "y"]);
    expect(freshCombo.isCommandActive("two", commands)).toBe(true);
  });

  it("matches pipe alternatives inside the same command step", () => {
    const commands = commandsFrom(`
[Command]
name = "either"
command = x|y
time = 10
`);
    const xBuffer = new CommandBuffer();
    xBuffer.push(1, ["x"]);

    const yBuffer = new CommandBuffer();
    yBuffer.push(1, ["y"]);

    const missBuffer = new CommandBuffer();
    missBuffer.push(1, ["z"]);

    expect(xBuffer.isCommandActive("either", commands)).toBe(true);
    expect(yBuffer.isCommandActive("either", commands)).toBe(true);
    expect(missBuffer.isCommandActive("either", commands)).toBe(false);
  });

  it("keeps pipe alternatives scoped to a same-frame plus combo part", () => {
    const commands = commandsFrom(`
[Command]
name = "either_combo"
command = x+y|z
time = 10
`);
    const split = new CommandBuffer();
    split.push(1, ["x"]);
    split.push(2, ["z"]);

    const combo = new CommandBuffer();
    combo.push(1, ["x", "z"]);

    expect(split.isCommandActive("either_combo", commands)).toBe(false);
    expect(combo.isCommandActive("either_combo", commands)).toBe(true);
  });

  it("matches pipe alternatives for directions", () => {
    const commands = commandsFrom(`
[Command]
name = "low"
command = D|DF, x
time = 10
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D", "F", "DF"]);
    buffer.push(2, ["x"]);

    expect(buffer.isCommandActive("low", commands)).toBe(true);
  });

  it("accepts duplicate command definitions with the same name", () => {
    const commands = commandsFrom(`
[Command]
name = "Palm"
command = ~D, DF, F, x
time = 15

[Command]
name = "Palm"
command = ~D, DF, F, y
time = 15
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["D"]);
    buffer.push(2, ["D", "F", "DF"]);
    buffer.push(3, ["F"]);
    buffer.push(4, ["y"]);

    expect(buffer.isCommandActive("Palm", commands)).toBe(true);
  });

  it("honors CMD button remap and disables blank remapped buttons", () => {
    const commands = commandsFrom(`
[Remap]
x = y
z =

[Command]
name = "remapped_x"
command = x

[Command]
name = "disabled_z"
command = z
`);
    const original = new CommandBuffer();
    original.push(1, ["x"]);

    const remapped = new CommandBuffer();
    remapped.push(1, ["y"]);

    const disabled = new CommandBuffer();
    disabled.push(1, ["z"]);

    expect(original.isCommandActive("remapped_x", commands)).toBe(false);
    expect(remapped.isCommandActive("remapped_x", commands)).toBe(true);
    expect(disabled.isCommandActive("disabled_z", commands)).toBe(false);
  });

  it("keeps hitpause-buffered commands alive while hitpause samples do not age", () => {
    const commands = commandsFrom(`
[Defaults]
command.buffer.time = 1
command.buffer.hitpause = 1

[Command]
name = "hp_x"
command = x
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["x"], { hitPause: true });
    for (let frame = 2; frame <= 12; frame += 1) {
      buffer.push(frame, [], { hitPause: true });
    }
    buffer.push(13, []);

    expect(buffer.isCommandActive("hp_x", commands)).toBe(true);
  });

  it("does not use hitpause samples for commands that opt out of hitpause buffering", () => {
    const commands = commandsFrom(`
[Defaults]
command.buffer.time = 1
command.buffer.hitpause = 0

[Command]
name = "no_hp_x"
command = x
`);
    const buffer = new CommandBuffer();

    buffer.push(1, ["x"], { hitPause: true });
    buffer.push(2, [], { hitPause: true });
    buffer.push(3, []);

    expect(buffer.isCommandActive("no_hp_x", commands)).toBe(false);
  });
});

function commandsFrom(text: string): MugenCommand[] {
  return parseCmd(text).commands;
}
