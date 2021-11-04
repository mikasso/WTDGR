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
  private boardManager: BoardManager;
  intervalId: number | null = null;
  private pencilLineEditSend = 20;
  private editCounter = 0;
  constructor(private actionFactory: ActionFactory, private hub: BoardHub) {
    this.boardManager = BoardManager.getBoardManager();
  }
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
    this.boardManager.pencilManager.awaitingAdd = true;
    this.editCounter = 0;
    this.intervalId = window.setInterval(
      () => this.drawLine(),
      SentRequestInterval
    );
  }

  private drawLine() {
    const currentDrawing = this.boardManager.pencilManager.currentDrawing;
    if (currentDrawing != null) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.pencilManager.appendPoint(mousePos);
      currentDrawing.layer.draw();
      this.editCounter += 1;
      if (this.editCounter % this.pencilLineEditSend == 0) {
        this.sendLineEdit(currentDrawing);
      }
    }
  }

  sendLineEdit(line: PencilLine) {
    const action = this.actionFactory.create(ActionTypes.Edit, line.asDTO());
    this.hub.sendAction(action);
  }

  private mouseUp() {
    if (this.intervalId !== null) {
      const currentDrawing = this.boardManager.pencilManager.currentDrawing;
      if (currentDrawing != null) {
        this.sendLineEdit(currentDrawing);
      }
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.editCounter = 0;
    }
  }
}
