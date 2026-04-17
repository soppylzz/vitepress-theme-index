import type { MaybeRefOrGetter } from "vue";
import { computed, getCurrentInstance, toValue } from "vue";
import { colorMix, getColorBrightness } from "../../utils";

const COLORS = [
  "#1677ff",
  "#0958d9",
  "#d48806",
  "#d93026",
  "#00b42a",
  "#722ed1",
  "#ed499c",
  "#531dab",
  "#13c2c2",
  "#fa8c16",
  "#a0d911",
  "#531dab",
];

function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

function generateColorSet(mainColor: string) {
  const isLight = getColorBrightness(mainColor) > 160;
  const mixTarget = isLight ? "#000000" : "#ffffff";

  const mix = (p: number) => colorMix(mainColor, mixTarget, p);

  return {
    text: mainColor,
    textHover: mix(0.1),
    bg: mix(0.45),
    bgHover: mix(0.35),
  };
}

function useRandomColor(text: MaybeRefOrGetter<string>) {
  const uid = getCurrentInstance()!.uid;
  const mainColor = computed(
    () => COLORS[hashStringToIndex(`${uid}_${toValue(text)}`, COLORS.length)]
  );

  const cssVar = computed(() => {
    const colorSet = generateColorSet(mainColor.value);
    return {
      "--vti-text-random": colorSet.text,
      "--vti-bg-random": colorSet.bg,
      "--vti-text-random-hover": colorSet.textHover,
      "--vti-bg-random-hover": colorSet.bgHover,
    };
  });

  return { cssVar };
}

export { useRandomColor };
