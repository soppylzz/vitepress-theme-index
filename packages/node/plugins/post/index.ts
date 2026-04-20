import type { IndexPluginContext, MetaConfig } from "../../types";
import type { Plugin } from "vite";
import type { BuildResult } from "@vitepress-theme-index/shared";
import { PLUGIN_PREFIX } from "../../const";
import {
  INDEX_ARCHIVE_PKG,
  INDEX_OVERALL_PKG,
  INDEX_SEARCH_PKG,
} from "@vitepress-theme-index/shared";
import { IndexPostBuilder } from "./archive";
import { loadMetaCache } from "./meta";
import { resolve } from "node:path";

function createMetaPlugin(ctx: IndexPluginContext): Plugin {
  let config: MetaConfig | undefined;
  let builder: IndexPostBuilder | null = null;
  let datas: BuildResult | null = null;

  return {
    name: `${PLUGIN_PREFIX}/post`,
    buildStart: {
      sequential: true,
      async handler() {
        if (!ctx?.ctx) return;
        config = ctx.ctx.meta;
        const { posts, changedPostPath, allPostPath } = await loadMetaCache(config);

        const workDir = ctx.viteConfig.isProduction
          ? resolve(process.cwd(), ".vitepress", "dist", config.cache.dir)
          : resolve(process.cwd(), ".vitepress", "cache", config.cache.dir);
        const baseUrl = ctx.viteConfig.isProduction
          ? `/${config.cache.dir}`
          : `/.vitepress/cache/${config.cache.dir}`;

        builder = await new IndexPostBuilder(config, workDir).use(ctx.ctx.plugins);
        datas = await builder.build(posts, baseUrl, changedPostPath, allPostPath);
      },
    },
    resolveId(id) {
      if ([INDEX_ARCHIVE_PKG, INDEX_SEARCH_PKG, INDEX_OVERALL_PKG].includes(id)) return id;
    },
    load(id) {
      const virtualMap = {
        [INDEX_ARCHIVE_PKG]: datas?.archiveRecord,
        [INDEX_OVERALL_PKG]: datas?.allPostInfo,
        [INDEX_SEARCH_PKG]: datas?.searchIndex,
      };
      if (id in virtualMap) return `export default ${JSON.stringify(virtualMap[id] ?? {})};`;
    },
  };
}

export { createMetaPlugin };
