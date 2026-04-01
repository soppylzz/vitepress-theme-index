import { withAdditionIndex } from "vitepress-theme-index";
import brand from "./.vitepress/assets/brand.svg";

export default withAdditionIndex({
  site: { brand, siteName: "禁书目录" },
  nav: [
    { type: "space" },
    { type: "button", icon: "github", text: "参考", target: "both", href: "/api/1" },
    { type: "button", text: "指南", target: "both", href: "/guide/1" },
    {
      type: "menu",
      text: "方舟",
      target: "both",
      icon: "github",
      children: [
        { type: "button", text: "按钮" },
        { type: "group", text: "菜单组", children: [{ type: "button", text: "按钮" }] },
        {
          type: "group",
          text: "菜单组",
          children: [{ type: "button", text: "菜单组" }],
          collapsed: false,
        },
      ],
    },
    { type: "button", icon: "github", target: "screen" },
    { type: "divider", show: ["pad", "computer"] },
    {
      type: "button",
      icon: "github",
      href: "https://github.com",
      _target: "_blank",
      content: "Github",
    },
  ],
  sidebar: {
    "/api": [
      { type: "button", text: "参考" },
      { type: "group", text: "侧边栏", children: [{ type: "button", text: "侧边栏" }] },
    ],
    "/guide": [{ type: "button", text: "指南" }],
  },
});
