import { withAdditionIndex } from "vitepress-theme-index";

export default withAdditionIndex({
  site: {
    siteName: "hello vitepress",
    owner: {
      text: "soppylzz",
      href: "https://github.com/soppylzz",
    },
    license: {
      text: "CC BY-NC-SA 4.0",
      href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    },
  },
  nav: [
    { type: "space" },
    { type: "search" },
    { type: "button", text: "ARCH", target: "both", href: "/en/archive" },
    { type: "button", text: "API", target: "both", baseUrl: "/en/api", href: "/en/api/theme" },
    {
      type: "button",
      text: "GUIDE",
      target: "both",
      baseUrl: "/en/guide",
      href: "/en/guide/md-example",
    },
    {
      type: "menu",
      text: "LINKS",
      target: "both",
      children: [
        {
          type: "group",
          text: "GitHub",
          children: [
            {
              type: "button",
              text: "GitHub Issues",
              href: "https://github.com/soppylzz/vitepress-theme-index/issues",
            },
            {
              type: "button",
              text: "Theme Releases",
              href: "https://github.com/soppylzz/vitepress-theme-index/releases",
            },
          ],
        },
      ],
    },
    { type: "divider", show: ["desktop", "pad"] },
    {
      type: "button",
      icon: "github",
      show: ["desktop", "pad"],
      href: "https://github.com/soppylzz/vitepress-theme-index",
      content: "vitepress-theme-index",
    },
    { type: "divider", show: ["pad", "desktop"] },
    { type: "locale" },
  ],
  sidebar: {
    "/en/api": [
      {
        type: "group",
        text: "API Reference",
        collapsable: false,
        children: [
          { type: "button", text: "Theme API", href: "/en/api/theme" },
          { type: "button", text: "Plugin API", href: "/en/api/plugin" },
        ],
      },
    ],
    "/en/guide": [{ type: "button", text: "Markdown Example", href: "/en/guide/md-example" }],
  },
});
