import { describe, expect, it } from "vitest";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { parseCns } from "../mugen/parsers/CnsParser";

describe("CMD and CNS parsers", () => {
  it("tokenizes common command syntax", () => {
    const parsed = parseCmd(`
[Command]
name = "hadouken"
command = ~D, DF, F, x
time = 15
`);

    expect(parsed.commands[0]?.name).toBe("hadouken");
    expect(parsed.commands[0]?.sequence.map((token) => token.raw)).toEqual(["~", "D", ",", "DF", ",", "F", ",", "x"]);
    expect(parsed.commands[0]?.time).toBe(15);
    expect(parsed.commands[0]?.stepTime).toBe(15);
    expect(parsed.commands[0]?.bufferTime).toBe(1);
  });

  it("tokenizes command alternatives with the pipe operator", () => {
    const parsed = parseCmd(`
[Command]
name = "either"
command = ~D|DF, x|y+z
`);

    expect(parsed.commands[0]?.sequence.map((token) => [token.raw, token.type])).toEqual([
      ["~", "modifier"],
      ["D", "direction"],
      ["|", "alternative"],
      ["DF", "direction"],
      [",", "separator"],
      ["x", "button"],
      ["|", "alternative"],
      ["y", "button"],
      ["+", "combo"],
      ["z", "button"],
    ]);
    expect(parsed.commands[0]?.resolvedCommand).toBe("~ D | DF , x | y + z");
  });

  it("tokenizes numeric charge modifiers", () => {
    const parsed = parseCmd(`
[Command]
name = "charged"
command = ~30$D, F, x
`);

    expect(parsed.commands[0]?.sequence.map((token) => [token.raw, token.type, token.chargeTime])).toEqual([
      ["~30", "modifier", 30],
      ["$", "modifier", undefined],
      ["D", "direction", undefined],
      [",", "separator", undefined],
      ["F", "direction", undefined],
      [",", "separator", undefined],
      ["x", "button", undefined],
    ]);
    expect(parsed.commands[0]?.resolvedCommand).toBe("~30 $ D , F , x");
  });

  it("uses command.time defaults for commands without an explicit time", () => {
    const parsed = parseCmd(`
[Defaults]
command.time = 17
command.steptime = 6
command.buffer.time = 4

[Command]
name = "x"
command = x
`);

    expect(parsed.commands[0]?.time).toBe(17);
    expect(parsed.commands[0]?.stepTime).toBe(6);
    expect(parsed.commands[0]?.bufferTime).toBe(4);
    expect(parsed.commands[0]?.bufferHitPause).toBe(true);
    expect(parsed.defaults.stepTime).toBe(6);
  });

  it("allows per-command steptime and falls back to command time when not set", () => {
    const parsed = parseCmd(`
[Defaults]
command.time = 15

[Command]
name = "slow"
command = D, F, x
time = 40

[Command]
name = "tight"
command = D, F, y
time = 40
steptime = 5
`);

    expect(parsed.commands[0]?.time).toBe(40);
    expect(parsed.commands[0]?.stepTime).toBe(40);
    expect(parsed.commands[1]?.time).toBe(40);
    expect(parsed.commands[1]?.stepTime).toBe(5);
  });

  it("parses default and per-command hitpause buffering flags", () => {
    const parsed = parseCmd(`
[Defaults]
command.buffer.hitpause = 0

[Command]
name = "no_hp"
command = x

[Command]
name = "yes_hp"
command = y
buffer.hitpause = 1
`);

    expect(parsed.defaults.bufferHitPause).toBe(false);
    expect(parsed.commands[0]?.bufferHitPause).toBe(false);
    expect(parsed.commands[1]?.bufferHitPause).toBe(true);
  });

  it("parses button remap before tokenizing command inputs", () => {
    const parsed = parseCmd(`
[Remap]
x = y
a = b
z =

[Command]
name = "remapped"
command = ~D, F, x+a

[Command]
name = "disabled"
command = z
`);

    expect(parsed.remap).toMatchObject({ x: "y", a: "b", z: "" });
    expect(parsed.commands[0]).toMatchObject({
      name: "remapped",
      rawCommand: "~D, F, x+a",
      resolvedCommand: "~ D , F , y + b",
      remapped: true,
      disabled: false,
    });
    expect(parsed.commands[0]?.sequence.map((token) => token.raw)).toEqual(["~", "D", ",", "F", ",", "y", "+", "b"]);
    expect(parsed.commands[1]).toMatchObject({
      name: "disabled",
      disabled: true,
      disabledReason: "Remap disables z",
    });
  });

  it("indexes statedefs and controllers", () => {
    const parsed = parseCns(`
[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0
velset = 0,0
hitdefpersist = 1
movehitpersist = 1
hitcountpersist = 1

[State 200, HitDef]
type = HitDef
trigger1 = AnimElem = 3
damage = 30
`);

    expect(parsed.states[0]?.id).toBe(200);
    expect(parsed.states[0]?.anim).toBe(200);
    expect(parsed.states[0]?.velSet).toEqual([0, 0]);
    expect(parsed.states[0]?.hitDefPersist).toBe(true);
    expect(parsed.states[0]?.moveHitPersist).toBe(true);
    expect(parsed.states[0]?.hitCountPersist).toBe(true);
    expect(parsed.controllers[0]?.type).toBe("HitDef");
    expect(parsed.controllers[0]?.triggers[0]?.expression).toBe("AnimElem = 3");
  });

  it("indexes Data, Movement, Velocity, and Size constants for runtime Const lookups", () => {
    const parsed = parseCns(`
[Data]
life = 1000
power = 3000
attack = 150
defence = 200
liedown.time = 60

[Movement]
yaccel = .44
down.bounce.offset = 0, 20
down.bounce.yaccel = .4
down.bounce.groundlevel = 12

[Velocity]
air.gethit.groundrecover = -.15,-3.5

[Size]
head.pos = 5,-120
mid.pos = 2,-64
depth = 2,5
attack.depth = 7
stand.sizebox = -18,-70,20,2
`);

    expect(parsed.constants["data.life"]).toBe(1000);
    expect(parsed.constants["data.power"]).toBe(3000);
    expect(parsed.constants["data.attack"]).toBe(150);
    expect(parsed.constants["data.defence"]).toBe(200);
    expect(parsed.constants["data.liedown.time"]).toBe(60);
    expect(parsed.constants["movement.yaccel"]).toBe(0.44);
    expect(parsed.constants["movement.down.bounce.offset.x"]).toBe(0);
    expect(parsed.constants["movement.down.bounce.offset.y"]).toBe(20);
    expect(parsed.constants["movement.down.bounce.yaccel"]).toBe(0.4);
    expect(parsed.constants["movement.down.bounce.groundlevel"]).toBe(12);
    expect(parsed.constants["velocity.air.gethit.groundrecover.x"]).toBe(-0.15);
    expect(parsed.constants["velocity.air.gethit.groundrecover.y"]).toBe(-3.5);
    expect(parsed.constants["size.head.pos.x"]).toBe(5);
    expect(parsed.constants["size.head.pos.y"]).toBe(-120);
    expect(parsed.constants["size.mid.pos.x"]).toBe(2);
    expect(parsed.constants["size.mid.pos.y"]).toBe(-64);
    expect(parsed.constants["size.depth.top"]).toBe(2);
    expect(parsed.constants["size.depth.bottom"]).toBe(5);
    expect(parsed.constants["size.attack.depth.top"]).toBe(7);
    expect(parsed.constants["size.attack.depth.bottom"]).toBe(7);
    expect(parsed.constants["size.stand.sizebox.left"]).toBe(-18);
    expect(parsed.constants["size.stand.sizebox.top"]).toBe(-70);
    expect(parsed.constants["size.stand.sizebox.right"]).toBe(20);
    expect(parsed.constants["size.stand.sizebox.bottom"]).toBe(2);
  });

  it("indexes custom Constants with case-insensitive names", () => {
    const parsed = parseCns(`
[Constants]
Default.LifeToDizzyPointsMul = 1.25
Super.LifeToDizzyPointsMul = 0
`);

    expect(parsed.constants).toMatchObject({
      "default.lifetodizzypointsmul": 1.25,
      "super.lifetodizzypointsmul": 0,
    });
  });

  it("indexes triggerall in command state-entry controllers", () => {
    const parsed = parseCns(`
[State -1, Stand Light Punch]
type = ChangeState
value = 200
triggerall = command = "x"
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl
`);

    expect(parsed.controllers[0]?.stateId).toBe(-1);
    expect(parsed.controllers[0]?.triggers.map((trigger) => [trigger.index, trigger.expression])).toEqual([
      [0, 'command = "x"'],
      [0, 'command != "holddown"'],
      [1, "statetype = S"],
      [1, "ctrl"],
    ]);
  });
});
