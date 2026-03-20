import type { PropType } from "vue";
import { defineComponent, renderSlot } from "vue";
import type { ProvideMenuConfig } from "../../types";
import { provideRightMenuContext } from "../../utils";

const RightMenuProvider = defineComponent({
  name: "VtiRightMenuProvider",
  props: {
    config: {
      type: Object as PropType<ProvideMenuConfig>,
      default: { size: "medium", state: "enabled" } as ProvideMenuConfig,
    },
  },
  emits: { close: () => {} },
  setup(props, { slots, emit }) {
    provideRightMenuContext(props?.config ?? {}, {
      onClose() {
        emit("close");
      },
    });
    return () => renderSlot(slots, "default");
  },
});

export { RightMenuProvider };
