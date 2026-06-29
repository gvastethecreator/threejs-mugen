import "./style.css";
import "./styles/runtime-command-deck.css";
import "./styles/studio-shell-overrides.css";
import "./styles/studio-desktop-foundation.css";
import "./styles/studio-primitives.css";
import "./styles/studio-command-center.css";
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
