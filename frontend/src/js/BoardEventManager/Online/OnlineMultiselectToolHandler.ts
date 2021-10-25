import BoardManager from "@/js/KonvaManager/BoardManager";
import { Edge } from "@/js/KonvaManager/EdgeManager";
import { Vertex } from "@/js/KonvaManager/VertexManager";
import { KonvaEventObject } from "konva/types/Node";
import BaseBoardEventManager from "../BaseBoardEventManager";
import { IHandler } from "../IHandler";
import { isLeftClick, poll } from "../utils";
import { ActionFactory } from "@/js/SignalR/Action";
import BoardHub from "@/js/SignalR/Hub";
import { ActionTypes } from "@/js/SignalR/ApiHandler";
import { SentRequestInterval } from "../OnlineBoardEventManager";
import { ItemColors } from "../utils";

export default class OnlineMultiselectToolHandler implements IHandler {
  intervalId: number | null = null;
  vertexesDTO: any[] = [];
  private readonly MaxAttempts = 3;
  private readonly PollingTime = 100;
  constructor(
    private boardManager: BoardManager,
    private actionFactory: ActionFactory,
    private hub: BoardHub,
    private offlineHighlighter: IHandler
  ) {}

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.multiselectMouseDown = (event) =>
      this.multiselectMouseDown(event);
    this.vertexesDTO = [];
  }
  public setInactive(): void {
    this.offlineHighlighter.setInactive();
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    this.releaseVertexes();
    this.intervalId = null;
    this.boardManager.setHighlightOfSelected(false);
    this.boardManager.multiselectManager.stopDrag();
    this.boardManager.multiselectManager.isDrawing = false;
    this.boardManager.multiselectManager.removeSelect();
  }

  private mouseDown(event: KonvaEventObject<any>) {
    if (this.boardManager.multiselectManager.isDragging) return;
    if (!isLeftClick(event)) return;
    this.releaseVertexes();
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.startMultiselect(mousePos);
    this.updateDraw();
  }

  private releaseVertexes() {
    if (this.vertexesDTO.length > 0) {
      for (const vertex of this.vertexesDTO) {
        vertex.stroke = ItemColors.defaultStroke;
      }
      this.hub.sendAction(
        this.actionFactory.create(ActionTypes.ReleaseItem, this.vertexesDTO)
      );
      this.vertexesDTO = [];
    }
  }

  private async updateDraw() {
    while (this.boardManager.multiselectManager.isDrawing) {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.moveMultiselect(mousePos);
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
    }
  }

  private mouseUp(event: KonvaEventObject<Vertex>) {
    if (this.boardManager.multiselectManager.isDragging) {
      this.boardManager.multiselectManager.stopDrag();
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }
      this.intervalId = null;
    } else {
      this.boardManager.finishMultiselect();
      const selectedVertexes = this.boardManager.multiselectManager
        .selectedVertexes;
      if (selectedVertexes.length == 0) return;
      this.vertexesDTO = [];
      for (const vertex of selectedVertexes) {
        vertex.setAttrs({
          stroke: this.hub.userColor(),
        });
        this.vertexesDTO.push(vertex.asDTO());
      }
      const action = this.actionFactory.create(
        ActionTypes.RequestToEdit,
        this.vertexesDTO
      );
      this.hub.sendAction(action);
    }
  }

  private sendVertexesEdit() {
    const mousePos = this.boardManager.getMousePosition();
    this.vertexesDTO = this.boardManager.multiselectManager.updatedSelectedPosAsDto(
      mousePos,
      this.hub.userColor()
    );
    this.boardManager.multiselectManager.moveDrawing(mousePos);

    const action = this.actionFactory.create(
      ActionTypes.Edit,
      this.vertexesDTO
    );
    return this.hub.sendAction(action);
  }

  private async multiselectMouseDown(event: KonvaEventObject<Vertex>) {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.startDrag(mousePos);

    await poll({
      fn: () => {
        if (this.intervalId !== null) {
          clearInterval(this.intervalId);
        }
        this.intervalId = window.setInterval(
          () => this.sendVertexesEdit(),
          SentRequestInterval
        );
        return true;
      },
      interval: this.PollingTime,
      maxAttempts: this.MaxAttempts,
      validate: (x) => x,
    });
  }
}
