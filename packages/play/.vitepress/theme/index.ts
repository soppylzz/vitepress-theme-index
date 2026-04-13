import { withIndex, Index } from "vitepress-theme-index";
import "vitepress-theme-index/theme/index.css";

export default withIndex({
  Layout: Index,
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
