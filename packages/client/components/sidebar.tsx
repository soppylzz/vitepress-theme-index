import { computed, defineComponent } from "vue";
import { flatArrayWithRoute, useBem, useSidebar, useTheme } from "../composables";
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
    const { response } = useTheme();
    const raw = useSidebar();
    const sidebar = computed(() => flatArrayWithRoute(raw.value));

    const trigger = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit("update:modelValue", val);
      },
    });

    const ns = useBem("sidebar");
    return () => {
      const isDrawer = response.value === "mobile";
      const contents = renderMenuItems(sidebar.value, "sidebar");

      if (isDrawer) {
        return (
          <VtiDrawer
            modelValue={trigger.value}
            onUpdate:modelValue={(v: boolean) => (trigger.value = v)}
            resizable={true}
            placement={"left"}
            size={"medium"}
          >
            {/* drawer header slots */}
            <VtiMenu onClick={() => (trigger.value = false)} size={"large"} collapsed showActivate>
              {contents}
            </VtiMenu>
            {/* drawer footer slots  */}
          </VtiDrawer>
        );
      }
      return (
        <div class={[ns.b(), ns.m(response.value)]}>
          {/* fixed header slots */}
          <VtiMenu size={"medium"} collapsed showActivate>
            {contents}
          </VtiMenu>
          {/* fixed header slots */}
        </div>
      );
    };
  },
});

export { VtiSidebar };
