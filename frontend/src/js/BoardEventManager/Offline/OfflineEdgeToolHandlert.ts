import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { getPointFromEvent, isLeftClick } from "../utils";

export default class OfflineEdgeToolHandler implements IHandler {
  private boardManager: BoardManager;
  constructor() {
    this.boardManager = BoardManager.getBoardManager();
  }
  setInactive(): void {
    this.mouseUp();
  }
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.mouseMove = (event) => this.mouseMove(event);
    eventManager.vertexMouseUp = (event) => this.vertexMouseUp(event);
    eventManager.mouseUp = () => this.mouseUp();
  }

  private vertexMouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const vertex = event.target as Vertex;
    const line = this.boardManager.startDrawingLine(vertex);
    if (line) this.boardManager.addLine(line);
  }

  private mouseMove(event: KonvaEventObject<any>) {
    const point = getPointFromEvent(event);
    this.boardManager.moveLineToPoint(point);
  }

  private vertexMouseUp(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    const edge = this.boardManager.connectVertexes(vertex);
    if (edge !== undefined) {
      this.boardManager.addEdge(edge);
    }
  }

  private mouseUp() {
    this.boardManager.stopDrawingLine();
  }
}
