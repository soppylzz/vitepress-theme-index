import type { DeepPartial, DeepRequired } from "@vitepress-theme-index/shared";
import type { ComputedRef, Reactive } from "vue";
import type { IndexResponse } from "../global";

const indexPreset = ["default", "pixel-art"] as const;
const indexThemeMode = ["light", "auto", "dark"] as const;

type IndexPreset = (typeof indexPreset)[number];
type IndexThemeMode = (typeof indexThemeMode)[number];

interface IndexThemeData {
  preset: IndexPreset;
  mode: IndexThemeMode;
}

interface IndexThemeConfig extends IndexThemeData {
  breakPoint: [number, number];
  fontSize: number;
}

type UserIndexThemeConfig = DeepPartial<
  Omit<IndexThemeConfig, "breakPoint"> & {
    breakPoint: number | [number, number];
  }
>;

type ResolvedIndexThemeConfig = DeepRequired<IndexThemeConfig>;

interface IndexThemeContext extends ResolvedIndexThemeConfig {
  ctx: Reactive<ResolvedIndexThemeConfig>;
  response: ComputedRef<IndexResponse>;
  available: {
    preset: typeof indexPreset;
    mode: typeof indexThemeMode;
  };
  setPreset: (preset: IndexPreset) => void;
  setMode: (mode: IndexThemeMode) => void;
}

export { indexPreset, indexThemeMode };
export type {
  IndexPreset,
  IndexThemeMode,
  IndexThemeData,
  IndexThemeConfig,
  UserIndexThemeConfig,
  ResolvedIndexThemeConfig,
  IndexThemeContext,
};
