import type { IndexPlacement, IndexSize } from "../global";

interface DrawerProps {
  size: IndexSize;
  resizable: boolean;
  touchable: boolean;
  placement: IndexPlacement;
}

interface DrawerEmits {
  (e: "close"): void;
}

export type { DrawerProps, DrawerEmits };
