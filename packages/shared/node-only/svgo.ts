import type { Config } from "svgo";

const svgoConfig: Config = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false,
          removeViewBox: false,
          removeUselessStrokeAndFill: false,
        },
      },
    },
    {
      name: "removeAttrs",
      params: {
        attrs: [
          "stroke",
          "stroke-width",
          "stroke-linecap",
          "stroke-linejoin",
          "stroke-miterlimit",
          "stroke-dasharray",
          "stroke-dashoffset",
          "stroke-opacity",

          "fill",
          "fill-opacity",
          "fill-rule",

          "style",
          "data-*",
        ],
      },
    },
    "mergePaths",
    "convertTransform",
    "removeComments",
    "removeDimensions",
  ],
};

export { svgoConfig };
