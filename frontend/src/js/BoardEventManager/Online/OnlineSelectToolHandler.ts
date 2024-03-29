import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { getUserColor } from "@/js/SignalR/User";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { getPointFromEvent, ItemColors, poll } from "../utils";

export default class OnlineSelectToolHandler implements IHandler {
  intervalId: number | null = null;
  currentVertex: Vertex | null = null;
  currentEdge: Edge | null = null;
  private readonly MaxAttempts = 3;
  private readonly PollingTime = 100;
  private boardManager: BoardManager;
  constructor(
    private actionFactory: ActionFactory,
    private hub: BoardHub,
    private offlineHighlighter: IHandler
  ) {
    this.boardManager = BoardManager.getBoardManager();
  }

  public setActive(eventManager: BaseBoardEventManager): void {
    this.offlineHighlighter.setActive(eventManager);
    eventManager.vertexMouseDown = async (event) =>
      await this.vertexMouseDown(event);
    eventManager.mouseUp = async () => await this.mouseUp();
    eventManager.edgeMouseDown = async (event) =>
      await this.edgeMouseDown(event);
  }

  public setInactive(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    if (this.currentVertex !== null) {
      this.currentVertex.setAttrs({ stroke: ItemColors.defaultStroke });
      const vertex = this.currentVertex;
      this.hub.sendAction(
        this.actionFactory.create(ActionTypes.ReleaseItem, vertex.asDTO())
      );
      this.boardManager.setFollowMousePointerById(vertex.attrs.id, false);
    }

    if (this.currentEdge !== null) {
      this.currentEdge.setAttrs({ stroke: ItemColors.defaultStroke });
      const edge = this.currentEdge;
      this.hub.sendAction(
        this.actionFactory.create(ActionTypes.ReleaseItem, [
          edge.asDTO(),
          edge.v1.asDTO(),
          edge.v2.asDTO(),
        ])
      );
      this.boardManager.setFollowMousePointerById(edge.attrs.id, false);
    }

    this.intervalId = null;
    this.currentVertex = null;
    this.currentEdge = null;
  }

  private async sendVertexEdit(vertex: Vertex) {
    const mousePos = this.boardManager.getMousePosition();

    const action = this.actionFactory.create(ActionTypes.Edit, {
      ...vertex.asDTO(),
      x: mousePos.x,
      y: mousePos.y,
    });
    await this.hub.sendAction(action);
  }

  private async sendVertexEditsFromEdge(edge: Edge) {
    const mousePos = this.boardManager.getMousePosition();
    const { v1Pos, v2Pos } =
      this.boardManager.edgeManager.calculcateNewVerticesPosition(mousePos);

    const action = this.actionFactory.create(ActionTypes.Edit, [
      {
        ...edge.v1.asDTO(),
        ...v1Pos,
      },
      {
        ...edge.v2.asDTO(),
        ...v2Pos,
      },
    ]);

    await this.hub.sendAction(action);
  }

  private async vertexMouseDown(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    this.currentVertex = vertex;
    const action = this.actionFactory.create(
      ActionTypes.RequestToEdit,
      vertex.asDTO()
    );
    await this.hub.sendAction(action);

    const result = await poll({
      fn: () => {
        if (
          this.currentVertex !== null &&
          this.currentVertex.followMousePointer
        ) {
          if (this.intervalId !== null) {
            clearInterval(this.intervalId);
          }
          this.currentVertex.setAttrs({ stroke: getUserColor() });
          this.intervalId = window.setInterval(
            async (x: Vertex) => await this.sendVertexEdit(x),
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

  private mouseUp() {
    this.setInactive();
  }

  private async edgeMouseDown(event: KonvaEventObject<any>) {
    const edge = event.target as Edge;
    this.currentEdge = edge;
    const action = this.actionFactory.create(ActionTypes.RequestToEdit, [
      edge.asDTO(),
      edge.v1.asDTO(),
      edge.v2.asDTO(),
    ]);
    await this.hub.sendAction(action);

    const result = await poll({
      fn: () => {
        if (this.currentEdge !== null && this.currentEdge.followMousePointer) {
          this.boardManager.startDraggingEdge(
            event.target as Edge,
            getPointFromEvent(event)
          );
          if (this.intervalId !== null) {
            clearInterval(this.intervalId);
          }
          this.currentEdge.setAttrs({ stroke: getUserColor() });
          this.hub.sendAction(
            this.actionFactory.create(
              ActionTypes.Edit,
              this.currentEdge.asDTO()
            )
          );
          this.intervalId = window.setInterval(
            async (x: Edge) => await this.sendVertexEditsFromEdge(x),
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
