import type {
  IndexImportPluginConfig,
  IndexPluginContext,
  IndexPluginInitConfig,
  ResolvedIndexPluginConfig,
  UserIndexPluginConfig,
  ImportAlias,
} from "../types";
import { importAliasEnvs } from "../types";
import {
  CONFIG_PATTERN,
  DEFAULT_IMPORT_CONFIG,
  DEFAULT_PLUGIN_CONFIG,
  NODE_EXTENSIONS,
  PLUGIN_PREFIX,
  VITE_EXTENSIONS,
} from "../const";
import { type Alias, type Plugin, type ViteDevServer } from "vite";
import { normalizeAlias, ssrRewriteLoadModules } from "../utils";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { DeepPartial } from "@vitepress-theme-index/shared";
import { pluginLogger, resolveDefineAble } from "@vitepress-theme-index/shared";
import fs from "node:fs";
import { merge } from "lodash-unified";
import { i18nResolvedId } from "./i18n";
import { addResolvedId } from "./addition";

const PKG_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..", "..");
const CLIENT_MOD = resolve(PKG_ROOT, "client");
const NODE_MOD = resolve(PKG_ROOT, "node");

const alias: ImportAlias = {};
function setAlias(key: keyof ImportAlias, value: Alias[] = []) {
  if (!importAliasEnvs.includes(key)) return;
  if (key in alias) pluginLogger.warn(`Import ${key} already exists`);
  alias[key] = value;
}

function isConfigFile(absPath: string, extensions: string[] | readonly string[]) {
  if (!extensions.some((ext) => absPath.endsWith(ext))) return false;
  if (!fs.existsSync(absPath)) return false;

  const stat = fs.statSync(absPath);
  return stat.isFile();
}

async function loadPluginConfig(
  ctx: IndexPluginContext,
  config: Required<IndexImportPluginConfig>,
  fix: UserIndexPluginConfig = {}
) {
  const { dir, file } = config;

  const hasVite = !!ctx.viteServer && !!ctx.viteConfig;
  const extensions = hasVite ? VITE_EXTENSIONS : NODE_EXTENSIONS;

  function findConfigFile() {
    if (file) {
      const absPath = isAbsolute(file) ? file : resolve(process.cwd(), dir, file);
      return isConfigFile(absPath, extensions) ? absPath : null;
    }
    for (const ext of extensions) {
      const maybeFile = resolve(process.cwd(), dir, `${CONFIG_PATTERN}${ext}`);
      if (isConfigFile(maybeFile, extensions)) return maybeFile;
    }
    return null;
  }

  let inputConfig: Record<string, any> = {};
  const filePath = findConfigFile();

  if (filePath) {
    try {
      const mod = !hasVite
        ? await import(/* @vite-ignore */ pathToFileURL(filePath).href)
        : await ssrRewriteLoadModules(ctx.viteServer!, filePath, {
            alias: alias?.node ?? [],
          });
      inputConfig = await resolveDefineAble<UserIndexPluginConfig>(mod?.default ?? {});
    } catch {
      pluginLogger.warn("load config error, use default config instead");
    }
  }
  ctx.plugins = merge(DEFAULT_PLUGIN_CONFIG, fix, inputConfig) as ResolvedIndexPluginConfig;
  return { filePath };
}

function resolveImportPluginConfig(
  input?: Partial<IndexImportPluginConfig>
): Required<IndexImportPluginConfig> {
  return { ...input, ...DEFAULT_IMPORT_CONFIG };
}

export function createConfigPlugin(
  ctx: IndexPluginContext,
  config?: DeepPartial<IndexPluginInitConfig>
): Plugin {
  const { imports, ...plugins } = config ?? {};
  const resolved = resolveImportPluginConfig(imports);

  // resolve "vitepress-theme-index" as "vitepress-theme-index/client" default
  switch (resolved.mode) {
    case "unify": {
      setAlias("client", [{ find: /^vitepress-theme-index$/, replacement: CLIENT_MOD }]);
      setAlias("node", [{ find: /^vitepress-theme-index$/, replacement: NODE_MOD }]);
      break;
    }
    case "normal":
    default: {
      setAlias("client", [
        { find: /^vitepress-theme-index$/, replacement: "vitepress-theme-index/client" },
      ]);
    }
  }

  function invalidateModes(ids: string[], server: ViteDevServer) {
    ids.forEach((id) => {
      const mod = server.moduleGraph.getModuleById(id);
      if (mod) server.moduleGraph.invalidateModule(mod);
    });
  }

  return {
    name: `${PLUGIN_PREFIX}/import`,
    config(config) {
      config.resolve ||= {};
      const userAlias = normalizeAlias(config.resolve?.alias);
      config.resolve.alias = [...userAlias, ...(alias?.client ?? [])];
    },
    async buildStart() {
      const { filePath } = await loadPluginConfig(ctx, resolved);
      const { viteServer } = ctx;

      if (!viteServer) return;
      viteServer.watcher.add(filePath).on("change", async (file) => {
        pluginLogger.info(`config file changed: ${file}`);
        await loadPluginConfig(ctx, resolved);

        invalidateModes([i18nResolvedId, addResolvedId], viteServer);
        viteServer.ws.send({ type: "full-reload", path: "*" });
      });
    },
  };
}
