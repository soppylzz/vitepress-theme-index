import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray } from "@vitepress-theme-index/shared";

const namespace = "vti";
const statePrefix = "is-";
const varPrefix = `--${namespace}`;
const sep = {
  common: "-",
  element: "__",
  modifier: "--",
};

function cssVarName(name: MaybeArray<string>) {
  return (ensureArray(name) as string[]).reduce((acc, cur) => {
    return cur ? `${acc}${sep.common}${cur}` : acc;
  }, varPrefix);
}

function useBem(block: string) {
  const base = `${namespace}${sep.common}${block}`;

  const _bem = (e: string, m: string) => {
    let selector = base;
    if (e) selector += `${sep.element}${e}`;
    if (m) selector += `${sep.modifier}${m}`;
    return selector;
  };

  const b = () => base;
  const e = (element: string) => _bem(element, "");
  const m = (modifier: string) => _bem("", modifier);
  const em = (element: string, modifier: string) => _bem(element, modifier);
  const when = (state: string, flag: boolean = true) => (flag ? `${statePrefix}${state}` : "");

  return { b, e, m, em, when };
}

function isVar(name: string) {
  return name.startsWith(varPrefix);
}

export { useBem, isVar, cssVarName };
