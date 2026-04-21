import { getCurrentInstance, useId } from "vue";
import { pascalCase } from "../../utils";

function hasEmitHook(event: string) {
  const ins = getCurrentInstance();
  const onName = `on${pascalCase(event)}`;
  return !!ins?.vnode.props?.[onName];
}

function useDecorator() {
  const uid = useId();
  function withId(str: string) {
    return `${str}-${uid}`;
  }
  return { withId };
}

export { hasEmitHook, useDecorator };
