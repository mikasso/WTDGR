import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { laysOnCurrentLayer } from "../utils";

export default class OfflineEraseToolHandler implements IHandler {
  private boardManager: BoardManager;
  constructor(private highlightHandler: IHandler) {
    this.boardManager = BoardManager.getBoardManager();
  }
  setInactive(): void {
    this.highlightHandler.setInactive();
  }
  setActive(eventManager: BaseBoardEventManager): void {
    this.highlightHandler.setActive(eventManager);
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.edgeClick = (event) => this.edgeClick(event);
    eventManager.pencilClick = (event) => this.pencilClick(event);
  }

  private vertexMouseDown(event: KonvaEventObject<Vertex>) {
    if (!laysOnCurrentLayer(event.target)) return;
    const vertex = event.target as Vertex;
    this.boardManager.eraseVertex(vertex);
  }
  private edgeClick(event: KonvaEventObject<Edge>) {
    if (!laysOnCurrentLayer(event.target)) return;
    const edge = event.target as Edge;
    this.boardManager.eraseEdge(edge);
  }
  private pencilClick(event: KonvaEventObject<any>) {
    if (!laysOnCurrentLayer(event.target)) return;
    const drawing = event.target;
    this.boardManager.eraseDrawing(drawing);
  }
}
