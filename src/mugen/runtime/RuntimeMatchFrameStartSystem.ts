export type RuntimeMatchFrameStartInput<TActor> = {
  p1: TActor;
  p2: TActor;
  resetFrameFlags: (actor: TActor) => void;
  applyPreFacingAssertSpecial: (actor: TActor, opponent: TActor) => void;
  updateAutoFacing: (actor: TActor, opponent: TActor) => void;
};

export class RuntimeMatchFrameStartWorld {
  advance<TActor>(input: RuntimeMatchFrameStartInput<TActor>): void {
    input.resetFrameFlags(input.p1);
    input.resetFrameFlags(input.p2);
    input.applyPreFacingAssertSpecial(input.p1, input.p2);
    input.applyPreFacingAssertSpecial(input.p2, input.p1);
    input.updateAutoFacing(input.p1, input.p2);
    input.updateAutoFacing(input.p2, input.p1);
  }
}
