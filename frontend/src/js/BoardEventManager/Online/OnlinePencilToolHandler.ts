import BoardManager from "@/js/KonvaManager/BoardManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { IHandler } from "../IHandler";
import { isLeftClick, poll } from "../utils";
import { PencilLine } from "@/js/KonvaManager/PencilManager";
import { SentRequestInterval } from "../OnlineBoardEventManager";

const PointsBatchSize = 3;
export default class OnlinePencilToolHandler implements IHandler {
  private boardManager: BoardManager;
  intervalId: number | null = null;
  private pointsBatch: number[] = [];

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
          { ...currentDrawing.asDTO(), points: this.pointsBatch }
        );
        await this.hub.sendAction(releaseAction);
      }
      this.pointsBatch = [];
    }
  }
  setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = async (event) => await this.mouseDown(event);
    eventManager.mouseUp = async () => await this.mouseUp();
  }

  private async mouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    if (this.intervalId !== null) {
      this.setInactive();
      return;
    }
    const mousePos = this.boardManager.getMousePosition();
    const drawing = this.boardManager.createPencil(mousePos);
    const pencilManager = this.boardManager.pencilManager;
    pencilManager.awaitingAdd = true;
    const action = this.actionFactory.create(ActionTypes.Add, drawing.asDTO());
    this.hub.sendAction(action);
    this.pointsBatch = [];

    await poll({
      fn: () => {
        if (pencilManager.awaitingAdd === false) {
          this.intervalId = window.setInterval(
            async () => await this.drawLine(),
            SentRequestInterval
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

  private async drawLine() {
    const currentDrawing = this.boardManager.pencilManager.currentDrawing;
    if (currentDrawing != null) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.pencilManager.appendPoint(mousePos);
      this.pointsBatch.push(mousePos.x, mousePos.y);
      if (this.pointsBatch.length === PointsBatchSize * 2) {
        await this.sendLineEdit(currentDrawing);
      }
    }
  }

  async sendLineEdit(line: PencilLine) {
    const lineDTO = { ...line.asDTO(), points: this.pointsBatch };
    const action = this.actionFactory.create(ActionTypes.Edit, lineDTO);
    await this.hub.sendAction(action);
    this.pointsBatch = [];
  }

  private async mouseUp() {
    await this.setInactive();
  }
}
