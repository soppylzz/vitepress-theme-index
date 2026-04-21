<script setup lang="ts">
import gsap from "gsap";
import { onMounted, onUnmounted, watch, shallowRef, computed, getCurrentInstance } from "vue";
import { useBem, useDecorator } from "../../composables";

const model = defineModel<boolean>({ default: false });
const path = shallowRef<SVGPathElement | null>(null);

let t: gsap.core.Tween | null = null;

const { withId } = useDecorator();
const playSVGMorph = (isClose: boolean) => {
  if (!path.value) return;
  if (t) t.kill();

  t = gsap.to(path.value, {
    morphSVG: `#${isClose ? withId("close") : withId("open")}`,
    duration: 0.4,
    ease: "power2.inOut",
    overwrite: true,
  });
};

watch(model, (newVal) => {
  playSVGMorph(newVal);
});

onMounted(() => {
  playSVGMorph(model.value);
});

onUnmounted(() => {
  if (t) t.kill();
  t = null;
});

const ns = useBem("nav-switch");
const kls = computed(() => ({
  button: [ns.b()],
}));
</script>

<template>
  <div :class="kls.button" class="cursor-pointer" @click="model = !model">
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <!--! Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. -->
      <defs>
        <path
          :id="withId('close')"
          d="M118.675 73.475C106.175 60.975 85.875 60.975 73.375 73.475C60.875 85.975 60.875 106.275 73.375 118.775L210.775 256.075L73.475 393.475C60.975 405.975 60.975 426.275 73.475 438.775C85.975 451.275 106.275 451.275 118.775 438.775L256.075 301.375L393.475 438.675C405.975 451.175 426.275 451.175 438.775 438.675C451.275 426.175 451.275 405.875 438.775 393.375L301.375 256.075L438.675 118.675C451.175 106.175 451.175 85.875 438.675 73.375C426.175 60.875 405.875 60.875 393.375 73.375L256.075 210.775L118.675 73.475Z"
        />
        <path
          :id="withId('open')"
          d="M405.165 174.149C434.708 167.202 456.719 140.672 456.719 108.953C456.719 71.9615 426.757 42 389.766 42C353.444 42 323.9 70.8735 322.812 106.861L168.988 168.458C156.852 156.49 140.282 149.125 121.953 149.125C84.9615 149.125 55 179.087 55 216.078C55 253.07 84.9615 283.031 121.953 283.031C132.163 283.031 141.872 280.772 150.492 276.671L272.347 383.294C270.338 389.654 269.25 396.517 269.25 403.547C269.25 440.538 299.212 470.5 336.203 470.5C373.195 470.5 403.156 440.538 403.156 403.547C403.156 380.364 391.439 359.944 373.53 347.976L405.165 174.149ZM185.81 236.331C187.651 230.557 188.739 224.447 188.906 218.17L342.731 156.657C345.744 159.586 348.924 162.265 352.439 164.608L320.804 338.351C316.201 339.439 311.765 340.946 307.581 342.954L185.81 236.331Z"
        />
      </defs>
      <path
        ref="path"
        d="M256 201C270.587 201 284.576 206.794 294.89 217.11C305.206 227.424 311 241.413 311 256C311 270.587 305.206 284.576 294.89 294.89C284.576 305.206 270.587 311 256 311C241.413 311 227.424 305.206 217.11 294.89C206.794 284.576 201 270.587 201 256C201 241.413 206.794 227.424 217.11 217.11C227.424 206.794 241.413 201 256 201Z"
      />
    </svg>
  </div>
</template>
