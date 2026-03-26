import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../types";
import { indexNavKey } from "../types";

function installViews(
  { app }: EnhanceAppContext,
  configs?: Pick<IndexClientConfig, "nav" | "sidebar">
) {
  const { nav, sidebar } = configs || {};
  app.provide(indexNavKey, nav ?? null);
}

export { installViews };
