import BoardManager from "@/js/KonvaManager/BoardManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { IHandler } from "../IHandler";
import { isLeftClick } from "../utils";
import { PencilLine } from "@/js/KonvaManager/PencilManager";
import { SentRequestInterval } from "../OnlineBoardEventManager";

export default class OnlinePencilToolHandler implements IHandler {
  intervalId: number | null = null;
  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub
  ) {}
  setInactive(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseUp = () => this.mouseUp();
  }

  private mouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const mousePos = this.boardManager.getMousePosition();
    const drawing = this.boardManager.createPencil(mousePos);
    const action = this.actionFactory.create(ActionTypes.Add, drawing.asDTO());
    this.hub.sendAction(action);
    this.intervalId = window.setInterval(
      () => this.sendDrawingEdit(),
      SentRequestInterval
    );
  }

  private sendDrawingEdit() {
    const currentDrawing = this.boardManager.pencilManager.currentDrawing;
    if (currentDrawing != null) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.pencilManager.appendPoint(mousePos);
      const pointsTemp = [...currentDrawing.attrs.points];
      currentDrawing.attrs.points = [mousePos.x, mousePos.y];
      const action = this.actionFactory.create(
        ActionTypes.Edit,
        currentDrawing.asDTO()
      );
      currentDrawing.attrs.points = pointsTemp;
      return this.hub.sendAction(action);
    }
  }

  private mouseUp() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
