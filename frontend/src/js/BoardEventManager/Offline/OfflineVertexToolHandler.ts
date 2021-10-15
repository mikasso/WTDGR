import BoardManager from "@/js/KonvaManager/BoardManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";

export default class OfflineVertexToolHandler implements IHandler {
  constructor(private boardManager: BoardManager) {}
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.click = (event) => this.click(event);
  }

  private click(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    if (mousePos !== null) {
      const vertex = this.boardManager.createVertex(mousePos);
      this.boardManager.draw(vertex);
    }
  }
}
