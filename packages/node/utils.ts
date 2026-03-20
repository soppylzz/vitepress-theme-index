import type { ResolvedIndexConfig, UserIndexConfig } from "@vitepress-theme-index/shared";
import type { Alias, ViteDevServer } from "vite";
import { normalizePath } from "vite";
import type { BaseWatchConfig, IndexConfigLoader, IndexPluginContext } from "./types";
import { pathToFileURL } from "node:url";
import { CONFIG_PATTERN, DEFAULT_CONFIG, NODE_EXTENSIONS, VITE_EXTENSIONS } from "./const";
import { isAbsolute, join, resolve } from "node:path";
import fs from "node:fs";
import { isArray, merge } from "lodash-unified";

function normalizeAlias(alias?: Readonly<Alias[] | Record<string, string>>): Alias[] {
  if (!alias) return [];
  if (isArray(alias)) return [...alias] as Alias[];
  return Object.entries(alias).map(([find, replacement]) => ({ find, replacement }));
}

function applyAlias(id: string, alias: Alias[]) {
  const normalizedId = normalizePath(id);
  for (const a of alias) {
    const { find, replacement } = a;
    if (find instanceof RegExp) {
      if (!find.test(normalizedId)) continue;
      return normalizedId.replace(find, replacement);
    }
    if (normalizedId === find || normalizedId.startsWith(`${find}/`)) {
      return `${replacement}${normalizedId.slice(find.length)}`;
    }
  }
  return normalizedId;
}

async function ssrRewriteLoadModules(
  viteServer: ViteDevServer,
  filePath: string,
  rewrites?: { alias?: readonly Alias[] }
) {
  const container = viteServer.pluginContainer;
  const originalResolveId = container.resolveId.bind(container);

  container.resolveId = async (id, importer, options) => {
    const isEntry = !importer || importer === filePath;
    if (isEntry) {
      const preResolvedId = applyAlias(id, [...(rewrites?.alias || [])]);
      return originalResolveId(preResolvedId, importer, options);
    }
    return originalResolveId(id, importer, options);
  };

  try {
    const module = viteServer.moduleGraph.getModuleById(filePath);
    if (module) viteServer.moduleGraph.invalidateModule(module);

    return await viteServer.ssrLoadModule(filePath);
  } finally {
    container.resolveId = originalResolveId;
  }
}

function resolveWatchConfig(watch?: BaseWatchConfig["watch"]) {
  const watchEnabled = watch?.enabled || true;
  const debounceTime =
    typeof watch?.debounce === "number" ? watch.debounce : watch?.debounce === true ? 100 : 0;
  return {
    watchEnabled,
    debounceTime,
  };
}

type InputUserIndexConfig =
  | UserIndexConfig
  | (() => UserIndexConfig)
  | (() => Promise<UserIndexConfig>);

function defineIndex(config: InputUserIndexConfig): InputUserIndexConfig {
  return config;
}

/* ==================== composable ==================== */
type LoadFn = (
  rewrites?: Parameters<typeof ssrRewriteLoadModules>[2]
) => Promise<ResolvedIndexConfig>;

function createIndexConfigLoader(
  ctx: IndexPluginContext<LoadFn, () => void>
): IndexConfigLoader<LoadFn, () => void> {
  let promise: Promise<ResolvedIndexConfig> | null = null;
  let userConfig: UserIndexConfig;
  /* export as a watch-source */
  let resolvedFilePath: ReturnType<typeof findConfigFile>;

  const findConfigFile = (file: string | null, extensions: readonly string[]) => {
    const isConfigFile = (p: string) => extensions.some((ext) => p.endsWith(ext));
    const resolveFormDir = (dir: string) => {
      for (const ext of extensions) {
        const fullPath = join(dir, `${CONFIG_PATTERN}${ext}`);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
      }
      return null;
    };
    // explicit file
    if (file) {
      const absPath = isAbsolute(file) ? file : resolve(process.cwd(), ".vitepress", file);
      if (!fs.existsSync(absPath)) return null;

      const stat = fs.statSync(absPath);
      if (stat.isFile() && isConfigFile(absPath)) return absPath;
      if (stat.isDirectory()) return resolveFormDir(absPath);
      return null;
    }
    // implicit cwd
    return resolveFormDir(resolve(process.cwd(), ".vitepress"));
  };

  const resolveConfig = async (config: InputUserIndexConfig): Promise<UserIndexConfig> => {
    if (typeof config === "function") return await config();
    if (config && typeof config === "object") return config as UserIndexConfig;
    return {};
  };

  const reset = () => {
    promise = null;
  };
  const load: LoadFn = async (rewrites) => {
    if (promise) return promise;

    // promise re-generate when "index.config.*" change
    promise = (async () => {
      const hasVite = !!(ctx.viteServer && ctx.viteConfig);
      const extensions = hasVite ? VITE_EXTENSIONS : NODE_EXTENSIONS;
      const file = ctx.config?.file;

      let mod: Record<string, any>;

      resolvedFilePath = findConfigFile(file, extensions);
      if (!resolvedFilePath) return {} as UserIndexConfig;

      try {
        if (hasVite) {
          // recommend: use vite import file
          mod = await ssrRewriteLoadModules(ctx.viteServer!, resolvedFilePath, rewrites);
        } else {
          // polyfill: use node import file
          mod = await import(/* @vite-ignore */ pathToFileURL(resolvedFilePath).href);
        }
        userConfig = await resolveConfig(mod?.default ?? {});
        return userConfig;
      } catch {
        return {} as UserIndexConfig;
      }
    })().then((res: UserIndexConfig) => {
      return merge(DEFAULT_CONFIG, res) as ResolvedIndexConfig;
    });
    return promise;
  };

  return {
    load,
    reset,
    get filePath() {
      return resolvedFilePath;
    },
  };
}

export { defineIndex, normalizeAlias, resolveWatchConfig, createIndexConfigLoader };
export type { LoadFn };
