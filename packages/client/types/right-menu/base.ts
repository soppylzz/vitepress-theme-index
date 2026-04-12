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
  trigger?: () => void;
}

interface RMenuEventHooks extends RMenuBaseHooks {
  activateBefore?: (evt?: MouseEvent | KeyboardEvent) => boolean | void;
  activate?: (evt?: MouseEvent | KeyboardEvent) => void;

  select?: (key?: string) => void;
}

interface RMenuExpandHooks extends RMenuEventHooks {
  deactivate?: () => void;
}

export type { RMenuBaseProps, RMenuEventProps, RMenuEventHooks, RMenuExpandHooks };
