import type { IndexActivateEvent, IndexPlacement, IndexSize, IndexText } from "../global";

type PopperMode = "inline" | "block";

interface PopperProps {
  content?: IndexText;
  mode?: PopperMode;
  placement?: IndexPlacement;
  autoPlace?: boolean;
  size?: IndexSize;
  activateEvent?: IndexActivateEvent;
  delay?: number;
}

export type { PopperProps };
