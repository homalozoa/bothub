// Self-host the procedural Three.js scene under the static site's strict CSP.
import { build } from "vite";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
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
// Cloudflare's browser-cache TTL may override origin revalidation. Ordinary release versions
// keep the HTML, stylesheet and graphics entry aligned without a custom cache/hash mechanism.
const release = process.env.WEB_RELEASE;
if (release) {
  const version = encodeURIComponent(release);
  const indexPath = path.join(root, "deploy/home/public/index.html");
  const html = await readFile(indexPath, "utf8");
  await writeFile(indexPath, html
    .replace(/href="\/styles\.css(?:\?[^\"]*)?"/, `href="/styles.css?v=${version}"`)
    .replace(/src="\/assets\/scene\.js(?:\?[^\"]*)?"/, `src="/assets/scene.js?v=${version}"`));
}
