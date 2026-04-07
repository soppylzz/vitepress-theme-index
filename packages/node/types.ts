import type {
  DeepPartial,
  DeepRequired,
  I18NConfig,
  MaybeArray,
  PostMetaInfo,
  IndexErrorInterceptor,
  IndexPostPlugin,
  DefineAble,
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
    file: string;
    enable: boolean;
    concurrency: number;
    defaultLast: DefaultLast;
  };
}

interface MetaCache {
  hashKey: string;
  generate: number;
  posts: PostMetaInfo[];
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
type ResolvedIndexPluginConfig = DeepRequired<IndexPluginConfig>;

/* ==================== context ==================== */
type IndexPluginContext = Partial<{
  viteServer: ViteDevServer;
  viteConfig: ResolvedConfig;
  // vitepress-theme-index
  ctx: DeepRequired<IndexPluginConfig>;
  cwd: string;
}>;

export { importAliasEnvs };
export type {
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
