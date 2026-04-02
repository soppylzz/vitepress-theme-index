import type { IndexPlacement, IndexSize } from "../global";

interface DrawerProps {
  size: IndexSize;
  resizable: boolean;
  touchable: boolean;
  placement: IndexPlacement;
}

interface DrawerEmits {
  (e: "onClose"): void;
}

export type { DrawerProps, DrawerEmits };
