import { ref } from "vue";

const staticCache = ref<string | null>(null);

export function useGiscusStyl() {
  function getVtiCssVars(): string {
    const computedStyle = getComputedStyle(document.body);
    const vars: string[] = [];

    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i];
      if (prop.startsWith("--vti")) {
        const value = computedStyle.getPropertyValue(prop).trim();
        vars.push(`${prop}: ${value};`);
      }
    }

    return `:root { ${vars.join(" ")} }`;
  }

  async function getOverrideStyl(): Promise<string> {
    const mod = await import("vitepress-theme-index/theme/giscus.css?raw");
    return mod.default;
  }

  async function ensureStaticStyl(): Promise<string> {
    if (staticCache.value) return staticCache.value;

    const override = await getOverrideStyl();

    staticCache.value = [override].filter(Boolean).join("\n\n");

    return staticCache.value;
  }

  async function generateStyl(): Promise<string> {
    const staticStyl = await ensureStaticStyl();
    const vars = getVtiCssVars();

    return [staticStyl, vars].filter(Boolean).join("\n\n");
  }

  return { generateStyl };
}
