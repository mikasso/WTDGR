import BoardManager from "@/js/KonvaManager/BoardManager";
import { ActionFactory } from "@/js/SignalR/Action";
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
    const vertex = event.target;
    const action = this.actionFactory.create("Delete", vertex.attrs);
    this.hub.sendAction(action);
  }

  private edgeClick(event: KonvaEventObject<any>) {
    const edge = event.target;
    const action = this.actionFactory.create("Delete", edge.attrs);
    this.hub.sendAction(action);
  }

  private pencilClick(event: KonvaEventObject<any>) {
    //TODO it is not online
    const drawing = event.target;
    this.boardManager.eraseDrawing(drawing);
  }
}
