import type { IndexPluginContext, MetaConfig } from "../../types";
import type { Plugin } from "vite";
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
  let datas: Awaited<ReturnType<IndexPostBuilder["build"]>> | null = null;

  return {
    name: `${PLUGIN_PREFIX}/post`,
    buildStart: {
      sequential: true,
      async handler() {
        if (!ctx?.ctx) return;
        config = ctx.ctx.meta;
        const cache = await loadMetaCache(config);
        builder = await new IndexPostBuilder(config).use(ctx.ctx.plugins);

        const workDir = ctx.viteConfig.isProduction
          ? resolve(ctx.viteConfig.publicDir, config.cache.dir)
          : resolve(process.cwd(), ".vitepress", "cache", config.cache.dir);

        datas = await builder.build(
          cache.posts,
          workDir,
          ctx.viteConfig.isProduction
            ? `/${config.cache.dir}`
            : `/.vitepress/cache/${config.cache.dir}`
        );
      },
    },
    resolveId(id) {
      if ([INDEX_ARCHIVE_PKG, INDEX_SEARCH_PKG, INDEX_OVERALL_PKG].includes(id)) return id;
    },
    load(id) {
      const virtualMap = {
        [INDEX_ARCHIVE_PKG]: datas?.statRecord,
        [INDEX_OVERALL_PKG]: datas?.allPostInfo,
        [INDEX_SEARCH_PKG]: datas?.searchIndex,
      };
      if (id in virtualMap) return `export default ${JSON.stringify(virtualMap[id] ?? {})};`;
    },
  };
}

export { createMetaPlugin };
