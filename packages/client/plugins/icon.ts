import {
  VtiIAngleLeft,
  VtiIAngleRight,
  VtiIArrowRotateLeft,
  VtiIArrowUp,
  VtiIGithub,
  VtiIMoon,
  VtiISun,
} from "../components";
import type { EnhanceAppContext } from "vitepress";

const vtiIcons = {
  VtiIAngleLeft,
  VtiIAngleRight,
  VtiIArrowRotateLeft,
  VtiIArrowUp,
  VtiIGithub,
  VtiIMoon,
  VtiISun,
};

function installIndexIcons(ctx: EnhanceAppContext) {
  Object.entries(vtiIcons).forEach(([name, component]) => {
    ctx.app.component(name, component);
  });
}
export { installIndexIcons };
