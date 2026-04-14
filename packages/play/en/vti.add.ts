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
    { type: "button", text: "Archive", target: "both", href: "/en/archive" },
    {
      type: "button",
      text: "Reference",
      target: "both",
      baseUrl: "/en/api",
      href: "/en/api/theme",
    },
    {
      type: "button",
      text: "Guide",
      target: "both",
      baseUrl: "/en/guide",
      href: "/en/guide/md-example",
    },
    {
      type: "menu",
      text: "Quick Links",
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
    { type: "divider" },
    {
      type: "button",
      icon: "github",
      href: "https://github.com/soppylzz/vitepress-theme-index",
      content: "vitepress-theme-index",
    },
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
