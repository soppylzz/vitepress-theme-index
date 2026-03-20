import type {
  BaseMenuConfig,
  IndexMenuContextConfig,
  MenuDynamicContext,
  MenuDynamicKey,
  MenuItemRecord,
  ProvideMenuConfig,
  UserIndexRightMenuConfig,
  ResolvedIndexRightMenuConfig,
} from "../../types";
import {
  rightMenuPrivateKey,
  provideMenuConfigKeys,
  staticMenuConfigKeys,
  baseMenuConfigKeys,
  indexRightMenuGlobalKey,
} from "../../types";
import {
  installMenuNav,
  useMenuNav,
  provideRightMenuContext,
  useCachedComputed,
  useReactiveProxy,
  createMenuContext,
} from "../../utils";
import { renderRightMenuTree } from "./render";
import { resolveIndexMenuConfig } from "./resolve";
import { installDynamicMenuDirective } from "./directives";
import type { App, Reactive } from "vue";
import { toRefs, watchEffect } from "vue";
import { omit, pick } from "lodash-unified";
import type { EnhanceAppContext } from "vitepress";

/* =============== setup mode =============== */
function useBaseSetup(app: App) {
  installMenuNav(app);
  const menuNav = useMenuNav();
  const baseProps = { path: [], rect: [0, 0] as [number, number] };
  const baseHooks = { onClose: menuNav.close };

  app.provide(rightMenuPrivateKey, null);

  return { menuNav, baseProps, baseHooks };
}

function useManualModeSetup(
  app: App,
  config: ResolvedIndexRightMenuConfig<MenuItemRecord>,
  base: ReturnType<typeof useBaseSetup>
) {
  const { menuNav, baseProps, baseHooks } = base;
  const static_ = createMenuContext(
    pick(config, [...baseMenuConfigKeys, ...provideMenuConfigKeys]) as Required<
      BaseMenuConfig & ProvideMenuConfig
    >
  );

  app.provide(indexRightMenuGlobalKey, { mode: "manual", ...static_, ...menuNav });
  provideRightMenuContext({ ...baseProps, ...toRefs(static_.ctx) }, baseHooks, app);
}

function useDynamicModeSetup(
  app: App,
  config: ResolvedIndexRightMenuConfig<MenuItemRecord>,
  base: ReturnType<typeof useBaseSetup>
) {
  const { mode, trigger } = config;
  const { menuNav, baseProps, baseHooks } = base;

  const dynamic = useCachedComputed<MenuDynamicKey, MenuDynamicContext>();
  const static_ = createMenuContext(
    omit(config, staticMenuConfigKeys) as Required<IndexMenuContextConfig>
  );
  installDynamicMenuDirective(app, dynamic);

  if (mode === "mixed") {
    provideRightMenuContext({ ...baseProps, ...toRefs(static_.ctx) }, baseHooks, app);
  } else if (mode === "auto") {
    const complex = useReactiveProxy(static_.ctx as Reactive<IndexMenuContextConfig>);

    watchEffect(() => {
      const _dynCtx = dynamic.value;
      const _stcCtx = static_.ctx;

      if (!_dynCtx) return;
      const order = _dynCtx?.order || _stcCtx.order;
      const record =
        order === "static-first"
          ? { ..._stcCtx.record, ..._dynCtx?.record }
          : { ..._dynCtx?.record, ..._stcCtx.record };

      complex.set({ ..._dynCtx, record: record });
    });

    const { close: closeMenu } = renderRightMenuTree(
      app,
      {
        trigger,
        ctx: complex.state as IndexMenuContextConfig,
      },
      {
        onClose: baseHooks.onClose,
        onDestroy: menuNav.clear,
      }
    );

    provideRightMenuContext({ ...baseProps, ...toRefs(static_.ctx) }, { onClose: closeMenu }, app);
  } else {
    throw new Error("useDynamicModeSetup only accept 'mixed' | 'auto' mode");
  }
  app.provide(indexRightMenuGlobalKey, { mode, ...static_, dynamic, ...menuNav });
}

/* =============== plugin =============== */
function createIndexRightMenu<Records extends MenuItemRecord = never>(
  config?: UserIndexRightMenuConfig<Records>
) {
  const resolved = resolveIndexMenuConfig(config);

  return {
    install(app: App) {
      const base = useBaseSetup(app);
      const setupFn = resolved.mode === "mixed" ? useManualModeSetup : useDynamicModeSetup;
      setupFn(app, resolved, base);
    },
  };
}

function installIndexRightMenu<Records extends MenuItemRecord = never>(
  ctx: EnhanceAppContext,
  config?: UserIndexRightMenuConfig<Records>
) {
  const menu = createIndexRightMenu(config);
  ctx.app.use(menu);
}

export { installIndexRightMenu };
