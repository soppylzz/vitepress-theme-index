import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

function installGsap() {
  gsap.registerPlugin(MorphSVGPlugin);
}

export { installGsap };
