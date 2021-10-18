import BoardManager from "@/js/KonvaManager/BoardManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";

export default class OnlineVertextoolHandler implements IHandler {
  private boardManager: BoardManager;
  constructor(
    private actionFactory: ActionFactory,
    private hub: BoardHub
  ) {
    this.boardManager = BoardManager.getBoardManager();
  }
  setInactive(): void {}
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.click = (event) => this.click(event);
  }

  click(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const mousePos = this.boardManager.getMousePosition();
    const vertex = this.boardManager.createVertex(mousePos);

    const action = this.actionFactory.create(ActionTypes.Add, vertex.asDTO());
    this.hub.sendAction(action);
  }
}
