// Self-host the procedural Three.js scene under the static site's strict CSP.
import { build } from "vite";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const assets = path.join(root, "deploy/home/public/assets");
await build({
  configFile: false,
  publicDir: false,
  build: {
    target: "es2022",
    outDir: assets,
    emptyOutDir: true,
    lib: { entry: path.join(root, "deploy/home/src/scene.ts"), formats: ["es"], fileName: () => "scene.js" },
    minify: true,
  },
});
await mkdir(assets, { recursive: true });
await copyFile(path.join(root, "node_modules/three/LICENSE"), path.join(assets, "THREE-LICENSE.txt"));
