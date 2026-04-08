import { defineConfig } from "vitepress";
import { vitepressThemeIndex, withIndexMarkdown } from "vitepress-theme-index";

export default defineConfig({
  title: "My Awesome Project",
  cleanUrls: true,
  markdown: withIndexMarkdown(),
  vite: { plugins: [vitepressThemeIndex()] },
  locales: {
    root: { label: "简体中文", lang: "zh" },
    en: { label: "English", lang: "en" },
  },
});
