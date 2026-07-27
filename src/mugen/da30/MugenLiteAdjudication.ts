/**
 * DA30-070: independent-style adjudication record for MUGEN-lite / practical-MUGEN.
 * Does not move held scores.
 */

import { buildPackageCorpusInventory } from "./PackageCorpusInventory";
import { buildUnsupportedHeavyFixtures } from "./UnsupportedHeavyFixtures";
import { runParserMutationCorpus } from "./ParserMutationCorpus";
import { runStageBreadthMatrix } from "./StageBreadthMatrix";
import { runPlayableSandboxMatrix } from "./PlayableSandboxMatrix";

export function adjudicateMugenLite(headSha: string): {
  schema: "Da30MugenLiteAdjudication/v1";
  ok: boolean;
  headSha: string;
  denominators: Record<string, number>;
  acceptedClaims: string[];
  rejectedClaims: string[];
  gaps: string[];
  scoresHeld: true;
  nextQueueHint: string[];
} {
  const corpus = buildPackageCorpusInventory();
  const heavy = buildUnsupportedHeavyFixtures();
  const mut = runParserMutationCorpus();
  const stages = runStageBreadthMatrix();
  const play = runPlayableSandboxMatrix(headSha);

  const denominators = {
    corpusRows: corpus.rows.length,
    heavyFamilies: heavy.fixtures.length,
    mutationCases: mut.cases.length,
    stageCases: stages.cases.length,
    playLanes: play.lanes.length,
  };

  const acceptedClaims = [
    corpus.ok ? "corpus-inventory" : "",
    heavy.ok ? "unsupported-heavy-fixtures" : "",
    mut.ok ? "parser-mutation-resilience" : "",
    stages.ok ? "stage-breadth-named" : "",
    play.ok ? "playable-sandbox-matrix" : "",
  ].filter(Boolean);

  const rejectedClaims = [
    "full-mugen-parity",
    "ikemen-parity",
    "score-movement",
    "public-release",
  ];

  const gaps = [
    !play.ok ? "play-matrix-incomplete" : "",
    "performance-not-in-this-cut",
    "commercial-corpus-excluded",
  ].filter(Boolean);

  return {
    schema: "Da30MugenLiteAdjudication/v1",
    ok: acceptedClaims.length >= 4 && rejectedClaims.length >= 3,
    headSha,
    denominators,
    acceptedClaims,
    rejectedClaims,
    gaps,
    scoresHeld: true,
    nextQueueHint: ["DA30-071", "studio-storage", "DA30-073-writes"],
  };
}
