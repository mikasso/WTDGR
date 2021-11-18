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
  private maxPointsBatchSize = 8;
  private editCounter = 0;
  constructor(private actionFactory: ActionFactory, private hub: BoardHub) {
    this.boardManager = BoardManager.getBoardManager();
  }
  async setInactive(): Promise<void> {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      const currentDrawing = this.boardManager.pencilManager.currentDrawing;
      if (currentDrawing != null) {
        await this.sendLineEdit(currentDrawing);
        const releaseAction = this.actionFactory.create(
          ActionTypes.ReleaseItem,
          currentDrawing.asDTO()
        );
        await this.hub.sendAction(releaseAction);
      }
      this.editCounter = 0;
    }
  }
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = async (event) => await this.mouseDown(event);
    eventManager.mouseUp = async () => await this.mouseUp();
  }

  private async mouseDown(event: KonvaEventObject<any>) {
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
      async () => await this.drawLine(),
      SentRequestInterval
    );
  }

  private async drawLine() {
    const currentDrawing = this.boardManager.pencilManager.currentDrawing;
    if (currentDrawing != null) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.pencilManager.appendPoint(mousePos);
      this.editCounter += 1;
      if (this.editCounter % this.maxPointsBatchSize == 0) {
        await this.sendLineEdit(currentDrawing);
      }
    }
  }

  async sendLineEdit(line: PencilLine) {
    const action = this.actionFactory.create(ActionTypes.Edit, line.asDTO());
    await this.hub.sendAction(action);
  }

  private async mouseUp() {
    await this.setInactive();
  }
}
