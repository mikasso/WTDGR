import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { getPointFromEvent, poll } from "../utils";

export default class OnlineSelectToolHandler implements IHandler {
  intervalId: number | null = null;
  currentVertex: Vertex | null = null;
  currentEdge: Edge | null = null;
  private readonly MaxAttempts = 3;
  private readonly PollingTime = 100;
  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub
  ) {}

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.edgeMouseDown = (event) => this.edgeMouseDown(event);
  }

  public setInactive(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    if (this.currentVertex !== null) {
      const vertex = this.currentVertex;
      this.hub.sendAction(
        this.actionFactory.create(ActionTypes.ReleaseItem, vertex.asDTO())
      );
      this.boardManager.setFollowMousePointerById(vertex.attrs.id, false);
    }

    if (this.currentEdge !== null) {
      const edge = this.currentEdge;
      this.hub.sendAction(
        this.actionFactory.create(ActionTypes.ReleaseItem, edge.asDTO())
      );
      this.boardManager.setFollowMousePointerById(edge.attrs.id, false);
    }

    this.intervalId = null;
    this.currentVertex = null;
    this.currentEdge = null;
  }

  private sendVertexEdit(vertex: Vertex) {
    const mousePos = this.boardManager.getMousePosition();

    const action = this.actionFactory.create(ActionTypes.Edit, {
      ...vertex.asDTO(),
      x: mousePos.x,
      y: mousePos.y,
    });
    return this.hub.sendAction(action);
  }

  private sendVertexEditsFromEdge(edge: Edge) {
    const mousePos = this.boardManager.getMousePosition();
    const {
      v1Pos,
      v2Pos,
    } = this.boardManager.edgeManager.calculcateNewVerticesPosition(mousePos);

    const action1 = this.actionFactory.create(ActionTypes.Edit, {
      ...edge.v1.asDTO(),
      ...v1Pos,
    });
    const action2 = this.actionFactory.create(ActionTypes.Edit, {
      ...edge.v2.asDTO(),
      ...v2Pos,
    });
    this.hub.sendAction(action1);
    return this.hub.sendAction(action2);
  }

  private async vertexMouseDown(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    this.currentVertex = vertex;
    const action = this.actionFactory.create(
      ActionTypes.RequestToEdit,
      vertex.asDTO()
    );
    this.hub.sendAction(action);

    const result = await poll({
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
      interval: this.PollingTime,
      maxAttempts: this.MaxAttempts,
      validate: (x) => x,
    }).catch((e) => {
      console.error(e);
    });

    if (result === false) {
      this.currentVertex = null;
    }
  }

  private mouseUp(event: KonvaEventObject<any>) {
    this.setInactive();
  }

  private async edgeMouseDown(event: KonvaEventObject<any>) {
    const edge = event.target as Edge;
    this.currentEdge = edge;
    const action = this.actionFactory.create(
      ActionTypes.RequestToEdit,
      edge.asDTO()
    );
    this.hub.sendAction(action);

    const result = await poll({
      fn: () => {
        if (this.currentEdge !== null && this.currentEdge.followMousePointer) {
          this.boardManager.startDraggingEdge(
            event.target as Edge,
            getPointFromEvent(event)
          );
          this.intervalId = window.setInterval(
            (x: Edge) => this.sendVertexEditsFromEdge(x),
            SentRequestInterval,
            this.currentEdge
          );
          return true;
        }
        return false;
      },
      interval: this.PollingTime,
      maxAttempts: this.MaxAttempts,
      validate: (x) => x,
    }).catch((e) => {
      console.error(e);
    });

    if (result === false) {
      this.currentEdge = null;
    }
  }
}
