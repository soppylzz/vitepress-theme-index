import type { GiscusFontConfig } from "../../types";
import { buildFontCss } from "./font";
import { isVar } from "../../composables";

interface StyleCache {
  static: string | null;
  fonts: Map<string, string>;
}

const cache: StyleCache = {
  static: null,
  fonts: new Map(),
};

function getVtiCssVars(): string {
  const computedStyle = getComputedStyle(document.body);
  const vars: string[] = [];

  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    if (isVar(prop)) {
      const value = computedStyle.getPropertyValue(prop).trim();
      vars.push(`${prop}: ${value};`);
    }
  }

  return vars.length ? `:root { ${vars.join(" ")} }` : "";
}

async function getOverrideStyl(): Promise<string> {
  try {
    const mod = await import("vitepress-theme-index/theme/giscus.css?raw");
    return mod.default || "";
  } catch {
    return "";
  }
}

async function ensureStaticStyl(): Promise<string> {
  if (cache.static !== null) {
    return cache.static;
  }
  cache.static = await getOverrideStyl();
  return cache.static;
}

function generateFontStyl(fontsMap: Record<string, GiscusFontConfig>, preset: string): string {
  const cacheKey = preset;

  if (cache.fonts.has(cacheKey)) {
    return cache.fonts.get(cacheKey) || "";
  }

  const fontCss = buildFontCss(fontsMap, preset);
  cache.fonts.set(cacheKey, fontCss);

  return fontCss;
}

export function useGiscusStyl() {
  async function generateStyl(
    fontsMap?: Record<string, GiscusFontConfig>,
    preset?: string
  ): Promise<string> {
    const parts: string[] = [];

    const staticStyl = await ensureStaticStyl();
    if (staticStyl) parts.push(staticStyl);

    if (fontsMap && preset) {
      const fontStyl = generateFontStyl(fontsMap, preset);
      if (fontStyl) parts.push(fontStyl);
    }

    const dynamicStyl = getVtiCssVars();
    if (dynamicStyl) parts.push(dynamicStyl);

    return parts.filter(Boolean).join("\n\n");
  }

  function clearCache(): void {
    cache.static = null;
    cache.fonts.clear();
  }

  return { generateStyl, clearCache };
}
