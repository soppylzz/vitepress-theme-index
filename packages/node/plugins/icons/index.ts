import type { IconConfig, IndexPluginContext } from "../../types";
import type { Plugin } from "vite";
import { PLUGIN_PREFIX } from "../../const";
import { INDEX_ICON_PKG, pascalCase, svgoConfig } from "@vitepress-theme-index/shared";
import { optimize } from "svgo";
import glob from "fast-glob";
import { isArray } from "lodash-unified";
import fs from "fs-extra";
import { basename } from "node:path";

const INDEX_ALL_ENTRY = `${INDEX_ICON_PKG}/all`;

function transformSvgToVue(name: string, svgContent: string): string {
  const { data } = optimize(svgContent, svgoConfig);

  const cleaned = data
    .replace(/<\?xml.*?\?>/g, "")
    .replace(/<!DOCTYPE.*?>/g, "")
    .trim();

  const match = cleaned.match(/^<svg([^>]*)>([\s\S]*?)<\/svg>$/);

  const rawAttrs = match?.[1] || "";
  const inner = match?.[2] || "";

  const attrsObject = rawAttrs.replace(/([:@\w-]+)="([^"]*)"/g, (_, k, v) => {
    return `"${k}": "${v}",`;
  });

  return `
export const ${name} = defineComponent({
  name: "${name}",
  setup(_, { attrs }) {
    return () => h(
      "svg",
      {
        ${attrsObject}
        ...attrs
      },
      [
        h("g", { innerHTML: ${JSON.stringify(inner)} })
      ]
    );
  }
});
`;
}

async function scanIcons(icons: IconConfig[] = []) {
  const map = new Map<string, string>();

  for (const { prefix, inputs } of icons) {
    // prepare icons
    const svgs: string[] = [];
    if (isArray(inputs)) {
      svgs.push(...inputs);
    } else {
      const files = await glob("**/*.svg", {
        cwd: inputs as string,
        absolute: true,
        onlyFiles: true,
      });
      svgs.push(...files);
    }

    svgs.forEach((svg) => {
      if (!fs.existsSync(svg) || !svg.endsWith(".svg")) return;

      const svgContent = fs.readFileSync(svg, "utf8");
      const svgName = basename(svg, ".svg");
      const compName = `${pascalCase(prefix)}${pascalCase(svgName)}`;

      map.set(compName, svgContent);
    });
  }
  return map;
}

function createIconPlugin(ctx: IndexPluginContext): Plugin {
  let iconMaps: Map<string, string> | null = null;

  return {
    name: `${PLUGIN_PREFIX}/icons`,
    buildStart: {
      sequential: true,
      async handler() {
        if (!ctx?.ctx) return;
        const config = ctx.ctx.icon;
        iconMaps = await scanIcons(config);
      },
    },
    resolveId(id) {
      if (id === INDEX_ICON_PKG || id === INDEX_ALL_ENTRY) return id;
    },
    load(id) {
      if (id === INDEX_ICON_PKG) {
        let code = 'import { defineComponent, h } from "vue";';
        for (const [name, content] of iconMaps.entries()) {
          code += transformSvgToVue(name, content);
        }
        return code;
      }
      if (id === INDEX_ALL_ENTRY) {
        return `
         import * as icons from "${INDEX_ICON_PKG}";
         
         function install(app) {
          for (const key in icons) {
            app.component(key, icons[key]);
          }
         }
         
         export default { install };
        `;
      }
    },
  };
}

export { createIconPlugin };
