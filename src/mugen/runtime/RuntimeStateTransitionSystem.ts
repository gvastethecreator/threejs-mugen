import type { MugenStateController, MugenStateSpecial } from "../model/MugenState";

/**
 * A ChangeState that was resolved and applied while executing one controller list.
 * The caller can use it to continue the destination state in the same tick.
 */
export type RuntimeStateTransition<TController = MugenStateController> = {
  fromState: number;
  fromSpecial?: MugenStateSpecial;
  toState: number;
  controller: TController;
};

export type RuntimeStateTransitionCycleDiagnostic = {
  fromState: number;
  fromSpecial?: MugenStateSpecial;
  toState: number;
  controller: string;
  budget: number;
};

/**
 * CNS state execution is bounded so malformed imported content cannot hang a frame.
 * Keep this shared by root and helper execution so their safety behavior stays aligned.
 */
export const RUNTIME_CURRENT_STATE_TRANSITION_BUDGET = 32;
