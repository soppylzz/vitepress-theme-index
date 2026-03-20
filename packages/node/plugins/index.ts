import type { UserIndexPluginConfig } from "../types";
import { createIndexPluginContext } from "./base";
import { useImportPlugin } from "./import";
import { useConfigPlugin } from "./config";
import { useLocalePlugin } from "./locale";
import type { Plugin } from "vite";

function vitepressThemeIndex(config: UserIndexPluginConfig = {}): Plugin[] {
  const { ctx, contextPlugin } = createIndexPluginContext(config);
  const importPlugin = useImportPlugin(ctx);
  const configPlugin = useConfigPlugin(ctx);
  const localePlugin = useLocalePlugin(ctx);

  return [
    // The order of plugin injection is crucial.
    contextPlugin,
    importPlugin,
    configPlugin,
    localePlugin,
  ];
}

export { vitepressThemeIndex };
