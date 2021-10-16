import BoardManager from "@/js/KonvaManager/BoardManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";

export default class OfflineHighlightToolHandler implements IHandler {
  constructor(private boardManager: BoardManager) {}
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseEnter = (event) => this.vertexMouseEnter(event);
    eventManager.vertexMouseLeave = (event) => this.vertexMouseLeave(event);
    eventManager.edgeMouseEnter = (event) => this.edgeMouseEnter(event);
    eventManager.edgeMouseLeave = (event) => this.edgeMouseLeave(event);
  }

  private vertexMouseEnter(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("vertex", event.target as Vertex, true);
  }

  private vertexMouseLeave(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("vertex", event.target as Vertex, false);
  }

  private edgeMouseEnter(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("edge", event.target as Vertex, true);
  }

  private edgeMouseLeave(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("edge", event.target as Vertex, false);
  }
}
