import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";

export default class OffLineSelectHandler implements IHandler {
  constructor(
    private boardManager: BoardManager,
    private highlightHandler: IHandler
  ) {}
  setInactive(): void {
    this.boardManager.disableDrag();
    this.highlightHandler.setInactive();
  }
  setActive(eventManager: BaseBoardEventManager): void {
    this.boardManager.enableDrag();
    this.highlightHandler.setActive(eventManager);
    eventManager.mouseMove = () => this.mouseMove();
    eventManager.vertexDrag = (event) => this.vertexDrag(event);
    eventManager.edgeMouseDown = (event) => this.edgeMouseDown(event);
    eventManager.mouseUp = () => this.mouseUp();
  }

  private vertexDrag(event: KonvaEventObject<any>) {
    this.boardManager.dragEdges(event.target as Vertex);
  }

  private edgeMouseDown(event: KonvaEventObject<any>) {
    const mousePos = this.boardManager.getMousePosition();
    if (mousePos !== null)
      this.boardManager.startDraggingEdge(event.target as Edge, mousePos);
  }
  private mouseMove() {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.dragEdge(mousePos);
  }
  private mouseUp() {
    this.boardManager.stopDraggingEdge();
  }
}
