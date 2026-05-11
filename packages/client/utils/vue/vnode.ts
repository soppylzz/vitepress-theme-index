import type { VNode } from "vue";
import { Fragment } from "vue";

function flattenVNodes(nodes: VNode[] | undefined): VNode[] {
  if (!nodes) return [];
  const result: VNode[] = [];
  nodes.forEach((node) => {
    if (node.type === Fragment) {
      result.push(...flattenVNodes(node.children as VNode[]));
    } else if (node.type !== Comment) {
      result.push(node);
    }
  });
  return result;
}

export { flattenVNodes };
