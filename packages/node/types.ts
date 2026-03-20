import type {
  DeepPartial,
  DeepRequired,
  MaybeArray,
  ResolvedIndexConfig,
} from "@vitepress-theme-index/shared";
import type { Alias, ResolvedConfig, ViteDevServer } from "vite";

/* ==================== unit ==================== */
export const importModes = ["normal", "unify"] as const;
export type ImportMode = (typeof importModes)[number];

export const importAliasKeys = ["node", "client"] as const;
export type ImportAliasKeys = (typeof importAliasKeys)[number];
export type ImportAlias = { [k in ImportAliasKeys]?: Alias[] | null };

/* ==================== module ==================== */
export interface BaseWatchConfig {
  watch: {
    enabled: boolean;
    debounce: number | boolean;
  };
}
export interface ConfigConfig extends BaseWatchConfig {
  /**
   * Explicit path to index config file.
   * Auto-detected when omitted.
   */
  file: string | null;
}
export interface LocalesConfig extends BaseWatchConfig {
  /**
   * Glob pattern(s) for locale files
   */
  patterns: MaybeArray<string>;
}

/* ==================== config ==================== */
export type UserIndexPluginConfig = DeepPartial<{
  mode: ImportMode;
  config: ConfigConfig;
  locales: LocalesConfig;
}>;

export type ResolvedIndexPluginConfig = DeepRequired<UserIndexPluginConfig>;

/* ==================== context ==================== */
type DefaultReset = (...args: unknown[]) => void;
type DefaultLoad = (...args: unknown[]) => Promise<ResolvedIndexConfig>;
export interface IndexConfigLoader<LOAD extends DefaultLoad, RESET extends DefaultReset> {
  load: LOAD;
  reset: RESET;
  readonly filePath: string | null;
}

export interface IndexPluginContext<
  LOAD extends DefaultLoad = DefaultLoad,
  RESET extends DefaultReset = DefaultReset,
> extends ResolvedIndexPluginConfig {
  viteServer?: ViteDevServer;
  viteConfig?: ResolvedConfig;
  alias?: Readonly<ImportAlias>;
  setAlias(key: ImportAliasKeys, value?: Alias[]): void;
  loader?: IndexConfigLoader<LOAD, RESET>;
}
