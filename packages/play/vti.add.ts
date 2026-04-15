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
    { type: "button", text: "归档", target: "both", href: "/archive" },
    { type: "button", text: "参考", target: "both", baseUrl: "/api", href: "/api/theme" },
    { type: "button", text: "指南", target: "both", baseUrl: "/guide", href: "/guide/md-example" },
    {
      type: "menu",
      text: "链接",
      target: "both",
      children: [
        {
          type: "group",
          text: "Github",
          children: [
            {
              type: "button",
              text: "Github 问题",
              href: "https://github.com/soppylzz/vitepress-theme-index/issues",
            },
            {
              type: "button",
              text: "主题发布",
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
    "/api": [
      {
        type: "group",
        text: "API参考",
        collapsable: false,
        children: [
          { type: "button", text: "主题API", href: "/api/theme" },
          { type: "button", text: "插件API", href: "/api/plugin" },
        ],
      },
    ],
    "/guide": [{ type: "button", text: "markdown示例", href: "/guide/md-example" }],
  },
});
