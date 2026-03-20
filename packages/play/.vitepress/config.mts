import { defineConfig } from "vitepress";
import { vitepressThemeIndex } from "vitepress-theme-index";

export default defineConfig({
  title: "My Awesome Project",
  vite: {
    plugins: [vitepressThemeIndex()],
  },
  locales: {
    root: { label: "简体中文", lang: "zh" },
    en: { label: "English", lang: "en" },
  },
});
