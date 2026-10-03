// Export the approved folded-Z vector mark and site icons. No runtime font dependency.
// Usage: node industry/brand/generate.ts
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { SITE } from "../site.ts";
import { brandSvg, BRAND_COLORS } from "../branding.ts";

const svg = brandSvg(SITE.name);
const out = "industry/brand";
writeFileSync(`${out}/logo.svg`, svg);
writeFileSync(`${out}/logo-mono.svg`, brandSvg(SITE.name, BRAND_COLORS.violet));
writeFileSync(`${out}/logo-reversed.svg`, brandSvg(SITE.name, "#ffffff"));
for (const [name, size] of [["icon.png", 512], ["icon-192.png", 192], ["apple-icon.png", 180]] as const) {
  let image = sharp(Buffer.from(svg)).resize(size, size);
  if (name === "apple-icon.png") image = image.flatten({ background: BRAND_COLORS.paper });
  writeFileSync(`${out}/${name}`, await image.png().toBuffer());
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
writeFileSync("deploy/home/public/favicon.svg", brandSvg("OpenZoo"));
const homePath = "deploy/home/public/index.html";
const homeMark = brandSvg("OpenZoo").replace("<svg ", '<svg class="brand-mark" aria-hidden="true" ');
writeFileSync(homePath, readFileSync(homePath, "utf8").replace(/<svg class="brand-mark"[\s\S]*?<\/svg>/, homeMark.trim()));
console.log("Generated Jiwen folded-Z vector mark and PNG/ICO icons");
