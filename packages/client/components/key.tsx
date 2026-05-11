import type { Component, PropType } from "vue";
import { computed, createVNode, defineComponent } from "vue";
import type { IndexSize } from "../types";
import { useBem } from "../composables";
import { isString } from "lodash-unified";

const VtiKey = defineComponent({
  name: "VtiKey",
  props: {
    val: {
      type: String,
      required: true,
    },
    splitter: {
      type: String,
      default: "+",
    },
    connector: {
      type: [String, Object] as PropType<string | Component>,
      default: "+",
    },
    size: {
      type: String as PropType<IndexSize>,
      default: "medium",
    },
  },
  setup(props) {
    const keys = computed(() =>
      props.val
        .split(props.splitter)
        .map((s) => s.trim())
        .filter(Boolean)
    );

    function renderConnect() {
      if (isString(props.connector)) return props.connector;
      return createVNode(props.connector);
    }

    const ns = useBem("key");
    return () => {
      const length = keys.value.length;
      const kls = {
        wrap: [ns.b(), ns.m(props.size)],
        connector: [ns.e("connector")],
      };

      if (length === 0) return null;
      return (
        <span class={kls.wrap}>
          {keys.value.map((key, index) => (
            <>
              <kbd>{key}</kbd>
              {index !== length - 1 && <span class={kls.connector}>{renderConnect()}</span>}
            </>
          ))}
        </span>
      );
    };
  },
});

export { VtiKey };
