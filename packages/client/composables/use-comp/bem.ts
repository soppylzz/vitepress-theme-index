import type { MaybeArray } from "@vitepress-theme-index/shared";
import { ensureArray } from "@vitepress-theme-index/shared";

interface UseBemOptions {
  namespace?: string;
  commonSeparator?: string;
  elementSeparator?: string;
  modifierSeparator?: string;
  statePrefix?: string;
}

const defaultUseBemOptions: UseBemOptions = {
  namespace: "vti",
  commonSeparator: "-",
  elementSeparator: "__",
  modifierSeparator: "--",
  statePrefix: "is-",
};

function useBem(block: string, options?: UseBemOptions) {
  const {
    namespace,
    commonSeparator: cSep,
    elementSeparator: eSep,
    modifierSeparator: mSep,
    statePrefix,
  } = { ...defaultUseBemOptions, ...options };

  const base = `${namespace}${cSep}${block}`;

  const _bem = (e: string, m: string) => {
    let selector = base;
    if (e) selector += `${eSep}${e}`;
    if (m) selector += `${mSep}${m}`;
    return selector;
  };

  const b = () => base;
  const e = (element: string) => _bem(element, "");
  const m = (modifier: string) => _bem("", modifier);
  const em = (element: string, modifier: string) => _bem(element, modifier);
  const when = (state: string, flag: boolean = true) => (flag ? `${statePrefix}${state}` : "");

  const cssVarName = (name: MaybeArray<string>) => {
    return (ensureArray(name) as string[]).reduce((acc, cur) => {
      return cur ? `${acc}${cSep}${cur}` : acc;
    }, base);
  };

  return { b, e, m, em, when, cssVarName };
}

export { useBem };
