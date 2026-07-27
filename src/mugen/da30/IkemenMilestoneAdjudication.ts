/**
 * DA30-100: bounded IKEMEN milestone adjudication.
 */

import { buildIkemenSourceAuthority } from "./IkemenSourceAuthority";
import { runZssSubset } from "./ZssSubsetRuntime";
import { buildLuaModuleScope } from "./LuaModuleScope";
import { runTeamTopology } from "./TeamTopologySchedule";
import { runTeamConsumers } from "./TeamConsumersGate";

export function adjudicateIkemenMilestone(headSha: string): {
  schema: "Da30IkemenMilestoneAdjudication/v1";
  ok: boolean;
  headSha: string;
  supported: string[];
  blocked: string[];
  denominators: Record<string, number>;
  scoresHeld: true;
  risks: string[];
  nextQueue: string[];
} {
  const src = buildIkemenSourceAuthority();
  const zss = runZssSubset();
  const lua = buildLuaModuleScope();
  const topo = runTeamTopology();
  const consumers = runTeamConsumers();

  const supported = [
    src.ok ? "source-authority-map" : "",
    zss.ok ? "zss-subset-ops" : "",
    topo.ok ? "team-topology-tag" : "",
    consumers.ok ? "team-consumers-tag" : "",
  ].filter(Boolean);

  const blocked = [
    "generic-zss-support",
    "lua-host-execution",
    "network-rollback",
    "full-ikemen-parity",
    "score-movement",
  ];

  return {
    schema: "Da30IkemenMilestoneAdjudication/v1",
    ok: supported.length >= 3 && blocked.length >= 4,
    headSha,
    supported,
    blocked,
    denominators: {
      sourceFamilies: src.rows.length,
      zssGranted: zss.granted.length,
      luaSurfaces: lua.rows.length,
      consumers: consumers.exercised.length,
    },
    scoresHeld: true,
    risks: ["lua packaging unresolved", "zss registry incomplete"],
    nextQueue: ["DA30-101", "shared-engine", "DA30-103-second-consumer"],
  };
}
