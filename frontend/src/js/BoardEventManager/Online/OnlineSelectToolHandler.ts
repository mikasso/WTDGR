import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { poll } from "../utils";

export default class OnlineSelectToolHandler implements IHandler {
  intervalId: number | null = null;
  currentVertex: Vertex | null = null;

  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub
  ) {}

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.edgeMouseEnter = (event) => this.edgeMouseEnter(event);
    eventManager.edgeMouseLeave = (event) => this.edgeMouseLeave(event);
    eventManager.edgeMouseDown = () => this.edgeMouseDown();
    eventManager.edgeMouseUp = () => this.edgeMouseUp();
  }

  public setInactive(): void {
    if (this.currentVertex !== null) {
      const vertex = this.currentVertex;
      this.boardManager.setHighlight("vertex", vertex, false);
      this.sendVertexEdit(vertex).then(() =>
        this.hub.sendAction(
          this.actionFactory.create("ReleaseItem", vertex.attrs)
        )
      );
      this.boardManager.setVertexFollowMousePointerById(vertex.attrs.id, false);
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.sendVertexEdit(vertex);
        this.currentVertex = null;
      }
      this.currentVertex = null;
    }
  }

  private sendVertexEdit(vertex: Vertex) {
    const mousePos = this.boardManager.getMousePosition();
    vertex.setAttrs({ x: mousePos.x, y: mousePos.y });
    const action = this.actionFactory.create("Edit", vertex.attrs);
    return this.hub.sendAction(action);
  }

  private vertexMouseDown(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    this.currentVertex = vertex;
    this.boardManager.setHighlight("vertex", this.currentVertex, true);
    const action = this.actionFactory.create(
      "RequestToEdit",
      event.target.attrs
    );
    this.hub.sendAction(action).then(() => this.sendVertexEdit(vertex));

    poll({
      fn: () => {
        if (
          this.currentVertex !== null &&
          this.currentVertex.followMousePointer
        ) {
          this.intervalId = window.setInterval(
            (x: Vertex) => this.sendVertexEdit(x),
            SentRequestInterval,
            this.currentVertex
          );
          return true;
        }
        return false;
      },
      interval: 100,
      maxAttempts: 3,
      validate: (x) => x,
    }).catch((e) => {
      console.error(e);
    });
  }

  private mouseUp(event: KonvaEventObject<any>) {
    this.setInactive();
  }

  private edgeMouseEnter(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("edge", event.target as Edge, true);
  }
  private edgeMouseLeave(event: KonvaEventObject<any>) {
    this.boardManager.setHighlight("edge", event.target as Edge, false);
  }
  private edgeMouseUp() {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.dragEdge(mousePos);
  }
  private edgeMouseDown() {
    this.boardManager.stopDraggingEdge();
  }
}
