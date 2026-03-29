import { EXTERNAL_URL_RE } from "../types";

function checkExternal(url?: string) {
  return !!(url && EXTERNAL_URL_RE.test(url));
}

export { checkExternal };
