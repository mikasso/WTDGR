import BoardManager from "@/js/KonvaManager/BoardManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";

export default class OfflinePencilToolHandler implements IHandler {
  constructor(private boardManager: BoardManager) {}
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseMove = (event) => this.mouseMove(event);
    eventManager.mouseUp = () => this.mouseUp();
  }

  private mouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.startPencil(mousePos);
  }
  private mouseMove(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.movePencil(mousePos);
  }
  private mouseUp() {
    this.boardManager.finishPencilDrawing();
  }
}
