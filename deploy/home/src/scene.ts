import { mountRobotScene } from "../../../apps/web/app/visuals/robot-scene";

const host = document.getElementById("robot-stage");
const toggle = document.querySelector<HTMLButtonElement>("[data-scene-pause]");

if (host && toggle) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let controller: ReturnType<typeof mountRobotScene> = null;
  let paused = reducedMotion.matches;

  function updateToggle() {
    toggle!.hidden = !controller || reducedMotion.matches;
    toggle!.setAttribute("aria-pressed", String(paused));
    toggle!.textContent = paused ? "播放动态" : "暂停动态";
  }

  function mount() {
    if (controller) return;
    try {
      controller = mountRobotScene(host!);
      controller?.setPaused(paused);
    } catch {
      // A browser without WebGL keeps the static SVG instead of a blank panel.
      controller?.dispose();
      controller = null;
    }
    updateToggle();
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    controller?.setPaused(paused);
    updateToggle();
  });
  reducedMotion.addEventListener("change", () => {
    paused = reducedMotion.matches;
    controller?.setPaused(paused);
    updateToggle();
  });
  host.addEventListener("webglcontextlost", () => {
    controller = null;
    updateToggle();
  }, true);
  window.addEventListener("pagehide", () => {
    controller?.dispose();
    controller = null;
    updateToggle();
  });
  window.addEventListener("pageshow", mount);
  mount();
}
