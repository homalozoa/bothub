// The selected folded-Z mark: shared by the web UI, icon exports and share images.
export const BRAND_ASSET_VERSION = "jiwen-z";
export const BRAND_COLORS = {
  violet: "#7040b7", mint: "#9bdfc2", yellow: "#ffe18c", paper: "#fff9f1", ink: "#292435",
} as const;

export const Z_MARK = {
  viewBox: "0 0 128 128",
  paths: [
    { fill: BRAND_COLORS.yellow, d: "M32 79L52 81L50 89H98C107 89 112 94 112 101C112 108 107 113 100 113H29C18 113 12 107 15 98C17 91 23 87 32 79Z" },
    { fill: BRAND_COLORS.mint, d: "M93 19C110 22 118 40 109 53L54 94C43 102 25 91 33 80L95 32Z" },
    { fill: BRAND_COLORS.violet, d: "M30 18H94C106 18 111 28 106 37C104 42 99 45 94 45H30C21 45 15 40 15 32C15 24 21 18 30 18Z" },
  ],
} as const;

export function brandSvg(title: string, monochrome?: string): string {
  const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${Z_MARK.viewBox}"><title>${safeTitle}</title>${Z_MARK.paths.map((p) => `<path d="${p.d}" fill="${monochrome ?? p.fill}"/>`).join("")}</svg>\n`;
}
