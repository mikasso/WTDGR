import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { PencilLine } from "@/js/KonvaManager/PencilManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";

export default class OnlineEraseToolHandler implements IHandler {
  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub,
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
    const action = this.actionFactory.create(
      ActionTypes.Delete,
      vertex.asDTO()
    );
    this.hub.sendAction(action);
  }

  private edgeClick(event: KonvaEventObject<any>) {
    const edge = event.target as Edge;
    const action = this.actionFactory.create(ActionTypes.Delete, edge.asDTO());
    this.hub.sendAction(action);
  }

  private pencilClick(event: KonvaEventObject<any>) {
    const drawing = event.target as PencilLine;
    const action = this.actionFactory.create(
      ActionTypes.Delete,
      drawing.asDTO()
    );
    this.hub.sendAction(action);
  }
}
