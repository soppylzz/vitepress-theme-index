import { withAdditionIndex } from "vitepress-theme-index";
import brand from "./.vitepress/assets/brand.png";

export default withAdditionIndex({
  nav: [
    { type: "brand", text: "VTIndex", brand: brand, href: "/" },
    { type: "space" },
    { type: "button", text: "side1", target: "both", href: "/side1/article" },
    { type: "button", icon: "github", href: "https://github.com", _target: "_blank" },
    { type: "divider" },
    {
      type: "menu",
      text: "菜单",
      children: [
        { type: "button", text: "按钮" },
        { type: "group", text: "菜单组", children: [{ type: "button", text: "按钮" }] },
      ],
    },
  ],
  sidebar: {
    "/side1": [
      { type: "button", text: "侧边栏1" },
      { type: "group", text: "侧边栏", children: [{ type: "button", text: "侧边栏" }] },
    ],
    "/side2": [
      { type: "button", text: "侧边栏2" },
      { type: "group", text: "侧边栏", children: [{ type: "button", text: "侧边栏" }] },
    ],
  },
});
