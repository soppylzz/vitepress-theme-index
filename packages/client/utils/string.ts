import { camelCase, upperFirst } from "lodash-unified";

const pascalCase = (str: string) => upperFirst(camelCase(str));

export { pascalCase };
