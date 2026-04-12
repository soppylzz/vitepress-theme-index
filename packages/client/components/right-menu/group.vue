<script setup lang="ts">
import { computed, ref, useSlots } from "vue";
import type { RMenuGroupEmits, RMenuGroupProps } from "../../types";
import { useBem, useRMenuItem, useProvidePath, useText } from "../../composables";

const emits = defineEmits<RMenuGroupEmits>();
const props = withDefaults(defineProps<RMenuGroupProps>(), {
  row: 1,
  column: 4,
  trigger: true,
  selectable: true,
});

const { render, state, stage, size, enter, leave } = useRMenuItem(props, {
  onChanged: (val) => {
    if (!val) return;
    emits("trigger");
  },
  onEnter: (e) => {
    switchFn(e);
  },
  onSelect: (key) => {
    emits("select", key);
  },
  selectable: () => props.selectable ?? true,
  state: () => props.state,
});

useProvidePath({ state });

const show = ref(false);
const switchFn = (evt: MouseEvent | KeyboardEvent) => {
  if (state.value === "disabled") return;
  if (!show.value) {
    if (emits("activateBefore", evt) !== false) {
      emits("activate", evt);
    }
  } else {
    emits("deactivate");
  }
  show.value = !show.value;
};

const slots = useSlots();
const _slots = computed(() => {
  const _default = slots.default?.() || [];
  if (props.mode === "icon") return _default;
  return show.value ? _default : _default.slice(0, props?.row);
});

const ns = useBem("r-menu-group");
const kls = computed(() => ({
  wrap: [ns.b(), ns.m(size.value), ns.m(props.mode), ns.when(stage.value), ns.when(state.value)],
  text: [ns.e("text"), ns.em("text", size.value)],
  container: [ns.e("container"), ns.em("container", props.mode), ns.em("container", size.value)],
  button: [
    ns.e("button"),
    ns.em("button", size.value),
    ns.when("expanded", show.value),
    ns.when(stage.value),
    ns.when(state.value),
  ],
}));

const styl = computed(() => {
  if (props.mode !== "icon") return {};
  const column = Math.max(Math.min(props.column, 5), 1);
  return { "grid-template-columns": `repeat(${column}, 1fr)` };
});
</script>

<template>
  <div v-show="render" :class="kls.wrap">
    <div v-if="props.mode === 'component'" :class="kls.text">
      {{ useText(props.text) }}
    </div>
    <div :class="kls.container" :style="styl">
      <template v-for="(node, index) in _slots" :key="index">
        <component :is="node" />
      </template>
    </div>
    <div
      v-if="props.mode === 'component'"
      :class="kls.button"
      @click.stop="switchFn"
      @mouseenter="enter"
      @mouseleave="leave"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
        <!--! Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
        <path
          d="M140.3 376.8c12.6 10.2 31.1 9.5 42.8-2.2l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.4 192 288.5 192l-256 0c-12.9 0-24.6 7.8-29.6 19.8S.7 237.5 9.9 246.6l128 128 2.4 2.2z"
        />
      </svg>
    </div>
  </div>
</template>
