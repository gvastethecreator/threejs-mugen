import "./style.css";
import "./styles/studio-desktop-foundation.css";
import "./styles/studio-primitives.css";
import "./styles/studio-command-center.css";
import "./styles/studio-workbench.css";
import "./styles/studio-assets.css";
import { App } from "./app/App";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Missing #app root element");
}

const app = new App(root);
app.start();
