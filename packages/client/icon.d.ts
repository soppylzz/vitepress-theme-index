declare module "virtual:index-icons/all" {
  import type { App } from "vue";
  const IconPlugin: {
    install(app: App): void;
  };
  export default IconPlugin;
}

declare module "virtual:index-icons" {
  import type { DefineComponent } from "vue";

  const icons: Record<string, DefineComponent<{}, {}, any>>;
  export = icons;
}
