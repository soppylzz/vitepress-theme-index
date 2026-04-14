function colorMix(color: string, mixColor: string, percent: number): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const mixR = parseInt(mixColor.replace("#", "").slice(0, 2), 16);
  const mixG = parseInt(mixColor.replace("#", "").slice(2, 4), 16);
  const mixB = parseInt(mixColor.replace("#", "").slice(4, 6), 16);

  const mix = (base: number, mix: number) => Math.round(base * (1 - percent) + mix * percent);
  return `#${mix(r, mixR).toString(16).padStart(2, "0")}${mix(g, mixG).toString(16).padStart(2, "0")}${mix(b, mixB).toString(16).padStart(2, "0")}`;
}

function getColorBrightness(color: string): number {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export { colorMix, getColorBrightness };
