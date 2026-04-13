import fs from "fs-extra";
import { resolve } from "node:path";
import chalk from "chalk";
import { consola } from "consola";
import spawn from "cross-spawn";
import type { IndexCliOptions, HookContext } from "./type";
import { cliLogger } from "@vitepress-theme-index/shared";

function copyFolderRecursive(src: string, dest: string) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach((file) => {
    const srcPath = resolve(src, file);
    const destPath = resolve(dest, file);

    return fs.statSync(srcPath).isDirectory()
      ? copyFolderRecursive(srcPath, destPath)
      : fs.copyFileSync(srcPath, destPath);
  });
}

function detectPackageManager(): string {
  const agent = process.env.npm_config_user_agent;
  if (agent?.includes("pnpm")) return "pnpm";
  if (agent?.includes("yarn")) return "yarn";
  if (agent?.includes("npm")) return "npm";
  return "pnpm";
}

const getSupportLangs = (i18n: boolean): Array<"zh" | "en"> => {
  return i18n ? ["zh", "en"] : ["zh"];
};

const getLangTargetPath = (rootPath: string, lang: "zh" | "en"): string => {
  return lang === "zh" ? rootPath : resolve(rootPath, lang);
};

async function installDependencies(options: IndexCliOptions): Promise<void> {
  const pm = detectPackageManager();
  const colorI = chalk.bold.cyan(`${pm} install`);
  const colorPkg = chalk.gray(resolve(process.cwd(), "package.json"))

  if (options.dev) {
    consola.log(`${chalk.green("Installing dependencies... ")}${chalk.gray("[simulated]")}`);
    consola.log(`Would run: ${colorI} in ${colorPkg}\n`);

    consola.log(`⚠️ ${chalk.bold.red("Dev mode detected")}: skipping actual installation\n`);

    consola.log(chalk.gray("To install dependencies manually, run:"));
    consola.log(chalk.yellow(`    ${pm} install`));
  } else {
    consola.log(`${chalk.green("Installing dependencies...")}`);
    consola.log(`Running: ${colorI} in ${colorPkg}\n`);

    const result = spawn.sync(
      pm,
      ["install"],
      {
        cwd: process.cwd(),
        stdio: "inherit"
      });

    if (result.error || result.status !== 0) {
      cliLogger.error(result.error ?? `Package manager exited with code ${result.status}`);
    }
    consola.log(chalk.green("Dependencies installed successfully!"))
  }
}

async function outputMetadata(ctx: HookContext): Promise<void> {
  const { options, metadata, depsToAdd } = ctx;

  if (metadata.validationFailed && metadata.validateErrors) {
    const msg = metadata.validateErrors.map((error) =>
      `\t${chalk.bold(`[${error.name}]`)} ${error.msg} ${chalk.gray(error.code)}`
    ).join("\n");
    cliLogger.error(`${chalk.red.bold("Validate failed:")}\n${msg}`);
  }

  consola.log(chalk.cyan("📋 Configuration summary:"));
  consola.log(chalk.gray('─'.repeat(50)));

  if (metadata.pkgFound) {
    consola.log(`Found existing package.json`)
  } else {
    consola.log(`Create new package.json`)
  }

  consola.log(`Created theme files in: ${chalk.bold(options.folder)}`);
  consola.log(`Generated config files ${
    options.useTs 
      ? chalk.bgBlueBright("TypeScript") 
      : chalk.bgYellowBright("JavaScript"
      )}\n`);

  if (depsToAdd && Object.keys(depsToAdd).length > 0) {
    consola.log(`${chalk.cyan("📦 Dependencies to be added:")}`);
    Object.entries(depsToAdd).forEach(([pkg, version]) => {
      consola.log(`    ${chalk.yellow(pkg)}@${chalk.gray(version)}`);
    });
    consola.log("");
  }
}

export { copyFolderRecursive, detectPackageManager, getSupportLangs, getLangTargetPath, outputMetadata, installDependencies };
