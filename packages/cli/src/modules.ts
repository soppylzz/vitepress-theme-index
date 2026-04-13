import type { CliModule } from "./type";
import { resolve } from "node:path";
import fs from "fs-extra";
import ejs from "ejs";
import { copyFolderRecursive, getLangTargetPath, getSupportLangs } from "./utils";
import { PATHS, getEjsData, getVtiData } from "./const";
import { INDEX_ADDITION_NAME, INDEX_CONFIG_NAME } from "@vitepress-theme-index/shared";

function createPackage(): CliModule {
  return {
    name: "packageJson",
    async validate(ctx) {
      const pkgPath = resolve(process.cwd(), "package.json");
      const pkgExists = fs.existsSync(pkgPath);

      ctx.metadata.pkgFound = pkgExists;
      ctx.pkgData = pkgExists ? fs.readJsonSync(pkgPath) : { name: ctx.options.siteName };

      if (!ctx.pkgData.scripts) ctx.pkgData.scripts = {};
      return true;
    },
    async create(ctx) {
      const { options, pkgData } = ctx;
      const prefix = options.prefix as string;
      const { folder } = options;

      pkgData!.scripts![`${prefix}:dev`] = `vitepress dev ${folder}`;
      pkgData!.scripts![`${prefix}:build`] = `vitepress build ${folder}`;
      pkgData!.scripts![`${prefix}:preview`] = `vitepress preview ${folder}`;

      const depsToAdd: Record<string, string> = {};

      if (!options.dev) {
        const themePkg = fs.readJsonSync(PATHS.themePackageJson);
        if (themePkg.peerDependencies?.vitepress) {
          depsToAdd["vitepress"] = themePkg.peerDependencies.vitepress;
        }
        depsToAdd["vitepress-theme-index"] = themePkg.version || "latest";
      } else {
        const pkgPath = resolve(process.cwd(), "package.json");
        if (fs.existsSync(pkgPath)) {
          const cwdPkg = fs.readJsonSync(pkgPath);
          if (cwdPkg.dependencies?.vitepress)
            depsToAdd["vitepress"] = cwdPkg.dependencies.vitepress;
          if (cwdPkg.dependencies?.["vitepress-theme-index"]) {
            depsToAdd["vitepress-theme-index"] = cwdPkg.dependencies["vitepress-theme-index"];
          }
        }
      }

      ctx.depsToAdd = depsToAdd;
      if (!options.dev) {
        pkgData!.dependencies ??= {};
        Object.assign(pkgData!.dependencies, depsToAdd);
        fs.writeJsonSync(resolve(process.cwd(), "package.json"), pkgData, { spaces: 2 });
      }
    },
    postCreate(ctx) {
      if (ctx.options.dev && ctx.depsToAdd) {
        ctx.metadata.depsToAdd = ctx.depsToAdd;
      }
    },
  };
}

function createMarkdown(): CliModule {
  return {
    name: "markdowns",
    async create(ctx) {
      const { folder, mode, i18n } = ctx.options;
      const langs = getSupportLangs(i18n);
      const targetPath = resolve(process.cwd(), folder);
      const templatePath = PATHS.getDocTemplate(mode);

      for (const lang of langs) {
        const langTemplatePath = resolve(templatePath, lang);
        const langTargetPath = getLangTargetPath(targetPath, lang);
        copyFolderRecursive(langTemplatePath, langTargetPath);
      }
    },
  };
}

function createScripts(): CliModule {
  return {
    name: "scripts",
    async create(ctx) {
      const { folder, i18n, useTs, siteName } = ctx.options;
      const targetPath = resolve(process.cwd(), folder);
      const vitepressPath = resolve(targetPath, ".vitepress");
      const templatePath = PATHS.script;

      const baseEjsData = getEjsData({ siteName, i18n });
      const configContent = await ejs.renderFile(resolve(templatePath, "config.ejs"), baseEjsData);
      const themeContent = await ejs.renderFile(resolve(templatePath, "theme.ejs"), baseEjsData);

      if (!fs.existsSync(vitepressPath)) {
        fs.mkdirSync(vitepressPath, { recursive: true });
      }
      fs.writeFileSync(
        resolve(vitepressPath, `${INDEX_CONFIG_NAME}.${useTs ? "ts" : "js"}`),
        configContent
      );
      fs.writeFileSync(resolve(vitepressPath, useTs ? "theme.ts" : "theme.js"), themeContent);

      const langs = getSupportLangs(i18n);
      const additionFile = `${INDEX_ADDITION_NAME}.${useTs ? "ts" : "js"}`;
      const additionJsonFile = `${INDEX_ADDITION_NAME}.json`;

      for (const lang of langs) {
        const langPath = getLangTargetPath(targetPath, lang);

        const addConfig = await ejs.renderFile(
          resolve(templatePath, "vti.ejs"),
          getEjsData({ siteName, i18n, lang: lang })
        );
        const addJson = JSON.stringify(getVtiData({ lang }), null, 2);

        fs.writeFileSync(resolve(langPath, additionFile), addConfig);
        fs.writeFileSync(resolve(langPath, additionJsonFile), addJson);
      }
    },
  };
}

export { createMarkdown, createScripts, createPackage };
