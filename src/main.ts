import "./style.css";
import "./styles/app-shell.css";
import "./styles/studio-legacy-surfaces.css";
import "./styles/studio-legacy-shell-refresh.css";
import "./styles/studio-legacy-layout-refresh.css";
import "./styles/studio-legacy-neutral-pass.css";
import "./styles/studio-legacy-command-refinement.css";
import "./styles/studio-legacy-command-final.css";
import "./styles/studio-legacy-editor-shell.css";
import "./styles/studio-legacy-responsive.css";
import "./styles/studio-legacy-polish.css";
import "./styles/studio-editor-cascade.css";
import "./styles/studio-editor-dcc-shelf.css";
import "./styles/studio-editor-command-center.css";
import "./styles/studio-editor-grade-polish.css";
import "./styles/studio-ui-hardening.css";
import "./styles/runtime-legacy-command-room.css";
import "./styles/studio-instrument-hardening.css";
import "./styles/studio-tab-hardening.css";
import "./styles/studio-workbench-module-hardening.css";
import "./styles/studio-responsive-hardening.css";
import "./styles/studio-desktop-authority.css";
import "./styles/studio-desktop-eof-dcc.css";
import "./styles/studio-desktop-dcc-console.css";
import "./styles/studio-desktop-fit-fixes.css";
import "./styles/studio-desktop-command-polish.css";
import "./styles/studio-desktop-final-surface.css";
import "./styles/studio-desktop-hard-surface.css";
import "./styles/runtime-command-deck.css";
import "./styles/studio-shell-playfield.css";
import "./styles/studio-shell-workstation.css";
import "./styles/studio-shell-topbar.css";
import "./styles/studio-shell-surface-system.css";
import "./styles/studio-desktop-foundation.css";
import "./styles/studio-primitives.css";
import "./styles/studio-command-shell.css";
import "./styles/studio-command-pipeline.css";
import "./styles/studio-command-playfield.css";
import "./styles/studio-command-console.css";
import "./styles/stage-toolbar-controls.css";
import "./styles/studio-command-palette.css";
import "./styles/studio-workbench.css";
import "./styles/studio-assets.css";
import "./styles/studio-stage.css";
import "./styles/studio-trust-ledgers.css";
import "./styles/studio-system-ledgers.css";
import "./styles/studio-inspector.css";
import { App } from "./app/App";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

const app = new App(root);
app.start();
