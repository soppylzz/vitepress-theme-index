import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { AdditionDataOptions, EjsDataOptions } from "./type";

const __dirname = dirname(fileURLToPath(import.meta.url));

const I18N_CONFIG = {
  en: {
    archive: "Archive",
    reference: {
      header: "Reference",
      side: "API Reference",
      theme: "Theme API",
      plugin: "Plugin API",
    },
    guide: {
      header: "Guide",
      markdown: "Markdown Example",
    },
    quick: {
      header: "Quick Links",
      github: "GitHub",
      issue: "GitHub Issues",
      releases: "Theme Releases",
    },
  },
  zh: {
    archive: "归档",
    reference: {
      header: "参考",
      side: "API参考",
      theme: "主题API",
      plugin: "插件API",
    },
    guide: {
      header: "指南",
      markdown: "markdown示例",
    },
    quick: {
      header: "快速跳转",
      github: "Github",
      issue: "Github 问题",
      releases: "主题发布",
    },
  },
} as const;
const I18N_ADDITION = {
  en: {},
  zh: {},
} as const;

const PATHS = {
  get template() {
    return resolve(__dirname, "template");
  },
  get script() {
    return resolve(this.template, "scripts");
  },
  getDocTemplate(mode: "docs" | "blog") {
    return resolve(this.template, mode);
  },
  get themePackageJson() {
    return resolve(__dirname, "../package.json");
  },
} as const;

function getEjsData(options: EjsDataOptions) {
  const { siteName, i18n, lang = "en" } = options;
  const translations = I18N_CONFIG[lang];

  return {
    siteName,
    i18n: i18n
      ? {
          root: { label: "English", lang: "en" },
          zh: { label: "简体中文", lang: "zh" },
        }
      : null,
    ...translations,
  };
}

function getVtiData(options: AdditionDataOptions) {
  const { lang = "en" } = options;
  return I18N_ADDITION[lang];
}

export { I18N_CONFIG, PATHS, getEjsData, getVtiData };
