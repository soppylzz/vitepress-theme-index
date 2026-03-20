import type { MenuItemState, MenuTrigger } from "./unit";

/* =============== props =============== */
interface BaseProps {
  trigger?: MenuTrigger;
}

interface EventProps extends BaseProps {
  state?: MenuItemState;
  selectable?: boolean;
}

/* =============== hooks =============== */
interface BaseHooks {
  onTrigger?: () => void;
}

interface EventHooks extends BaseHooks {
  onActivateBefore?: (evt?: MouseEvent | KeyboardEvent) => boolean | void;
  onActivate?: (evt?: MouseEvent | KeyboardEvent) => void;

  onSelect?: (key?: string) => void;
}

interface ExpandHooks extends EventHooks {
  onDeactivate?: () => void;
}

export type { BaseProps, BaseHooks, EventProps, EventHooks, ExpandHooks };
