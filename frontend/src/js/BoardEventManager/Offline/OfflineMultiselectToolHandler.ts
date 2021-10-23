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
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.multiselectMouseDown = (event) =>
      this.multiselectMouseDown(event);
  }

  private mouseDown(event: KonvaEventObject<any>) {
    console.log("mouseDown");
    if (this.boardManager.multiselectManager.isDragging) return;
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.startMultiselect(mousePos);
    this.updateDraw();
  }

  private mouseUp(event: KonvaEventObject<Vertex>) {
    console.log("mouseUp", this.boardManager.multiselectManager.isDragging);
    if (this.boardManager.multiselectManager.isDragging)
      this.boardManager.multiselectManager.stopDrag();
    else this.boardManager.finishMultiselect();
  }

  private multiselectMouseDown(event: KonvaEventObject<Vertex>) {
    console.log("multiselectMouseDown");
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.startDrag(mousePos);
    this.updateDrag();
  }

  private async updateDraw() {
    while (this.boardManager.multiselectManager.isDrawing) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.moveMultiselect(mousePos);
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
    }
  }

  private async updateDrag() {
    while (this.boardManager.multiselectManager.isDragging) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.multiselectManager.updateDrag(mousePos);
      await new Promise((resolve) => {
        setTimeout(resolve, 30);
      });
    }
  }
}
