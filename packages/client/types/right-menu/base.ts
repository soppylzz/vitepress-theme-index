import type { MenuItemState, MenuTrigger } from "./unit";

/* =============== props =============== */
interface RMenuBaseProps {
  trigger?: MenuTrigger;
}

interface RMenuEventProps extends RMenuBaseProps {
  state?: MenuItemState;
  selectable?: boolean;
}

/* =============== hooks =============== */
interface RMenuBaseHooks {
  onTrigger?: () => void;
}

interface RMenuEventHooks extends RMenuBaseHooks {
  onActivateBefore?: (evt?: MouseEvent | KeyboardEvent) => boolean | void;
  onActivate?: (evt?: MouseEvent | KeyboardEvent) => void;

  onSelect?: (key?: string) => void;
}

interface RMenuExpandHooks extends RMenuEventHooks {
  onDeactivate?: () => void;
}

export type { RMenuBaseProps, RMenuBaseHooks, RMenuEventProps, RMenuEventHooks, RMenuExpandHooks };
