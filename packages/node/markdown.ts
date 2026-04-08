import type { MarkdownOptions } from "vitepress";

function withIndexMarkdown(config: MarkdownOptions = {}): MarkdownOptions {
  let preFence: any;

  return {
    ...config,
    preConfig: (md) => {
      preFence = md.renderer.rules.fence!;
      config?.preConfig?.(md);
    },
    config: (md) => {
      // disable vitepress default theme
      const containerRules = (md.block.ruler as any).__rules__
        .map((rule) => rule.name)
        .filter((name) => name.startsWith("container_"));
      md.block.ruler.disable(containerRules);
      md.renderer.rules.fence = function (...args) {
        const [tokens, idx] = args;
        const token = tokens[idx];

        return `<div>${preFence(...args)}</div>`;
      };
      config?.config?.(md);
    },
  };
}

export { withIndexMarkdown };
