import { withIndex, IndexLayout } from "vitepress-theme-index";
import "vitepress-theme-index/theme/index.css";

export default withIndex({
  Layout: IndexLayout,
  async enhanceApp() {},
  setup() {},
  index: {
    theme: {
      fontSize: 16,
      breakPoint: [768, 1280],
      preset: "default",
      mode: "auto",
    },
  },
});
