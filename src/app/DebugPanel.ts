import type { MugenCharacter } from "../mugen/model/MugenCharacter";
import type { StageCompatibilityReport } from "../mugen/compatibility/StageCompatibilityReport";
import type { MatchWorldActorRegistrySnapshot } from "../mugen/runtime/MatchWorld";
import type { MugenSnapshot } from "../mugen/runtime/types";

export type RuntimeRosterEntry = {
  id: string;
  displayName: string;
  source: "demo" | "imported";
  selected: boolean;
  atlasStatus: "loading" | "loaded" | "fallback" | "imported";
  walkQaStatus: "loading" | "pass" | "warn" | "fail" | "missing" | "not-applicable";
  walkQaCheckedStates: string[];
  walkQaWarnings: string[];
  walkQaErrors: string[];
};

export function renderDebugPanel(
  character: MugenCharacter | undefined,
  snapshot: MugenSnapshot,
  mode: "match" | "inspect",
  stages: StageCompatibilityReport[] = [],
  runtimeRoster: RuntimeRosterEntry[] = [],
  actorRegistry?: MatchWorldActorRegistrySnapshot,
): string {
  if (mode === "inspect" && !character) {
    return `
      <div class="section">
        <h2>Character Info</h2>
        <p>Load a local character ZIP or folder to inspect DEF paths, AIR timelines, CMD/CNS routes, SFF metadata, and compatibility diagnostics.</p>
      </div>
      <div class="section">
        <h2>Compatibility Report</h2>
        <div class="badge-row">
          <span class="badge active">Ready for intake</span>
          <span class="badge warn">No character package loaded</span>
        </div>
      </div>
    `;
  }
  const actor = snapshot.actors[0];
  const frame = actor?.frame;
  const runtime = actor?.runtime;
  return `
    <div class="section ${mode === "match" ? "runtime-overview-panel" : ""}">
      <div class="section-heading-row">
        <h2>${mode === "match" ? "Match Info" : "Character Info"}</h2>
        ${
          mode === "match"
            ? `<span class="badge active">${escapeHtml(snapshot.round?.message ?? "Fight")} ${snapshot.round?.timer ?? 99}</span>`
            : ""
        }
      </div>
      ${
        mode === "match"
          ? renderMatchInfo(snapshot)
          : character
          ? `<dl class="kv">
              <dt>Name</dt><dd>${escapeHtml(character.definition.info.displayName ?? character.definition.info.name ?? "Unknown")}</dd>
              <dt>Author</dt><dd>${escapeHtml(character.definition.info.author ?? "Unknown")}</dd>
              <dt>MUGEN</dt><dd>${escapeHtml(character.definition.info.mugenVersion ?? "Unknown")}</dd>
              <dt>DEF</dt><dd class="mono">${escapeHtml(character.defPath)}</dd>
              <dt>AIR</dt><dd class="mono">${escapeHtml(character.files.anim ?? "missing")}</dd>
              <dt>SFF</dt><dd class="mono">${escapeHtml(character.files.sprite ?? "missing")}</dd>
              <dt>SFF version</dt><dd class="mono">${escapeHtml(character.spriteArchive?.metadata?.versionLabel ?? character.spriteArchive?.version ?? "missing")}</dd>
              <dt>SFF sprites</dt><dd class="mono">${formatSffDecoded(character)}</dd>
              <dt>SFF palettes</dt><dd class="mono">${character.spriteArchive?.metadata?.paletteTotal ?? 0}</dd>
              <dt>SFF formats</dt><dd class="mono">${escapeHtml(formatSffFormats(character))}</dd>
              <dt>CMD remap</dt><dd class="mono">${escapeHtml(formatCommandRemap(character))}</dd>
              <dt>CMD defaults</dt><dd class="mono">${escapeHtml(formatCommandDefaults(character))}</dd>
              <dt>SND sounds</dt><dd class="mono">${formatSndDecoded(character)}</dd>
            </dl>`
          : `<p>Load a local character ZIP or folder to inspect real DEF, AIR, CMD, CNS/ST, SFF, and compatibility data.</p>`
      }
    </div>
    <div class="section runtime-debug-panel">
      <div class="section-heading-row">
        <h2>${mode === "match" ? "Runtime Debugger" : "Playback Inspector"}</h2>
        <span class="badge">${frame ? `${frame.spriteGroup},${frame.spriteIndex}` : "mock"}</span>
      </div>
      <dl class="kv telemetry-kv">
        <dt>Tick</dt><dd class="mono">${snapshot.tick}</dd>
        <dt>Action</dt><dd class="mono">${snapshot.selectedActionId ?? "none"}</dd>
        <dt>Anim Src</dt><dd class="mono">${runtime?.animationSource ?? "self"}</dd>
        <dt>Sprite Owner</dt><dd class="mono">${formatSpriteOwner(actor)}</dd>
        <dt>Frame</dt><dd class="mono">${runtime?.frameIndex ?? "none"}</dd>
        <dt>Sprite</dt><dd class="mono">${frame ? `${frame.spriteGroup},${frame.spriteIndex}` : "mock"}</dd>
        <dt>Time</dt><dd class="mono">${runtime?.animTime ?? 0}</dd>
        <dt>State</dt><dd class="mono">${runtime?.stateNo ?? 0}</dd>
        <dt>Ctrl</dt><dd class="mono">${runtime?.ctrl ? "true" : "false"}</dd>
        <dt>Guard</dt><dd class="mono">${formatGuard(runtime)}</dd>
        <dt>Fall</dt><dd class="mono">${formatHitFall(runtime?.hitFall)}</dd>
        <dt>Override</dt><dd class="mono">${formatHitOverrides(runtime?.hitOverrides)}</dd>
        <dt>Reversal</dt><dd class="mono">${formatReversal(runtime?.reversal)}</dd>
        <dt>Custom</dt><dd class="mono">${formatCustomState(runtime?.customState)}</dd>
        <dt>Type</dt><dd class="mono">${runtime?.stateType ?? "-"} / ${runtime?.moveType ?? "-"} / ${runtime?.physics ?? "-"}</dd>
        <dt>Width</dt><dd class="mono">${formatBodyWidth(runtime?.bodyWidth)}</dd>
        <dt>Attack</dt><dd class="mono">${formatAttackMultiplier(runtime?.attackMultiplier)}</dd>
        <dt>Remap</dt><dd class="mono">${formatPaletteRemap(runtime?.paletteRemap)}</dd>
        <dt>Priority</dt><dd class="mono">${runtime?.spritePriority ?? "-"}</dd>
        <dt>Assert</dt><dd class="mono">${formatAssertSpecial(runtime?.assertSpecial)}</dd>
        <dt>PalFX</dt><dd class="mono">${formatPaletteFx(runtime?.paletteFx)}</dd>
        <dt>AfterImage</dt><dd class="mono">${formatAfterImage(runtime?.afterImage)}</dd>
        <dt>Clsn1</dt><dd class="mono">${actor?.clsn1.length ?? 0}</dd>
        <dt>Clsn2</dt><dd class="mono">${actor?.clsn2.length ?? 0}</dd>
      </dl>
    </div>
    ${mode === "match" && actorRegistry ? renderActorRegistry(actorRegistry) : ""}
    ${
      mode === "match"
        ? renderCollapsibleSection("Combat Debugger", renderCombatDebugger(snapshot), {
            badge: `${snapshot.effects?.length ?? 0} effects`,
          })
        : ""
    }
    ${renderCollapsibleSection("Frame Inspector", renderFrameTable(snapshot), {
      open: mode === "inspect",
      badge: `${snapshot.selectedAction?.frames.length ?? 0} frames`,
    })}
    ${renderCollapsibleSection("Compatibility Report", `${renderCompatibility(character, snapshot, runtimeRoster)}${renderStageCompatibility(stages)}`, {
      open: true,
      badge: character ? `${character.compatibility.unsupported.length} unsupported` : "runtime",
    })}
  `;
}

function renderCollapsibleSection(
  title: string,
  body: string,
  options: { open?: boolean; badge?: string } = {},
): string {
  return `
    <details class="section collapsible-section" ${options.open ? "open" : ""}>
      <summary>
        <span>${escapeHtml(title)}</span>
        ${options.badge ? `<small>${escapeHtml(options.badge)}</small>` : ""}
      </summary>
      <div class="collapsible-body">${body}</div>
    </details>
  `;
}

export function renderActorRegistry(registry: MatchWorldActorRegistrySnapshot): string {
  return `
    <details class="section collapsible-section" data-debug-panel="actor-registry">
      <summary>
        <span>Actor Registry</span>
        <small>${registry.actors.length} actors / ${registry.effects.length} effects</small>
      </summary>
      <div class="collapsible-body">
      <div class="badge-row">
        <span class="badge active">${registry.actors.length} actors</span>
        <span class="badge ok">${registry.players.length} players</span>
        <span class="badge ${registry.effects.length ? "warn" : ""}">${registry.effects.length} effects</span>
        <span class="badge">helpers ${registry.byKind.helper.length}</span>
        <span class="badge">projectiles ${registry.byKind.projectile.length}</span>
        <span class="badge">explods ${registry.byKind.explod.length}</span>
        <span class="badge ${registry.lifecycle.spawnedThisTick.length ? "active" : ""}">spawned ${registry.lifecycle.spawnedThisTick.length}</span>
        <span class="badge ${registry.lifecycle.removedThisTick.length ? "warn" : ""}">removed ${registry.lifecycle.removedThisTick.length}</span>
        <span class="badge ${registry.lifecycle.eventsThisTick.length ? "ok" : ""}">events ${registry.lifecycle.eventsThisTick.length}</span>
        <span class="badge ${registry.targetLinks.length ? "active" : ""}">targets ${registry.targetLinks.length}</span>
        <span class="badge">stores ${registry.effectStores.length}</span>
      </div>
      ${renderLifecycleEvents(registry)}
      ${renderTargetLinks(registry)}
      ${renderEffectActorStores(registry)}
      <div class="actor-tree">
        ${registry.actors
          .map(
            (actor) => `
              <div class="actor-tree-row" data-actor-id="${escapeHtml(actor.id)}">
                <div>
                  <strong>${escapeHtml(actor.label)}</strong>
                  <span class="list-meta mono">${escapeHtml(actor.id)} / ${escapeHtml(actor.kind)} / ${escapeHtml(actor.source ?? "unknown")}</span>
                </div>
                <div class="actor-tree-links">
                  <span><b>owner</b> ${escapeHtml(actor.ownerId)}</span>
                  <span><b>root</b> ${escapeHtml(actor.rootId)}</span>
                  <span><b>parent</b> ${escapeHtml(actor.parentId)}</span>
                  ${
                    actor.spriteOwnerId && actor.spriteOwnerId !== actor.id
                      ? `<span><b>sprite</b> ${escapeHtml(actor.spriteOwnerId)}</span>`
                      : ""
                  }
                </div>
                <div class="badge-row">
                  <span class="badge ${actor.lifecycle.status === "spawned" ? "active" : actor.lifecycle.status === "removed" ? "warn" : ""}">${escapeHtml(actor.lifecycle.status)} ${actor.lifecycle.ageTicks}f</span>
                  <span class="badge">state ${actor.stateNo}</span>
                  <span class="badge">anim ${actor.animNo}</span>
                  <span class="badge">life ${actor.life}</span>
                  <span class="badge">power ${actor.power}</span>
                  ${actor.targetCount ? `<span class="badge active">targets ${actor.targetCount}</span>` : ""}
                  ${actor.targetBindings.length ? `<span class="badge active">bindings ${actor.targetBindings.length}</span>` : ""}
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
      </div>
    </details>
  `;
}

function renderTargetLinks(registry: MatchWorldActorRegistrySnapshot): string {
  if (!registry.targetLinks.length) {
    return "";
  }
  return `
    <div class="actor-tree" aria-label="Target ownership links">
      ${registry.targetLinks
        .map((link) => {
          const binding = link.binding
            ? ` bind ${escapeHtml(String(link.binding.remaining))}f @ ${link.binding.offset.x},${link.binding.offset.y}`
            : "";
          return `
            <div class="actor-tree-row">
              <div>
                <strong>${escapeHtml(link.ownerId)} -> ${escapeHtml(link.actorId)}</strong>
                <span class="list-meta mono">target ${escapeHtml(link.targetId === undefined ? "*" : String(link.targetId))} / age ${link.age}f${binding}</span>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderEffectActorStores(registry: MatchWorldActorRegistrySnapshot): string {
  if (!registry.effectStores.length) {
    return "";
  }
  return `
    <div class="actor-tree" aria-label="Effect actor stores">
      ${registry.effectStores
        .map(
          (store) => `
            <div class="actor-tree-row">
              <div>
                <strong>${escapeHtml(store.ownerId)}</strong>
                <span class="list-meta mono">effect store / total ${store.total}</span>
              </div>
              <div class="badge-row">
                <span class="badge ${store.explods.length ? "active" : ""}">explods ${store.explods.length}</span>
                <span class="badge ${store.helpers.length ? "active" : ""}">helpers ${store.helpers.length}</span>
                <span class="badge ${store.projectiles.length ? "active" : ""}">projectiles ${store.projectiles.length}</span>
                <span class="badge">next ${store.nextSerials.explod}/${store.nextSerials.helper}/${store.nextSerials.projectile}</span>
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderLifecycleEvents(registry: MatchWorldActorRegistrySnapshot): string {
  const events = registry.lifecycle.eventsThisTick.length
    ? registry.lifecycle.eventsThisTick
    : registry.lifecycle.recentEvents.slice(0, 4);
  if (!events.length) {
    return "";
  }
  return `
    <div class="badge-row" aria-label="Actor lifecycle events">
      ${events
        .slice(0, 6)
        .map(
          (event) =>
            `<span class="badge ${event.type === "spawn" ? "active" : event.type === "remove" ? "warn" : ""}">${escapeHtml(
              event.type,
            )} ${escapeHtml(event.id)} ${event.ageTicks}f</span>`,
        )
        .join("")}
    </div>
  `;
}

function renderMatchInfo(snapshot: MugenSnapshot): string {
  const p1 = snapshot.actors[0];
  const p2 = snapshot.actors[1];
  return `
    <div class="runtime-versus-card">
      <div>
        <span class="panel-kicker">P1</span>
        <strong>${escapeHtml(p1?.label ?? "P1")}</strong>
        <small class="mono">state ${p1?.runtime.stateNo ?? "-"} / anim ${p1?.runtime.animNo ?? "-"}</small>
      </div>
      <span class="versus">VS</span>
      <div>
        <span class="panel-kicker">CPU</span>
        <strong>${escapeHtml(p2?.label ?? "CPU")}</strong>
        <small class="mono">state ${p2?.runtime.stateNo ?? "-"} / anim ${p2?.runtime.animNo ?? "-"}</small>
      </div>
    </div>
    <div class="fighter-bars runtime-fighter-bars">
      ${snapshot.actors.map(renderLifeBar).join("")}
    </div>
    <div class="runtime-metric-strip">
      <span><b>${escapeHtml(snapshot.stage.displayName ?? "Stage")}</b><small>stage</small></span>
      <span><b>${snapshot.tick}</b><small>tick</small></span>
      <span><b>${escapeHtml(formatMatchPause(snapshot.matchPause))}</b><small>pause</small></span>
      <span><b>${escapeHtml(formatStageShake(snapshot.stage.camera.shake))}</b><small>shake</small></span>
      <span><b>${snapshot.effects?.length ?? 0}</b><small>effects</small></span>
    </div>
  `;
}

function renderLifeBar(actor: MugenSnapshot["actors"][number]): string {
  const lifePercent = Math.max(0, Math.min(100, actor.runtime.life / 10));
  const powerPercent = Math.max(0, Math.min(100, actor.runtime.power / 30));
  return `
    <div class="fighter-bar">
      <div class="fighter-bar-top">
        <strong>${escapeHtml(actor.label)}</strong>
        <span class="mono">${actor.runtime.life}</span>
      </div>
      <div class="meter meter-life"><span style="width: ${lifePercent}%"></span></div>
      <div class="meter meter-power"><span style="width: ${powerPercent}%"></span></div>
    </div>
  `;
}

function renderCombatDebugger(snapshot: MugenSnapshot): string {
  return `
    <div class="list">
      ${
        snapshot.matchPause
          ? `<div class="badge-row" style="margin-bottom: 8px"><span class="badge warn">${escapeHtml(
              formatMatchPause(snapshot.matchPause),
            )}</span></div>`
          : ""
      }
      ${
        snapshot.effects?.length
          ? `<div class="badge-row" style="margin-bottom: 8px"><span class="badge active">Effects ${snapshot.effects.length}</span>${snapshot.effects
              .slice(0, 4)
              .map((effect) => `<span class="badge">${escapeHtml(effect.label)} anim ${effect.runtime.animNo}</span>`)
              .join("")}</div>`
          : ""
      }
      ${snapshot.actors
        .map(
          (actor) => `
            <div class="list-item">
              <span>
                <span class="list-title">${escapeHtml(actor.label)}</span>
                <span class="list-meta">pos ${actor.runtime.pos.x.toFixed(1)}, ${actor.runtime.pos.y.toFixed(1)} / vel ${actor.runtime.vel.x.toFixed(1)}, ${actor.runtime.vel.y.toFixed(1)}</span>
                <span class="badge-row">
                  <span class="badge">state ${actor.runtime.stateNo}</span>
                  <span class="badge">anim ${actor.runtime.animNo}</span>
                  <span class="badge ${actor.runtime.moveType === "A" ? "warn" : actor.runtime.moveType === "H" ? "error" : ""}">${actor.runtime.stateType}/${actor.runtime.moveType}/${actor.runtime.physics}</span>
                  ${actor.runtime.guarding ? `<span class="badge warn">Guard ${actor.runtime.guardStun ?? 0}</span>` : ""}
                  ${actor.runtime.hitFall ? `<span class="badge warn">Fall ${escapeHtml(formatHitFall(actor.runtime.hitFall))}</span>` : ""}
                  ${actor.runtime.hitOverrides?.length ? `<span class="badge warn">Override ${escapeHtml(formatHitOverrides(actor.runtime.hitOverrides))}</span>` : ""}
                  ${actor.runtime.reversal ? `<span class="badge warn">Reversal ${escapeHtml(formatReversal(actor.runtime.reversal))}</span>` : ""}
                  ${actor.runtime.customState ? `<span class="badge warn">Custom ${escapeHtml(formatCustomState(actor.runtime.customState))}</span>` : ""}
                  <span class="badge">facing ${actor.runtime.facing}</span>
                  ${actor.runtime.targetCount ? `<span class="badge active">Targets ${actor.runtime.targetCount}</span>` : ""}
                  <span class="badge">width ${formatBodyWidth(actor.runtime.bodyWidth)}</span>
                  ${actor.runtime.playerPush === false ? `<span class="badge warn">NoPush</span>` : ""}
                  ${actor.runtime.posFreeze ? `<span class="badge warn">Freeze ${escapeHtml(formatPosFreeze(actor.runtime.posFreeze))}</span>` : ""}
                  ${actor.runtime.screenBound ? `<span class="badge active">Screen ${escapeHtml(formatScreenBound(actor.runtime.screenBound))}</span>` : ""}
                  ${actor.runtime.hitBy ? `<span class="badge warn">HitBy ${escapeHtml(formatHitBy(actor.runtime.hitBy))}</span>` : ""}
                  ${actor.runtime.defenseMultiplier !== undefined ? `<span class="badge active">Def x${actor.runtime.defenseMultiplier.toFixed(2)}</span>` : ""}
                  ${actor.runtime.attackMultiplier !== undefined ? `<span class="badge active">Atk x${actor.runtime.attackMultiplier.toFixed(2)}</span>` : ""}
                  ${actor.runtime.paletteRemap ? `<span class="badge active">Remap ${escapeHtml(formatPaletteRemap(actor.runtime.paletteRemap))}</span>` : ""}
                  ${actor.runtime.assertSpecial ? `<span class="badge active">Assert ${escapeHtml(formatAssertSpecial(actor.runtime.assertSpecial))}</span>` : ""}
                  <span class="badge">prio ${actor.runtime.spritePriority ?? "-"}</span>
                  ${actor.runtime.paletteFx ? `<span class="badge warn">PalFX ${escapeHtml(formatPaletteFx(actor.runtime.paletteFx))}</span>` : ""}
                  ${actor.runtime.afterImage ? `<span class="badge active">AfterImage ${escapeHtml(formatAfterImage(actor.runtime.afterImage))}</span>` : ""}
                  <span class="badge ${actor.clsn1.length ? "error" : ""}">Clsn1 ${actor.clsn1.length}</span>
                  <span class="badge ${actor.clsn2.length ? "ok" : ""}">Clsn2 ${actor.clsn2.length}</span>
                  ${actor.soundEvents?.[0] ? `<span class="badge active">${escapeHtml(formatSoundEvent(actor.soundEvents[0]))}</span>` : ""}
                  ${actor.envShakeEvents?.[0] ? `<span class="badge warn">${escapeHtml(formatEnvShakeEvent(actor.envShakeEvents[0]))}</span>` : ""}
                </span>
              </span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function formatGuard(runtime: MugenSnapshot["actors"][number]["runtime"] | undefined): string {
  if (!runtime?.guarding && !runtime?.guardStun) {
    return "-";
  }
  return `${runtime.guarding ? "true" : "false"} / ${runtime.guardStun ?? 0}`;
}

function formatHitFall(fall: MugenSnapshot["actors"][number]["runtime"]["hitFall"]): string {
  if (!fall) {
    return "-";
  }
  const x = fall.velocity.x !== undefined ? fall.velocity.x.toFixed(1) : "-";
  const y = fall.velocity.y.toFixed(1);
  const parts = [
    fall.falling ? "on" : "off",
    `dmg ${fall.damage}`,
    `vel ${x},${y}`,
    fall.recover !== undefined ? `rec ${fall.recover ? "yes" : "no"}${fall.recoverTime !== undefined ? `/${fall.recoverTime}` : ""}` : "",
    fall.envShake ? `shake ${fall.envShake.time}f/${fall.envShake.ampl}` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

function formatBodyWidth(width: MugenSnapshot["actors"][number]["runtime"]["bodyWidth"]): string {
  if (!width) {
    return "-";
  }
  return `${width.front}/${width.back}`;
}

function formatAttackMultiplier(value: MugenSnapshot["actors"][number]["runtime"]["attackMultiplier"]): string {
  if (value === undefined) {
    return "-";
  }
  return `x${value.toFixed(2)}`;
}

function formatPaletteRemap(remap: MugenSnapshot["actors"][number]["runtime"]["paletteRemap"]): string {
  if (!remap) {
    return "-";
  }
  return `${remap.source[0]},${remap.source[1]} -> ${remap.dest[0]},${remap.dest[1]}`;
}

function formatPosFreeze(freeze: NonNullable<MugenSnapshot["actors"][number]["runtime"]["posFreeze"]>): string {
  return `${freeze.x ? "X" : "-"}${freeze.y ? "Y" : "-"}`;
}

function formatScreenBound(bound: NonNullable<MugenSnapshot["actors"][number]["runtime"]["screenBound"]>): string {
  return `${bound.bound ? "bound" : "free"} cam ${bound.moveCameraX ? "x" : "-"}${bound.moveCameraY ? "y" : "-"}`;
}

function formatHitBy(hitBy: NonNullable<MugenSnapshot["actors"][number]["runtime"]["hitBy"]>): string {
  return [hitBy.slot1 ? `1:${formatHitBySlot(hitBy.slot1)}` : "", hitBy.slot2 ? `2:${formatHitBySlot(hitBy.slot2)}` : ""]
    .filter(Boolean)
    .join(" ");
}

function formatHitBySlot(slot: NonNullable<NonNullable<MugenSnapshot["actors"][number]["runtime"]["hitBy"]>["slot1"]>): string {
  const mode = slot.mode === "allow" ? "allow" : "deny";
  const remaining = slot.remaining === Number.POSITIVE_INFINITY ? "inf" : `${slot.remaining}`;
  return `${mode} ${slot.attr} ${remaining}`;
}

function formatHitOverrides(overrides: MugenSnapshot["actors"][number]["runtime"]["hitOverrides"]): string {
  if (!overrides?.length) {
    return "-";
  }
  return overrides
    .map((slot) => {
      const remaining = slot.remaining === Number.POSITIVE_INFINITY ? "inf" : `${slot.remaining}`;
      const target = slot.stateNo !== undefined ? `->${slot.stateNo}` : "";
      const flags = [slot.forceAir ? "air" : "", slot.forceGuard ? "guard" : "", slot.keepState ? "keep" : ""].filter(Boolean);
      return `${slot.slot}:${slot.attr}${target} ${remaining}${flags.length ? ` ${flags.join("/")}` : ""}`;
    })
    .join(" ");
}

function formatReversal(reversal: MugenSnapshot["actors"][number]["runtime"]["reversal"]): string {
  if (!reversal) {
    return "-";
  }
  const p1 = reversal.p1StateNo !== undefined ? ` p1->${reversal.p1StateNo}` : "";
  const p2 = reversal.p2StateNo !== undefined ? ` p2->${reversal.p2StateNo}` : "";
  return `${reversal.attr}${p1}${p2} pause ${reversal.hitPause}`;
}

function formatCustomState(customState: MugenSnapshot["actors"][number]["runtime"]["customState"]): string {
  if (!customState) {
    return "-";
  }
  return `${customState.ownerId}:${customState.stateNo}${customState.getP1State ? " owner" : ""}`;
}

function formatSpriteOwner(actor: MugenSnapshot["actors"][number] | undefined): string {
  if (!actor) {
    return "-";
  }
  const ownerId = actor.spriteOwnerId ?? actor.id;
  const definitionId = actor.spriteOwnerDefinitionId ? `/${actor.spriteOwnerDefinitionId}` : "";
  return `${ownerId}${definitionId}`;
}

function formatAssertSpecial(assertSpecial: MugenSnapshot["actors"][number]["runtime"]["assertSpecial"]): string {
  if (!assertSpecial) {
    return "-";
  }
  const flags = [...assertSpecial.flags, ...assertSpecial.globalFlags.map((flag) => `g:${flag}`)];
  return flags.length > 0 ? flags.join(",") : "-";
}

function formatPaletteFx(effect: MugenSnapshot["actors"][number]["runtime"]["paletteFx"]): string {
  if (!effect) {
    return "-";
  }
  return `${effect.remaining}/${effect.time} add ${effect.add.join(",")} mul ${effect.mul.join(",")}`;
}

function formatAfterImage(effect: MugenSnapshot["actors"][number]["runtime"]["afterImage"]): string {
  if (!effect) {
    return "-";
  }
  return `${effect.remaining}/${effect.time} len ${effect.length} samples ${effect.samples.length}`;
}

function formatSoundEvent(event: NonNullable<MugenSnapshot["actors"][number]["soundEvents"]>[number]): string {
  const value = event.group !== undefined && event.index !== undefined ? ` S${event.group},${event.index}` : "";
  const channel = event.channel !== undefined ? ` ch${event.channel}` : "";
  return `${event.type}${value}${channel}`;
}

function formatEnvShakeEvent(event: NonNullable<MugenSnapshot["actors"][number]["envShakeEvents"]>[number]): string {
  return `${event.type} t${event.time} a${event.ampl}`;
}

function formatStageShake(shake: MugenSnapshot["stage"]["camera"]["shake"]): string {
  if (!shake) {
    return "-";
  }
  return `${shake.remaining}f / ${shake.amplitude.toFixed(1)}`;
}

function formatMatchPause(pause: MugenSnapshot["matchPause"]): string {
  if (!pause) {
    return "-";
  }
  return `${pause.type} ${pause.remaining}f / move ${pause.moveTime} / ${pause.actorId}${pause.darken ? " / dark" : ""}`;
}

function renderFrameTable(snapshot: MugenSnapshot): string {
  const frames = snapshot.selectedAction?.frames ?? [];
  if (frames.length === 0) {
    return `<div class="empty-state">No frames parsed for the selected action.</div>`;
  }
  const current = snapshot.actors[0]?.runtime.frameIndex ?? 0;
  return `
    <table class="frame-table">
      <thead>
        <tr><th>#</th><th>Sprite</th><th>Time</th><th>X</th><th>Y</th><th>C1</th><th>C2</th></tr>
      </thead>
      <tbody>
        ${frames
          .map(
            (frame, index) => `
              <tr class="${index === current ? "is-active" : ""}">
                <td>${index}</td>
                <td>${frame.spriteGroup},${frame.spriteIndex}</td>
                <td>${frame.duration}</td>
                <td>${frame.offsetX}</td>
                <td>${frame.offsetY}</td>
                <td>${frame.clsn1.length}</td>
                <td>${frame.clsn2.length}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderCompatibility(
  character: MugenCharacter | undefined,
  snapshot?: MugenSnapshot,
  runtimeRoster: RuntimeRosterEntry[] = [],
): string {
  if (!character) {
    return `
      <div class="badge-row">
        <span class="badge ok">Runtime loop</span>
        <span class="badge ok">2 actors</span>
        <span class="badge ok">hit pause</span>
        <span class="badge ok">hit stun</span>
        <span class="badge ok">3 active atlas fighters</span>
        <span class="badge warn">generated prototype frames</span>
        <span class="badge warn">imported CNS partial</span>
      </div>
      <p style="margin-top: 12px">Runtime fighters use the same animation/collision model as imported AIR data. The roster is loaded from sprite-atlas-builder atlases; decoded imported SFF sprites can enter Runtime Mode through CMD State -1 entries and a small CNS subset.</p>
      ${renderRuntimeRosterCompatibility(runtimeRoster)}
      <button type="button" class="full-width-action" data-action="export-report">Export runtime report</button>
    `;
  }
  const report = character.compatibility;
  const session = getImportedSession(snapshot);
  const executedStateCount = session?.executedStates.length ?? report.states.executed;
  const decodedSprites = character.spriteArchive?.sprites.length ?? 0;
  return `
    <div class="badge-row">
      <span class="badge ${report.files.def ? "ok" : "error"}">DEF</span>
      <span class="badge ${report.files.air ? "ok" : "warn"}">AIR</span>
      <span class="badge ${decodedSprites > 0 ? "ok" : "warn"}">${decodedSprites > 0 ? "SFF decoded" : "SFF metadata"}</span>
      <span class="badge ${report.files.cmd ? "ok" : "warn"}">CMD</span>
      <span class="badge ${report.files.cns ? "ok" : "warn"}">CNS/ST</span>
      <span class="badge ${report.files.snd ? "ok" : "warn"}">SND</span>
      <span class="badge ${report.profiles.ikemen.detected ? "warn" : "ok"}">IKEMEN ${report.profiles.ikemen.detected ? "scan" : "clean"}</span>
    </div>
    <dl class="kv" style="margin-top: 12px">
      <dt>Profiles</dt><dd class="mono">${escapeHtml(report.profiles.active.join(", "))}</dd>
      <dt>Animations</dt><dd>${report.animations.loaded}/${report.animations.total}</dd>
      <dt>With boxes</dt><dd>${report.animations.withCollisionBoxes}</dd>
      <dt>States</dt><dd>${report.states.parsed}</dd>
      <dt>State entries</dt><dd>${report.states.stateEntries}</dd>
      <dt>Recognized states</dt><dd>${report.states.recognizedControllerStates}</dd>
      <dt>Clean entries</dt><dd>${report.states.triggerSupported}</dd>
      <dt>Routable targets</dt><dd>${report.states.runtimeRoutable}</dd>
      <dt>Executed</dt><dd>${executedStateCount}</dd>
      ${session ? `<dt>State IDs</dt><dd class="mono">${formatExecutedStates(session.executedStates)}</dd>` : ""}
      ${session ? `<dt>Entry routes</dt><dd>${session.routedStateEntries}</dd>` : ""}
      ${session && session.routedStates.length > 0 ? `<dt>Routed states</dt><dd class="mono">${formatExecutedStates(session.routedStates)}</dd>` : ""}
      ${session?.lastRoutedState ? `<dt>Last route</dt><dd class="mono">${escapeHtml(formatLastRoute(session.lastRoutedState))}</dd>` : ""}
      ${session && session.activeCommands.length > 0 ? `<dt>Active CMD</dt><dd class="mono">${escapeHtml(session.activeCommands.join(", "))}</dd>` : ""}
      ${session && Object.keys(session.executedOperations).length > 0 ? `<dt>Typed ops</dt><dd class="mono">${escapeHtml(formatRecordCounts(session.executedOperations))}</dd>` : ""}
      <dt>Triggers</dt><dd>${report.triggers.supported}/${report.triggers.total}</dd>
      <dt>SFF sprites</dt><dd>${formatSffDecoded(character)}</dd>
      <dt>SFF formats</dt><dd>${escapeHtml(formatSffFormats(character))}</dd>
      <dt>SND sounds</dt><dd>${formatSndDecoded(character)}</dd>
      <dt>IKEMEN findings</dt><dd>${report.profiles.ikemen.findings.length}</dd>
      <dt>Unsupported</dt><dd>${report.unsupported.reduce((total, item) => total + item.count, 0)}</dd>
      <dt>Warnings</dt><dd>${report.warnings.length}</dd>
      <dt>Errors</dt><dd>${report.errors.length}</dd>
    </dl>
    ${renderIkemenScan(report.profiles.ikemen)}
    ${renderUnsupported(report.unsupported)}
    ${renderMessages("Errors", report.errors, "error")}
    ${renderMessages("Warnings", report.warnings, "warning")}
    <pre class="mono" style="white-space: pre-wrap; color: var(--muted); font-size: 12px">${escapeHtml(
      JSON.stringify(report.controllers, null, 2),
    )}</pre>
    <button type="button" class="full-width-action" data-action="export-report">Export compatibility JSON</button>
  `;
}

function renderIkemenScan(scan: MugenCharacter["compatibility"]["profiles"]["ikemen"]): string {
  if (!scan.detected) {
    return `
      <div class="compat-list">
        <strong>IKEMEN Profile Scan</strong>
        <div class="compat-row">
          <span class="badge ok">clean</span>
          <span>${escapeHtml(scan.summary)}</span>
        </div>
      </div>
    `;
  }
  return `
    <div class="compat-list">
      <strong>IKEMEN Profile Scan</strong>
      <div class="compat-row">
        <span class="badge warn">recognized</span>
        <span>${escapeHtml(scan.summary)}</span>
      </div>
      ${scan.findings
        .slice(0, 6)
        .map(
          (finding) => `
            <div class="compat-row">
              <span class="badge warn">${escapeHtml(finding.category)}</span>
              <span>${escapeHtml(finding.feature)}</span>
              <span class="mono">${escapeHtml(finding.location)}</span>
            </div>
          `,
        )
        .join("")}
      <span class="list-meta">${escapeHtml(scan.claimAllowed)} ${escapeHtml(scan.claimBlocked)}</span>
      ${scan.findings.length > 6 ? `<span class="list-meta">+${scan.findings.length - 6} more in JSON export</span>` : ""}
    </div>
  `;
}

function renderRuntimeRosterCompatibility(runtimeRoster: RuntimeRosterEntry[]): string {
  if (runtimeRoster.length === 0) {
    return "";
  }
  return `
    <div class="compat-list">
      <strong>Runtime Roster QA</strong>
      ${runtimeRoster
        .map(
          (fighter) => `
            <div class="compat-row">
              <span class="badge ${fighter.selected ? "active" : ""}">${escapeHtml(fighter.displayName)}</span>
              <span class="badge ${fighter.atlasStatus === "loaded" || fighter.atlasStatus === "imported" ? "ok" : fighter.atlasStatus === "fallback" ? "warn" : ""}">atlas ${escapeHtml(fighter.atlasStatus)}</span>
              <span class="badge ${walkQaClass(fighter.walkQaStatus)}">${escapeHtml(walkQaLabel(fighter))}</span>
              ${
                fighter.walkQaWarnings[0]
                  ? `<span class="list-meta">${escapeHtml(fighter.walkQaWarnings[0])}</span>`
                  : fighter.walkQaErrors[0]
                    ? `<span class="list-meta">${escapeHtml(fighter.walkQaErrors[0])}</span>`
                    : ""
              }
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function walkQaLabel(fighter: RuntimeRosterEntry): string {
  if (fighter.walkQaStatus === "not-applicable") {
    return "walk QA imported";
  }
  if (fighter.walkQaStatus === "pass") {
    return "walk QA ok";
  }
  if (fighter.walkQaStatus === "warn") {
    return `walk QA warn ${fighter.walkQaWarnings.length}`;
  }
  if (fighter.walkQaStatus === "fail") {
    return `walk QA fail ${fighter.walkQaErrors.length}`;
  }
  if (fighter.walkQaStatus === "missing") {
    return "walk QA missing";
  }
  return "walk QA loading";
}

function walkQaClass(status: RuntimeRosterEntry["walkQaStatus"]): string {
  if (status === "pass" || status === "not-applicable") {
    return "ok";
  }
  if (status === "fail") {
    return "error";
  }
  return "warn";
}

function renderStageCompatibility(stages: StageCompatibilityReport[]): string {
  if (stages.length === 0) {
    return "";
  }
  return `
    <div class="compat-list" style="margin-top: 12px">
      <strong>Stage Compatibility</strong>
      ${stages
        .map(
          (stage) => {
            const visibleLayers = stage.backgrounds.layers.slice(0, 5);
            return `
            <div class="compat-row">
              <span class="badge ${stage.files.def ? "ok" : "error"}">DEF</span>
              <span class="badge ${stage.files.sff && stage.sff.decodedSprites > 0 ? "ok" : stage.files.sff ? "warn" : "error"}">SFF ${stage.sff.decodedSprites}/${stage.sff.totalSprites}</span>
              <span>${escapeHtml(stage.stage)}</span>
              <span class="mono">BG ${stage.backgrounds.renderedSprites}/${stage.backgrounds.withSpriteRefs}</span>
              <span class="mono">anim ${stage.backgrounds.renderedAnimated}/${stage.backgrounds.animated}</span>
              <span class="mono">tile ${stage.backgrounds.tiled}</span>
              <span class="mono">warn ${stage.warnings.length}</span>
            </div>
            ${
              visibleLayers.length
                ? `<div class="compat-layer-list">
                    ${visibleLayers
                      .map(
                        (layer) => `
                          <div class="compat-row compact">
                            <span class="badge ${stageLayerStatusClass(layer.status)}">${escapeHtml(layer.status)}</span>
                            <span class="mono">${escapeHtml(layer.section ?? layer.id)}</span>
                            <span class="mono">${escapeHtml(layer.type)}</span>
                            ${
                              layer.sprite
                                ? `<span class="mono">spr ${layer.sprite.group},${layer.sprite.index}</span>`
                                : layer.action
                                  ? `<span class="mono">act ${layer.action.id} ${layer.action.decodedFrames}/${layer.action.frames}</span>`
                                  : `<span class="mono">placeholder</span>`
                            }
                            ${layer.unsupported.length ? `<span class="mono">gap ${escapeHtml(layer.unsupported.join(", "))}</span>` : ""}
                          </div>
                        `,
                      )
                      .join("")}
                    ${
                      stage.backgrounds.layers.length > visibleLayers.length
                        ? `<div class="compat-row compact"><span class="mono">+${stage.backgrounds.layers.length - visibleLayers.length} more stage layer(s)</span></div>`
                        : ""
                    }
                  </div>`
                : ""
            }
          `;
          },
        )
        .join("")}
    </div>
  `;
}

function stageLayerStatusClass(status: StageCompatibilityReport["backgrounds"]["layers"][number]["status"]): string {
  if (status === "rendered" || status === "animated") {
    return "ok";
  }
  if (status === "missing" || status === "unsupported") {
    return "error";
  }
  return "warn";
}

function getImportedSession(
  snapshot: MugenSnapshot | undefined,
): NonNullable<MugenSnapshot["compatibilitySession"]>["actors"][number] | undefined {
  return snapshot?.compatibilitySession?.actors[0];
}

function formatExecutedStates(states: number[]): string {
  if (states.length === 0) {
    return "none";
  }
  const visible = states.slice(0, 8).join(", ");
  return states.length > 8 ? `${visible}, +${states.length - 8}` : visible;
}

function formatLastRoute(route: { stateId: number; name?: string }): string {
  return route.name ? `${route.stateId} ${route.name}` : String(route.stateId);
}

function formatRecordCounts(counts: Record<string, number>): string {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key} x${value}`)
    .join(", ");
}

function formatSffDecoded(character: MugenCharacter): string {
  const archive = character.spriteArchive;
  if (!archive) {
    return "0";
  }
  const total = archive.metadata?.spriteTotal ?? archive.sprites.length;
  return `${archive.sprites.length}/${total}`;
}

function formatSffFormats(character: MugenCharacter): string {
  const counts = character.spriteArchive?.metadata?.formatCounts;
  if (!counts || Object.keys(counts).length === 0) {
    return "none";
  }
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([format, count]) => `${format} x${count}`)
    .join(", ");
}

function formatCommandRemap(character: MugenCharacter): string {
  const remap = character.commandRemap ?? {};
  const entries = Object.entries(remap)
    .filter(([from, to]) => from !== to)
    .map(([from, to]) => `${from}->${to || "disabled"}`);
  return entries.length ? entries.join(", ") : "identity";
}

function formatCommandDefaults(character: MugenCharacter): string {
  const defaults = character.commandDefaults;
  if (!defaults) {
    return "missing";
  }
  return `${defaults.time}f / ${defaults.stepTime}sf / ${defaults.bufferTime}bf / ${
    defaults.bufferHitPause ? "hitpause" : "no hitpause"
  }`;
}

function formatSndDecoded(character: MugenCharacter): string {
  const archive = character.soundArchive;
  if (!archive) {
    return "0";
  }
  return `${archive.metadata.decodedTotal}/${archive.metadata.soundTotal}`;
}

function renderUnsupported(unsupported: MugenCharacter["compatibility"]["unsupported"]): string {
  if (unsupported.length === 0) {
    return `<div class="compat-list"><span class="badge ok">No unsupported features reported yet</span></div>`;
  }
  return `
    <div class="compat-list">
      <strong>Unsupported Features</strong>
      ${unsupported
        .slice(0, 8)
        .map(
          (item) => `
            <div class="compat-row">
              <span class="badge warn">${escapeHtml(item.format)}</span>
              <span>${escapeHtml(item.feature)}</span>
              <span class="mono">x${item.count}</span>
            </div>
          `,
        )
        .join("")}
      ${unsupported.length > 8 ? `<span class="list-meta">+${unsupported.length - 8} more in JSON export</span>` : ""}
    </div>
  `;
}

function renderMessages(title: string, messages: string[], severity: "error" | "warning"): string {
  if (messages.length === 0) {
    return "";
  }
  return `
    <div class="compat-list">
      <strong>${title}</strong>
      ${messages
        .slice(0, 5)
        .map(
          (message) => `
            <div class="compat-row">
              <span class="badge ${severity === "error" ? "error" : "warn"}">${severity}</span>
              <span>${escapeHtml(message)}</span>
            </div>
          `,
        )
        .join("")}
      ${messages.length > 5 ? `<span class="list-meta">+${messages.length - 5} more in JSON export</span>` : ""}
    </div>
  `;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
