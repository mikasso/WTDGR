import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { getPointFromEvent, isLeftClick } from "../utils";

export default class OfflineEdgeToolHandler implements IHandler {
  constructor(
    private boardManager: BoardManager,
    private highlightHandler: IHandler
  ) {}
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.mouseMove = (event) => this.mouseMove(event);
    eventManager.vertexMouseUp = (event) => this.vertexMouseUp(event);
    eventManager.mouseUp = () => this.mouseUp();
  }

  private vertexMouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const vertex = event.target;
    const line = this.boardManager.startDrawingLine(vertex);
    this.boardManager.addLine(line!);
  }

  private mouseMove(event: KonvaEventObject<any>) {
    const point = getPointFromEvent(event);
    this.boardManager.moveLineToPoint(point);
  }

  private vertexMouseUp(event: KonvaEventObject<any>) {
    const vertex = event.target;
    const edge = this.boardManager.connectVertexes(vertex);
    if (edge !== undefined) {
      this.bindEdgeEvents(edge);
      this.boardManager.draw(edge);
    }
  }

  private mouseUp() {
    this.boardManager.stopDrawingLine();
  }
}
