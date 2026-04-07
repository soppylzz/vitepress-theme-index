import { computed, defineComponent, vShow, withDirectives } from "vue";
import { flatArrayWithRoute, useBem, useIndex, useMaybeI18nDataWithRoute } from "../composables";
import { renderMenuItems, VtiDrawer, VtiMenu } from "./public";

const VtiSidebar = defineComponent({
  name: "VtiSidebar",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { sidebar } = useIndex();
    const { response } = useIndex().theme;

    const trigger = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      },
    });

    const raw = useMaybeI18nDataWithRoute(sidebar, {});
    const items = computed(() => flatArrayWithRoute(raw.value));

    const ns = useBem("sidebar");
    return () => {
      const isDrawer = response.value === "mobile";
      const contents = renderMenuItems(items.value, "sidebar");

      if (isDrawer) {
        return withDirectives(
          <VtiDrawer
            modelValue={trigger.value}
            onUpdate:modelValue={(v) => (trigger.value = v)}
            placement={"left"}
            size={"medium"}
            resizable
            touchable
          >
            {/* drawer header slots */}
            <VtiMenu size={"medium"} collapsed showActivate>
              {contents}
            </VtiMenu>
            {/* drawer footer slots  */}
          </VtiDrawer>,
          [[vShow, trigger.value]]
        );
      }
      return (
        <div class={[ns.b(), ns.m("fixed")]}>
          {/* fixed header slots */}
          <VtiMenu size={"large"} collapsed showActivate>
            {contents}
          </VtiMenu>
          {/* fixed header slots */}
        </div>
      );
    };
  },
});

export { VtiSidebar };
