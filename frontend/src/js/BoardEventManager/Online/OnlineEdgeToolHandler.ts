import BoardManager from "@/js/KonvaManager/BoardManager";
import { TemporaryLine } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { isLeftClick } from "../utils";

export default class OnlineEdgeToolHandler implements IHandler {
  intervalId: number | null = null;
  currentLine: TemporaryLine | null = null;
  private boardManager: BoardManager;
  constructor(private actionFactory: ActionFactory, private hub: BoardHub) {
    this.boardManager = BoardManager.getBoardManager();
  }

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = async (event) =>
      await this.vertexMouseDown(event);
    eventManager.vertexMouseUp = async (event) =>
      await this.vertexMouseUp(event);
    eventManager.mouseUp = async (event) => await this.mouseUp();
  }

  public async setInactive() {
    if (this.intervalId !== null && this.currentLine !== null) {
      clearInterval(this.intervalId);
      const action = this.actionFactory.create(
        ActionTypes.Delete,
        this.currentLine.asDTO()
      );
      await this.hub.sendAction(action);
      this.intervalId = null;
      this.currentLine = null;
    }
  }

  private async sendLineEdit() {
    if (this.currentLine !== null) {
      const mousePos = this.boardManager.getMousePosition();
      this.currentLine.updatePosition(mousePos);
      const action = this.actionFactory.create(
        ActionTypes.Edit,
        this.currentLine.asDTO()
      );
      await this.hub.sendAction(action);
    }
  }

  private async vertexMouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    await this.setInactive();
    const vertex = event.target as Vertex;
    const line = this.boardManager.startDrawingLine(vertex);
    if (line !== null) {
      this.currentLine = line;
      console.log(this.currentLine.asDTO());
      const action = this.actionFactory.create(
        ActionTypes.Add,
        this.currentLine.asDTO()
      );
      await this.hub.sendAction(action);
      this.intervalId = window.setInterval(
        async () => await this.sendLineEdit(),
        SentRequestInterval,
        this.currentLine
      );
    }
  }

  private async vertexMouseUp(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    const edge = this.boardManager.connectVertexes(vertex);
    if (edge !== undefined) {
      const action = this.actionFactory.create(ActionTypes.Add, edge.asDTO());
      await this.hub.sendAction(action);
    }
  }

  async mouseUp() {
    await this.setInactive();
  }
}
