type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]: RGB): string {
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixChannel(a: number, b: number, p: number) {
  return Math.round(a * (1 - p) + b * p);
}

function colorMix(color: string, mixColor: string, percent: number) {
  const c1 = hexToRgb(color);
  const c2 = hexToRgb(mixColor);

  return rgbToHex([
    mixChannel(c1[0], c2[0], percent),
    mixChannel(c1[1], c2[1], percent),
    mixChannel(c1[2], c2[2], percent),
  ]);
}

function getColorBrightness(color: string): number {
  const [r, g, b] = hexToRgb(color);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export { colorMix, getColorBrightness };
