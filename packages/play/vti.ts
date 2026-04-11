import { withAdditionIndex } from "vitepress-theme-index";
import brand from "./.vitepress/assets/brand.svg";

export default withAdditionIndex({
  site: {
    brand,
    siteName: "禁书目录",
    build: "2025",
    owner: {
      text: "soppylzz",
      href: "https://github.com/soppylzz",
    },
    license: {
      text: "MIT",
      href: "https://github.com/soppylzz",
    },
    beian: {
      text: "渝ICP备2025063057号-1",
    },
  },
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
        { type: "divider" },
        { type: "group", text: "菜单组11111111111", children: [{ type: "button", text: "按钮" }] },
        {
          type: "group",
          text: "菜单组",
          children: [{ type: "button", text: "菜单组" }],
          collapsable: true,
        },
      ],
    },
    { type: "button", icon: "github", target: "screen" },
    { type: "divider", show: ["pad", "desktop"] },
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
      { type: "button", text: "1", href: "api/1" },
      { type: "button", text: "2", href: "api/2" },
      { type: "button", text: "3", href: "api/3" },
    ],
    "/guide": [
      { type: "group", text: "侧边栏", children: [{ type: "button", text: "侧边栏" }] },
      { type: "button", text: "参考" },
      {
        type: "group",
        text: "侧边栏",
        children: [{ type: "button", text: "侧边栏" }],
        collapsable: true,
      },
    ],
  },
});
