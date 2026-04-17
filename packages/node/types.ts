import type {
  DeepPartial,
  DeepRequired,
  I18NConfig,
  MaybeArray,
  DefineAble,
  PostInfo,
  ArchiveData,
  IndexErrorInterceptor,
} from "@vitepress-theme-index/shared";
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

type DefaultLast = "now" | "mtime";

interface PostCacheConfig {
  enable: boolean;
  dir: string;
  concurrency: number;
  defaultLast: DefaultLast;
}

interface PostLocaleConfig {
  patterns: Array<{
    locale: string;
    pattern: string | RegExp;
  }>;
  default: string;
}

interface PostContentIndexConfig {
  pageSize: number;
}

interface MetaConfig {
  include: MaybeArray<string>;
  exclude: MaybeArray<string>;
  cache: PostCacheConfig;
  locale: PostLocaleConfig;
  index: PostContentIndexConfig;
}

interface MetaCache {
  hashKey: string;
  generate: number;
  posts: PostInfo[];
}

type IndexPluginConfig = {
  i18n: I18NConfig;
  meta: MetaConfig;
  addition: { name: string };
  plugins: DefineAble<IndexPostPlugin>[];
};

type IndexPluginInitConfig = IndexPluginConfig & {
  imports: IndexImportPluginConfig;
  logger: IndexErrorInterceptor;
};

type UserIndexPluginConfig = DeepPartial<IndexPluginConfig>;
type ResolvedIndexPluginConfig = DeepRequired<Omit<IndexPluginConfig, "i18n">> & {
  i18n: Required<IndexPluginConfig["i18n"]>;
};

/* ==================== plugin ==================== */
interface IndexPostPlugin {
  name: string;
  pageSize?: number;
  extract: (post: PostInfo) => MaybeArray<string> | null | undefined;
  postProcess?: (map: ArchiveData) => ArchiveData;
}

/* ==================== context ==================== */
type IndexPluginContext = Partial<{
  viteServer: ViteDevServer;
  viteConfig: ResolvedConfig;
  // vitepress-theme-index
  ctx: ResolvedIndexPluginConfig;
}>;

export { importAliasEnvs };
export type {
  IndexPostPlugin,
  DefaultLast,
  MetaCache,
  MetaConfig,
  ImportAlias,
  IndexPluginConfig,
  IndexPluginInitConfig,
  IndexImportPluginConfig,
  IndexPluginContext,
  UserIndexPluginConfig,
  ResolvedIndexPluginConfig,
};
