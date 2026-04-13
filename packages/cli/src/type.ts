import type { MaybePromise } from "@vitepress-theme-index/shared";

interface IndexCliOptions {
  folder: string;
  siteName: string;
  prefix: string;
  i18n: boolean;
  useTs: boolean;
  mode: "docs" | "blog";
  addScript: boolean;
  dev?: boolean;
}

interface ScaffoldMetadata {
  pkgFound?: boolean;
  depsToAdd?: Record<string, string>;
  validationFailed?: boolean;
  validateErrors?: Array<{ name: string; code: string; msg: string }>;
}

interface HookContext {
  options: IndexCliOptions;
  pkgData?: Record<string, any>;
  depsToAdd?: Record<string, string>;
  metadata: ScaffoldMetadata;
}

interface EjsDataOptions {
  siteName: string;
  i18n: boolean;
  lang?: "en" | "zh";
}

interface AdditionDataOptions {
  lang?: "en" | "zh";
}

interface CliModule {
  name: string;
  validate?: (ctx: HookContext) => MaybePromise<boolean | [string, string]>;
  create?: (ctx: HookContext) => MaybePromise<void>;
  postCreate?: (ctx: HookContext) => MaybePromise<void>;
}

export type {
  AdditionDataOptions,
  IndexCliOptions,
  CliModule,
  HookContext,
  ScaffoldMetadata,
  EjsDataOptions,
};
