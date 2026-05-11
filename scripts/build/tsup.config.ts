import { defineConfig } from "tsup";

export default defineConfig({
  dts: false,
  clean: true,
  format: ["esm"],
  entry: ["src/run.ts"],
  external: [/^(?!@vitepress-theme-index\/shared$)[^./]/],
});
