import { withAdditionIndex } from "vitepress-theme-index";

export default withAdditionIndex({
  nav: [
    { type: "brand", text: "VThemeIndex11" },
    { type: "space" },
    { type: "button", text: "TextButton" },
    { type: "button", icon: "github", href: "https://github.com", _target: "_blank" },
    { type: "divider" },
    {
      type: "menu",
      text: "Menu",
      children: [
        { type: "button", text: "Button" },
        { type: "group", text: "Group", children: [{ type: "button", text: "Button" }] },
      ],
    },
  ],
  sidebar: {
    "/side1": [
      { type: "button", text: "Sidebar111" },
      { type: "group", text: "Sidebar1", children: [{ type: "button", text: "Sidebar1" }] },
    ],
    "/side2": [
      { type: "button", text: "Sidebar2" },
      { type: "group", text: "Sidebar2", children: [{ type: "button", text: "Sidebar2" }] },
    ],
  },
});
