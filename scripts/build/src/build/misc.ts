import { indexRoot } from "../const";
import { rollup, type Plugin, type InputOptions, type OutputOptions } from "rollup";
import { getDependencies } from "../utils";
import { resolve } from "node:path";
import { ensureArray, buildLogger } from "@vitepress-theme-index/shared";

function generateExternals(extend: string[] = []) {
  // based on the implementation of element-plus
  const { dependencies, peerDependencies } = getDependencies(resolve(indexRoot, "package.json"));

  return (id: string) => {
    // this project is a tool lib, won't run with 'umd', deps must be externals
    const externals = [...new Set([...peerDependencies, ...dependencies, ...extend])];
    return externals.some(
      (external_pkg) =>
        external_pkg === id ||
        id.startsWith(`${external_pkg}/`) ||
        id.startsWith(`${external_pkg}:`)
    );
  };
}

interface BuildOptions {
  /* for log */
  name?: string;
  /* for input & write */
  input?: Omit<InputOptions, "plugins">;
  output?: OutputOptions | OutputOptions[];
  /* for plugin */
  plugins?: Plugin[];
}

function excludeFiles(files: string[], patterns: string[] = []) {
  const finalPatterns = ["node_modules", "dist", ...patterns];
  return files.filter((path) => !finalPatterns.some((pattern) => path.includes(pattern)));
}

async function buildPackage(config: BuildOptions) {
  buildLogger.info(`📦 Building: [${config?.name}]`);
  const bundle = await rollup({
    ...config?.input,
    plugins: config.plugins ?? [],
  });

  const outputs = ensureArray(config.output!);
  await Promise.all(
    outputs.map((opt) => {
      bundle.write(opt);
      buildLogger.success(`🌟 Built: ${config?.name}/${opt.format} `);
    })
  );
}

export type { BuildOptions };
export { generateExternals, excludeFiles, buildPackage };
