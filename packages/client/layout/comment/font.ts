import type { GiscusInjectionFont, GiscusFontConfig } from "../../types";
import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray } from "@vitepress-theme-index/shared";
import { cssVarName } from "../../composables";

function generateFontFaceCss(fonts: GiscusInjectionFont[]): string {
  return fonts
    .map(
      (font) =>
        `@font-face { font-family: '${font.name}'; src: url('${font.src}') format('${font.type}'); }`
    )
    .join("\n\n");
}

function generateFontFamilyVar(name: string, family: MaybeArray<string>): string {
  const vars = ensureArray(family)
    .map((f) => `'${f}'`)
    .join(", ");
  return `:root { ${name}: ${vars}; }`;
}

function buildFontCss(fontsMap: Record<string, GiscusFontConfig>, preset: string): string {
  const config = fontsMap[preset];
  if (!config) return "";

  const parts: string[] = [];
  if (config.fonts.length > 0) {
    parts.push(generateFontFaceCss(config.fonts));
  }

  parts.push(generateFontFamilyVar(cssVarName(["giscus", "code", "family"]), config.code));
  parts.push(generateFontFamilyVar(cssVarName(["giscus", "text", "family"]), config.text));

  return parts.join("\n\n");
}

export { buildFontCss };
