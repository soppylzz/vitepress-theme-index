import { camelCase, upperFirst } from "lodash-unified";

function pascalCase(str: string) {
  return upperFirst(camelCase(str));
}

export { pascalCase };
