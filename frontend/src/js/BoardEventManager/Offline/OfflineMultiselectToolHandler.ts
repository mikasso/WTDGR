import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";

export default class OfflineMultiselectToolHandler implements IHandler {
  private drawUpdateInterval: number | undefined;
  private dragInterval: number | undefined;
  private readonly updateTime = 25;
  private readonly dragTime = 25;
  private boardManager: BoardManager;
  constructor() {
    this.boardManager = BoardManager.getBoardManager();
  }
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.multiselectMouseDown = (event) =>
      this.multiselectMouseDown(event);
  }

  setInactive() {
    this.boardManager.setHighlightOfSelected(false);
    this.boardManager.multiselectManager.stopDrag();
    this.boardManager.multiselectManager.isDrawing = false;
    this.boardManager.multiselectManager.removeSelect();
    if (this.drawUpdateInterval) clearInterval(this.drawUpdateInterval);
    if (this.dragInterval) clearInterval(this.dragInterval);
  }

  private mouseDown(event: KonvaEventObject<any>) {
    if (this.boardManager.multiselectManager.isDragging) return;
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.startMultiselect(mousePos);
    this.drawUpdateInterval = window.setInterval(
      () => this.updateDraw(),
      this.updateTime
    );
  }

  private mouseUp(event: KonvaEventObject<Vertex>) {
    if (this.boardManager.multiselectManager.isDragging) {
      this.boardManager.multiselectManager.stopDrag();
      clearInterval(this.dragInterval);
      this.dragInterval = undefined;
    } else {
      this.boardManager.finishMultiselect();
      clearInterval(this.drawUpdateInterval);
      this.dragInterval = undefined;
    }
  }

  private multiselectMouseDown(event: KonvaEventObject<Vertex>) {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.startDrag(mousePos);
    this.dragInterval = window.setInterval(
      () => this.updateDrag(),
      this.dragTime
    );
  }

  private async updateDraw() {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.appendPoint(mousePos);
  }

  private async updateDrag() {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.updateDrag(mousePos);
  }
}
