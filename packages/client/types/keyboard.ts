import type { MaybeDebounce, MaybePromise } from "@vitepress-theme-index/shared";

interface KeydownHandler {
  handler: (e: KeyboardEvent) => MaybePromise<void>;
  priority?: number;
  scope?: string;

  delay?: number;
  stopTransmit?: boolean;
}

interface KeydownEventItem extends KeydownHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

type KeydownInternalItem = Omit<KeydownEventItem, "handler"> & {
  id: string;
  order: number;
  handler: MaybeDebounce<KeydownEventItem["handler"]>;
};

export type { KeydownHandler, KeydownEventItem, KeydownInternalItem };
