import { defineConfig } from "vitepress";
import { vitepressThemeIndex, withIndexMarkdown } from "vitepress-theme-index";

export default defineConfig({
  title: "hello vitepress",
  cleanUrls: true,
  markdown: withIndexMarkdown(),
  vite: { plugins: [vitepressThemeIndex()] },
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
