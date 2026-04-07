import type {
  DefineAble,
  IndexPostArchives,
  IndexPostPlugin,
  PostMetaInfo,
} from "@vitepress-theme-index/shared";
import { ensureArray, pluginLogger, resolveDefineAble } from "@vitepress-theme-index/shared";
import { isNull, isUndefined } from "lodash-unified";

class IndexPostBuilder {
  private plugins: IndexPostPlugin[] = [];
  private searchIndex: Array<{ id: string; content: string }> = [];
  private registeredNames = new Set<string>();

  public async use(plugin: DefineAble<IndexPostPlugin>[]) {
    const plugins = await Promise.all(
      ensureArray(plugin).map(async (raw) => {
        const p = await resolveDefineAble(raw);
        p.name = p.name.trim();
        return p;
      })
    );
    for (const plugin of plugins) {
      const name = plugin.name;
      if (!name) pluginLogger.error("plugin name is empty");
      if (this.registeredNames.has(name)) pluginLogger.error("plugin name has been registered");

      this.registeredNames.add(name);
      this.plugins.push(plugin);
    }
    return this;
  }

  public build(posts: PostMetaInfo[]) {
    const archives = {} as Record<string, IndexPostArchives>;
    for (const plugin of this.plugins) {
      archives[plugin.name] = {};
    }

    for (const post of posts) {
      const { content, ...archivePost } = post;

      this.searchIndex.push({
        id: archivePost.hash,
        content: content,
      });

      for (const plugin of this.plugins) {
        try {
          const keysRaw = plugin.extract(post);
          const targetArchive = archives[plugin.name];

          if (isNull(keysRaw)) continue;

          for (const key of ensureArray(keysRaw)) {
            const safeKey = key.trim();
            if (isNull(safeKey) || isUndefined(safeKey)) continue;

            if (!targetArchive[safeKey]) {
              targetArchive[safeKey] = [];
            }
            targetArchive[safeKey].push(archivePost);
          }
        } catch {
          // silent skip
        }
      }
    }

    for (const plugin of this.plugins) {
      if (plugin?.postProcess) {
        archives[plugin.name] = plugin.postProcess(archives[plugin.name]);
      }
    }

    return { archives, searchIndex: this.searchIndex };
  }
}

export { IndexPostBuilder };
