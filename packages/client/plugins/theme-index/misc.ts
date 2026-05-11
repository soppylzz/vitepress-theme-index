import type { EnhanceAppContext } from "vitepress";
import type { IndexClientConfig } from "../../types";
import { indexArchiveKey, indexGlobalKey, indexOverallKey } from "../../types";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { merge, pick } from "lodash-unified";
import { defaultGlobalConfig } from "./default";
import archive from "virtual:index-archive";
import overall from "virtual:index-overall";
import iconPlugin from "virtual:index-icons/all";

function installMisc(ctx: EnhanceAppContext, config: IndexClientConfig) {
  gsap.registerPlugin(MorphSVGPlugin);

  ctx.app.provide(
    indexGlobalKey,
    merge(defaultGlobalConfig, pick(config, Object.keys(defaultGlobalConfig)))
  );

  ctx.app.provide(indexArchiveKey, archive);
  ctx.app.provide(indexOverallKey, overall);
  ctx.app.use(iconPlugin);
}

export { installMisc };
