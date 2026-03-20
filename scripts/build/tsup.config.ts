import { defineConfig } from "tsup";

export default defineConfig({
  dts: false,
  clean: true,
  format: ["cjs"],
  external: ["rollup"],
  entry: ["src/run.ts"],
});
