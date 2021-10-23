import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";

export default class OfflineMultiselectToolHandler implements IHandler {
  constructor(private boardManager: BoardManager) {}
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseMove = (event) => this.mouseMove(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.multiselectMouseDown = (event) =>
      this.multiselectMouseDown(event);
    eventManager.multiselectMouseUp = (event) => this.multiselectMouseUp(event);
  }

  private mouseDown(event: KonvaEventObject<any>) {
    if (this.boardManager.multiselectManager.isDragging) return;
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.startMultiselect(mousePos);
  }
  private mouseMove(event: KonvaEventObject<any>) {
    if (this.boardManager.multiselectManager.isDragging) return;
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.moveMultiselect(mousePos);
  }
  private mouseUp(event: KonvaEventObject<Vertex>) {
    this.boardManager.multiselectManager.stopDrag();
    this.boardManager.finishMultiselect();
  }
  private multiselectMouseDown(event: KonvaEventObject<Vertex>) {
    this.boardManager.multiselectManager.startDrag();
  }
  private multiselectMouseUp(event: KonvaEventObject<Vertex>) {
    this.boardManager.multiselectManager.stopDrag();
  }
}
