import type {
  DeepPartial,
  DeepRequired,
  I18NConfig,
  MaybeArray,
  DefineAble,
  PostRawData,
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

interface MetaConfig {
  include: MaybeArray<string>;
  exclude: MaybeArray<string>;
  cache: {
    enable: boolean;
    dir: string;
    pageSize: number;
    concurrency: number;
    defaultLast: DefaultLast;
  };
}

interface MetaCache {
  hashKey: string;
  generate: number;
  posts: PostRawData[];
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
  extract: (post: PostRawData) => MaybeArray<string> | null | undefined;
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
