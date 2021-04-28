import { KonvaMouseEvent } from "../Aliases/aliases";

export interface EventHandler {
  handleClick: (event: KonvaMouseEvent) => void;
  handleMouseMove: (event: KonvaMouseEvent) => void;
  handleMouseUp: (event: KonvaMouseEvent) => void;
}
