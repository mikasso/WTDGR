import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";

export default class OfflineEraseToolHandler implements IHandler {
  constructor(
    private boardManager: BoardManager,
    private highlightHandler: IHandler
  ) {}
  setInactive(): void {
    this.highlightHandler.setInactive();
  }
  setActive(eventManager: BaseBoardEventManager): void {
    this.highlightHandler.setActive(eventManager);
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.edgeClick = (event) => this.edgeClick(event);
    eventManager.pencilClick = (event) => this.pencilClick(event);
  }

  private vertexMouseDown(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    this.boardManager.eraseVertex(vertex);
  }
  private edgeClick(event: KonvaEventObject<any>) {
    const edge = event.target as Edge;
    this.boardManager.eraseEdge(edge);
  }
  private pencilClick(event: KonvaEventObject<Vertex>) {
    const drawing = event.target;
    this.boardManager.eraseDrawing(drawing);
  }
}
