import { defineComponent } from "vue";
import { useGlobal } from "../../composables";
import { renderLogger } from "@vitepress-theme-index/shared";
import { VtiGiscus } from "./giscus";

const VtiComment = defineComponent({
  name: "VtiComment",
  setup() {
    const { type, ...config } = useGlobal().comment;
    switch (type) {
      case "giscus": {
        return () => <VtiGiscus ctx={config} />;
      }
      default: {
        renderLogger.error(`unknown comment type: ${type}`);
        return () => null;
      }
    }
  },
});

export { VtiComment };
