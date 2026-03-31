import { withAdditionIndex } from "vitepress-theme-index";
import brand from "./.vitepress/assets/brand.png";

export default withAdditionIndex({
  nav: [
    { type: "brand", text: "VTIndex", brand: brand, href: "/" },
    { type: "space" },
    { type: "button", text: "参考", target: "both", href: "/api/1" },
    { type: "button", text: "指南", target: "both", href: "/guide/1" },
    {
      type: "menu",
      text: "菜单",
      children: [
        { type: "button", text: "按钮" },
        { type: "group", text: "菜单组", children: [{ type: "button", text: "按钮" }] },
      ],
    },
    { type: "divider" },
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
