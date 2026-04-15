import eslint from "@eslint/js";
import globals from "globals";
import tseslint, { parser as tsParser } from "typescript-eslint";
import vue from "eslint-plugin-vue";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "**/dist/",
      "packages/play",
      "**/node_modules/",
      "pnpm-lock.yaml",
      "packages/cli/cli.mjs",
    ],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // recommended
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...vue.configs["flat/recommended"],
  eslintPluginPrettierRecommended,

  // base
  {
    rules: {
      // import
      "import/no-unresolved": "off",
      "import/no-named-as-default": "off",

      // vue
      "vue/first-attribute-linebreak": "off",
      "vue/require-default-prop": "off",
      "vue/return-in-emits-validator": "off",
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],

      // typescript
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/consistent-type-imports": ["error", { disallowTypeAnnotations: true }],

      // prettier
      "prefer-const": "warn",
      "no-console": "warn",
      "no-debugger": "warn",
      "no-unused-vars": "off",

      "max-len": "off",
      "comma-dangle": "off",

      // lodash
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "lodash", message: "Use lodash-unified instead." },
            { name: "lodash-es", message: "Use lodash-unified instead." },
          ],
          patterns: [
            {
              group: ["lodash/*", "lodash-es/*"],
              message: "Use lodash-unified instead.",
            },
          ],
        },
      ],

      "prettier/prettier": "error",
    },
  },
  {
    files: ["*.d.ts"],
    rules: {
      "spaced-comment": "off",
      "import/no-duplicates": "off",
    },
  },
  {
    files: ["**/*.vue", "*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".vue"],
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
]);
