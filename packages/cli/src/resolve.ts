import { resolve, relative } from "node:path";
import spawn from "cross-spawn";
import chalk from "chalk";
import { outro } from "@clack/prompts";
import { cliLogger } from "@vitepress-theme-index/shared";
import type { CliModule, HookContext, IndexCliOptions } from "./type";
import { detectPackageManager } from "./utils";
import { createMarkdown, createPackage, createScripts } from "./modules";
import { isArray } from "lodash-unified";

// function printSummary(options: IndexCliOptions, metadata: any) {
//   console.log("\n" + chalk.cyan("📋 Configuration Summary"));
//   console.log(chalk.gray("─".repeat(50)));
//   console.log((metadata.pkgFound ? chalk.green("✓") : chalk.blue("ℹ")) + (metadata.pkgFound ? " Found package.json" : " Will create package.json"));
//   console.log(chalk.green("✓") + ` Created markdown files in: ${chalk.bold(options.folder)}`);
//   console.log(chalk.green("✓") + ` Generated config files (${metadata.useTs ? "TypeScript" : "JavaScript"})`);
// }
//
// function printDependencies(options: IndexCliOptions, depsToAdd?: Record<string, string>) {
//   if (options.dev && depsToAdd) {
//     console.log("\n" + chalk.cyan("📦 Dependencies to be added:"));
//     Object.entries(depsToAdd).forEach(([pkg, version]) => {
//       console.log(`  ${chalk.yellow(pkg)}@${chalk.gray(version)}`);
//     });
//   }
// }
//
// async function installDependencies(options: IndexCliOptions) {
//   console.log("\n" + chalk.cyan("📦 Installing dependencies..."));
//   const targetPath = resolve(process.cwd(), options.folder);
//   const pm = detectPackageManager();
//   console.log(chalk.blue(`🚀 Running: ${chalk.bold(pm + " install")} in ${chalk.gray(relative(process.cwd(), targetPath))}\n`));
//
//   const result = spawn.sync(pm, ["install"], { cwd: targetPath, stdio: "inherit" });
//   if (result.error) {
//     console.log(chalk.red("✗") + ` Failed to install dependencies: ${result.error.message}`);
//   } else if (result.status !== 0) {
//     console.log(chalk.red("✗") + ` Package manager exited with code ${result.status}`);
//   } else {
//     console.log(chalk.green("✓") + " Dependencies installed successfully");
//   }
// }
//
// function printDevInstructions(options: IndexCliOptions) {
//   console.log("\n" + chalk.cyan("📦 Dev mode: Skipping installation"));
//   console.log(chalk.gray("To install dependencies, run:"));
//   const pm = detectPackageManager();
//   console.log(chalk.yellow(`  cd ${options.folder} && ${pm} install`));
// }

async function scaffold(options: IndexCliOptions) {
  const ctx: HookContext = { options, metadata: {} };
  const manager: CliModule[] = [createPackage(), createMarkdown(), createScripts()];

  try {
    const validateErrors: typeof ctx.metadata.validateErrors = [];

    for (const module of manager) {
      if (module.validate) {
        const result = await module.validate(ctx);
        if (result) continue;

        const [code, msg] = isArray(result) ? result : ["UNKNOWN", "Validation failed"];
        validateErrors?.push({ name: module.name, code, msg });
      }
    }

    if (validateErrors && validateErrors.length > 0) {
      ctx.metadata.validationFailed = true;
      ctx.metadata.validateErrors = validateErrors;
      outro("❌ validation failed, exiting...");

      // log metadata

      cliLogger.warn("scaffolding failed");
      return;
    }

    for (const mod of manager) {
      if (mod?.create) await mod.create(ctx);
    }
    for (const mod of manager) {
      if (mod?.postCreate) await mod.postCreate(ctx);
    }
    outro("✨ creating your project...");

    // log metadata

    // printSummary(options, ctx.metadata);
    // printDependencies(options, ctx.depsToAdd);
    // options.dev
    //   ? printDevInstructions(options)
    //   : await installDependencies(options);

    cliLogger.success("scaffolding completed!");
  } catch (err) {
    cliLogger.error(err);
    throw err;
  }
}

export { scaffold };
