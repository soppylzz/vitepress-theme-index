import type { DeepPartial, DeepRequired, I18NConfig } from "@vitepress-theme-index/shared";
import type { Alias, ResolvedConfig, ViteDevServer } from "vite";

/* ==================== unit ==================== */
const importModes = ["normal", "unify"] as const;
type ImportMode = (typeof importModes)[number];

const importAliasEnvs = ["node", "client"] as const;
type ImportEnv = (typeof importAliasEnvs)[number];
type ImportAlias = { [k in ImportEnv]?: Alias[] | null };

/* ==================== config ==================== */
type IndexImportPluginConfig = {
  dir: string;
  file: string | null;
  mode: ImportMode;
};

type IndexPluginConfig = {
  i18n: I18NConfig;
  addition: { name: string };
};

type IndexPluginInitConfig = IndexPluginConfig & { imports: IndexImportPluginConfig };

type UserIndexPluginConfig = DeepPartial<IndexPluginConfig>;
type ResolvedIndexPluginConfig = DeepRequired<IndexPluginConfig>;

/* ==================== context ==================== */
interface IndexPluginContext {
  viteServer?: ViteDevServer;
  viteConfig?: ResolvedConfig;
  // vitepress-theme-index
  plugins?: DeepRequired<IndexPluginConfig>;
}

export { importAliasEnvs };
export type {
  ImportAlias,
  IndexPluginConfig,
  IndexPluginInitConfig,
  IndexImportPluginConfig,
  IndexPluginContext,
  UserIndexPluginConfig,
  ResolvedIndexPluginConfig,
};
