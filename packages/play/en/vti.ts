import { withAdditionIndex } from "vitepress-theme-index";
import brand from "../.vitepress/assets/brand.svg";

export default withAdditionIndex({
  site: { brand, siteName: "theme-idx" },
  nav: [
    { type: "space" },
    { type: "button", text: "Reference", target: "both", href: "/api/1" },
    { type: "button", text: "Guide", target: "both", href: "/guide/1" },
    {
      type: "menu",
      text: "Menu",
      children: [
        { type: "button", text: "Button" },
        { type: "group", text: "Group", children: [{ type: "button", text: "Button" }] },
      ],
    },
    { type: "divider" },
    { type: "button", icon: "github", href: "https://github.com", _target: "_blank" },
  ],
  sidebar: {
    "/api": [
      { type: "button", text: "API" },
      { type: "group", text: "Sidebar", children: [{ type: "button", text: "Sidebar" }] },
    ],
    "/guide": [{ type: "button", text: "GUIDE" }],
  },
});
