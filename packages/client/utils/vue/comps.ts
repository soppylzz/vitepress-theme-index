import type { App } from "vue";
import { defineComponent, getCurrentInstance, provide } from "vue";
import { runtimeLogger } from "@vitepress-theme-index/shared";

function createNumValidator(mode: "positive" | "negative" | "non-positive" | "non-negative") {
  const map = {
    positive: (v: number) => v > 0,
    negative: (v: number) => v < 0,
    "non-positive": (v: number) => v <= 0,
    "non-negative": (v: number) => v >= 0,
  };
  return map[mode];
}

function resolveProvideFn(app?: App) {
  const inSetup = !!getCurrentInstance();
  const provideFn = app?.provide ?? (inSetup ? provide : undefined);
  if (!provideFn) {
    runtimeLogger.error("unable to resolve provideFn");
  }
  return provideFn;
}

const NullComponent = defineComponent({
  render() {
    return null;
  },
});

export { createNumValidator, resolveProvideFn, NullComponent };
