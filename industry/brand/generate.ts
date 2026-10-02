// Development text mark: one “机” glyph, with PNG and ICO exports from the same SVG.
// Uses existing opentype.js / sharp dependencies; no font package is needed at runtime.
// Usage: node industry/brand/generate.ts <@fontsource/noto-sans-sc package directory>
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";

const pkg = process.argv[2];
if (!pkg) throw new Error("usage: node industry/brand/generate.ts <noto-sans-sc package directory>");
const character = "机";
const cp = character.codePointAt(0)!;
const css = readFileSync(path.join(pkg, "900.css"), "utf8");
const faces = [...css.matchAll(/url\(\.\/files\/([\w-]+)\.woff2\)[^;]*;\s*unicode-range: ([^;]+);/g)];
const face = faces.find((m) => m[2]!.split(",").some((range) => {
  const [a, b] = range.trim().replace("U+", "").split("-").map((value) => parseInt(value, 16));
  return cp >= a! && cp <= (b ?? a!);
}));
if (!face) throw new Error(`font package has no glyph for ${character}`);
const buffer = readFileSync(path.join(pkg, "files", `${face[1]}.woff`));
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const box = font.getPath(character, 0, 0, 1000).getBoundingBox();
const scale = Math.min(326 / (box.x2 - box.x1), 326 / (box.y2 - box.y1));
const glyph = font.getPath(character, 256 - (box.x1 + box.x2) * scale / 2, 256 - (box.y1 + box.y2) * scale / 2, 1000 * scale).toPathData(1);
const svg = `<!-- Development text mark. Noto Sans SC Black (SIL OFL 1.1). -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>机器人热点</title><rect width="512" height="512" rx="116" fill="#13191c"/><path d="${glyph}" fill="#2ce2e8"/></svg>\n`;
const out = "industry/brand";
writeFileSync(`${out}/logo.svg`, svg);
for (const [name, size] of [["icon.png", 512], ["icon-192.png", 192], ["apple-icon.png", 180]] as const) {
  writeFileSync(`${out}/${name}`, await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer());
}
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const at = 6 + index * 16;
  header[at] = size;
  header[at + 1] = size;
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(images[index]!.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += images[index]!.length;
});
writeFileSync(`${out}/favicon.ico`, Buffer.concat([header, ...images]));
console.log("Generated development text mark and icons in industry/brand");
