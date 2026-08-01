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

[Statedef -1]
[State -1, Stand Punch]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = statetype = S
trigger1 = ctrl

[State -1, Stand Kick]
type = ChangeState
value = 210
triggerall = command = "a"
trigger1 = statetype = S
trigger1 = ctrl
