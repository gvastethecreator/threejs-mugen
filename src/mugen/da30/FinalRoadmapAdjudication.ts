/**
 * DA30-120: final product/SDK roadmap adjudication for DA30 recovery series.
 */

import { recalculateScores } from "./ScoreRecalculation";
import { runAdversarialReview } from "./AdversarialReview";
import { runLocalReleaseRehearsal } from "./LocalReleaseRehearsal";

export function adjudicateFinalRoadmap(headSha: string): {
  schema: "Da30FinalRoadmapAdjudication/v1";
  ok: boolean;
  headSha: string;
  shipped: string[];
  localOnly: string[];
  experimental: string[];
  blocked: string[];
  scores: Record<string, string>;
  nextProgram: string;
  releaseAuthority: string;
} {
  const scores = recalculateScores(false);
  const review = runAdversarialReview(headSha);
  const rehearsal = runLocalReleaseRehearsal();

  return {
    schema: "Da30FinalRoadmapAdjudication/v1",
    ok: scores.ok && review.ok && rehearsal.ok,
    headSha,
    shipped: [
      "play-native-route",
      "selection-model",
      "control-source",
      "bounded-combat-stack-models",
      "scanner-safety-limits",
    ],
    localOnly: [
      "studio-writes",
      "export-bundle",
      "cli-adapter-contract",
      "second-consumer-platformer-model",
    ],
    experimental: ["zss-subset", "team-tag-topology", "motif-flow-model"],
    blocked: [
      "public-release",
      "hosted-preview-deploy",
      "lua-host",
      "network-rollback",
      "score-movement",
      "DA29-watermark",
    ],
    scores: scores.scores,
    nextProgram: "DA31 — deepen browser product gates and independent score movement adjudication",
    releaseAuthority: "local-only; no public release authority from DA30-120",
  };
}
