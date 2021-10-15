import BoardManager from "@/js/KonvaManager/BoardManager";
import { TemporaryLine } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { ActionFactory } from "@/js/SignalR/Action";
import BoardHub from "@/js/SignalR/Hub";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { isLeftClick } from "../utils";

export default class OnlineEdgeToolHandler implements IHandler {
  intervalId: number | null = null;
  currentLine: TemporaryLine | null = null;
  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub
  ) {}

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.vertexMouseDown = (event) => this.vertexMouseDown(event);
    eventManager.vertexMouseUp = (event) => this.vertexMouseUp(event);
    eventManager.mouseUp = (event) => this.mouseUp();
  }

  public async setInactive() {
    if (this.intervalId !== null && this.currentLine !== null) {
      clearInterval(this.intervalId);
      const action = this.actionFactory.create(
        "Delete",
        this.currentLine.asDTO()
      );
      await this.hub.sendAction(action);
      this.intervalId = null;
      this.currentLine = null;
    }
  }

  private sendLineEdit() {
    if (this.currentLine !== null) {
      const mousePos = this.boardManager.getMousePosition();
      this.currentLine.updatePosition(mousePos);
      const action = this.actionFactory.create(
        "Edit",
        this.currentLine.asDTO()
      );
      return this.hub.sendAction(action);
    }
  }

  private vertexMouseDown(event: KonvaEventObject<any>) {
    if (!isLeftClick(event)) return;
    const vertex = event.target as Vertex;
    const line = this.boardManager.startDrawingLine(vertex);
    if (line !== null) {
      this.currentLine = line;
      console.log(this.currentLine.asDTO());
      const action = this.actionFactory.create("Add", this.currentLine.asDTO());
      this.hub.sendAction(action);
      this.intervalId = window.setInterval(
        () => this.sendLineEdit(),
        SentRequestInterval,
        this.currentLine
      );
    }
  }

  private async vertexMouseUp(event: KonvaEventObject<any>) {
    const vertex = event.target as Vertex;
    const edge = this.boardManager.connectVertexes(vertex);
    if (edge !== undefined) {
      const action = this.actionFactory.create("Add", edge.asDTO());
      this.hub.sendAction(action);
    }
  }

  async mouseUp() {
    await this.setInactive();
  }
}
