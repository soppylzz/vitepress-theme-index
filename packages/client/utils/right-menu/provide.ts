import type { App } from "vue";
import { computed, getCurrentInstance, inject, provide, toValue } from "vue";
import { indexRightMenuProvideKey } from "../../types";
import type {
  ToMaybeRefOrGetterState,
  IndexMenuProvide,
  IndexMenuProvideContext,
  IndexMenuProvideHooks,
} from "../../types";

const rootProvide: Partial<IndexMenuProvideContext> = {
  close() {},
};

function useRightMenuProvide() {
  const inSetup = !!getCurrentInstance();
  return inSetup ? inject(indexRightMenuProvideKey) : rootProvide;
}

function provideRightMenuContext(
  provides?: Partial<ToMaybeRefOrGetterState<IndexMenuProvide>>,
  hooks?: IndexMenuProvideHooks,
  app?: App
) {
  const inSetup = !!getCurrentInstance();
  const provideFn = app?.provide ?? (inSetup ? provide : undefined);
  if (!provideFn) {
    throw new Error("provideRightMenuContext need app or to be in setup");
  }

  const parent = useRightMenuProvide();
  const ctx = computed<IndexMenuProvide>(() => {
    const base = parent?.ctx?.value ?? {};
    const provided = Object.fromEntries(
      Object.entries(provides || {})
        .map(([k, v]) => [k, toValue(v)])
        .filter(([, v]) => v !== undefined)
    );
    return { ...base, ...provided };
  });

  if (inSetup) {
    provideFn(indexRightMenuProvideKey, {
      close() {
        hooks?.onClose?.();
        parent?.close?.();
      },
      ctx,
    });
  } else {
    Object.assign(rootProvide, {
      close() {
        hooks?.onClose?.();
      },
      ctx,
    });
    provideFn(indexRightMenuProvideKey, rootProvide);
  }
}

export { useRightMenuProvide, provideRightMenuContext };
