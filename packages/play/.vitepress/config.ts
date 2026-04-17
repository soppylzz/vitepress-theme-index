import { defineConfig } from "vitepress";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { vitepressThemeIndex, withIndexMarkdown } from "vitepress-theme-index";

export default defineConfig({
  title: "hello vitepress",
  cleanUrls: true,
  markdown: withIndexMarkdown(),
  vite: { plugins: [vitepressThemeIndex(), VueI18nPlugin({ ssr: true })] },
  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
    },
    en: {
      label: "English",
      lang: "en-US",
    },
  },
});
