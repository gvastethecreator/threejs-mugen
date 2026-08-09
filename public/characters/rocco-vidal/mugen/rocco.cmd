[Defaults]
command.time = 15
command.buffer.time = 3

[Command]
name = "x"
command = x
time = 5

[Command]
name = "a"
command = a
time = 5

[Command]
name = "karate-special"
command = ~D, DF, F, x
time = 18

[Statedef -1]
[State -1, Karate Special]
type = ChangeState
value = 220
triggerall = command = "karate-special"
trigger1 = statetype = S
trigger1 = ctrl

[State -1, Light Strike]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = statetype = S
trigger1 = ctrl

[State -1, Heavy Strike]
type = ChangeState
value = 210
triggerall = command = "a"
trigger1 = statetype = S
trigger1 = ctrl
