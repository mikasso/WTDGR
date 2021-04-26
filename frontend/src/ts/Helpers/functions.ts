import { Vector2d } from "konva/types/types";

const RightClickType = 3;
const LeftClikType = 1;
export function getPointFromEvent(event: any): Vector2d {
  return {
    x: event.evt.layerX,
    y: event.evt.layerY,
  };
}

export function isRightClick(event: any) {
  return event.evt.which === RightClickType;
}

export function isLeftClick(event: any) {
  return event.evt.which === LeftClikType;
}
