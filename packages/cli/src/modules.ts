import type { CliModule } from "./type";
import { relative, resolve } from "node:path";
import fs from "fs-extra";
import ejs from "ejs";
import { copyFolderRecursive, getLangTargetPath, getSupportLangs } from "./utils";
import { PATHS, getEjsData, getVtiData } from "./const";
import { INDEX_ADDITION_NAME, INDEX_CONFIG_NAME } from "@vitepress-theme-index/shared";

function createPackage(): CliModule {
  const TARGET_PKG = resolve(process.cwd(), "package.json");
  let refPkg: any = null;

  return {
    name: "packageJson",
    validate(ctx) {
      // check reference
      refPkg = !ctx.options.dev
        ? fs.readJsonSync(PATHS.themePackageJson)
        : fs.readJsonSync(TARGET_PKG)
      if (!refPkg?.peerDependencies?.vitepress) return ["DEP_NOT_FOUND", "unable to find deps in package.json"]

      // check target
      const pkgExists = fs.existsSync(TARGET_PKG);
      ctx.metadata.pkgFound = pkgExists;
      ctx.pkgData = pkgExists ? fs.readJsonSync(TARGET_PKG) : { name: ctx.options.siteName, scripts: {} };
      ctx.pkgData.scripts ??= {};

      return true;
    },
    create(ctx) {
      const { options, pkgData } = ctx;
      const { folder = ".", prefix: prefixRaw, dev } = options;
      const prefix = prefixRaw ? `${prefixRaw}:`: "";

      pkgData!.scripts[`${prefix}dev`] = `vitepress dev ${folder}`;
      pkgData!.scripts[`${prefix}build`] = `vitepress build ${folder}`;
      pkgData!.scripts[`${prefix}preview`] = `vitepress preview ${folder}`;

      const depsToAdd: Record<string, string> = {};

      depsToAdd["vitepress"] = refPkg.peerDependencies.vitepress
      depsToAdd["vitepress-theme-index"] = refPkg.version || "latest";
      ctx.depsToAdd = depsToAdd;

      if (!options.dev) {
        pkgData!.dependencies ??= {};
        Object.assign(pkgData!.dependencies, depsToAdd);
        fs.writeJsonSync(TARGET_PKG, pkgData, { spaces: 2 });
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
  let targetPath: string | null = null;

  return {
    name: "markdowns",
    validate(ctx) {
      targetPath = resolve(process.cwd(), ctx.options.folder || ".")
      const indexMd = resolve(targetPath, "index.md");
      if (fs.existsSync(indexMd)) {
        return [
          "MARKDOWN_EXISTS",
          `index.md already exists in ${relative(process.cwd(), indexMd)}`,
        ]
      }
      return true
    },
    create(ctx) {
      const { mode, i18n } = ctx.options;
      const langs = getSupportLangs(i18n);
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
  let targetPath: string | null = null;

  return {
    name: "scripts",
    validate(ctx) {
      targetPath = resolve(process.cwd(), ctx.options.folder || ".");
      const vitepressDir = resolve(targetPath, ".vitepress");
      if (fs.existsSync(vitepressDir)) {
        return [
          "SCRIPTS_EXISTS",
          `.vitepress already exists in ${relative(process.cwd(), vitepressDir)}`
        ];
      }
      return true;
    },
    async create(ctx) {
      const {i18n, useTs, siteName } = ctx.options;
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
