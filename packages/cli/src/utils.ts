import fs from "fs-extra";
import { resolve } from "node:path";

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

export { copyFolderRecursive, detectPackageManager, getSupportLangs, getLangTargetPath };
