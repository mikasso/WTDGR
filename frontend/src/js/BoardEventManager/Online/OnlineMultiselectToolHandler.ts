import BoardManager from "@/js/KonvaManager/BoardManager";
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
import { getUserColor } from "@/js/SignalR/User";
export default class OnlineMultiselectToolHandler implements IHandler {
  dragInterval: number | null = null;
  drawUpdateInterval: number | null = null;
  vertexesDTO: any[] = [];
  private readonly MaxAttempts = 3;
  private readonly PollingTime = 100;
  private readonly DrawTime = 30;
  private boardManager: BoardManager;
  constructor(private actionFactory: ActionFactory, private hub: BoardHub) {
    this.boardManager = BoardManager.getBoardManager();
  }

  public setActive(eventManager: BaseBoardEventManager): void {
    eventManager.mouseDown = (event) => this.mouseDown(event);
    eventManager.mouseUp = (event) => this.mouseUp(event);
    eventManager.multiselectMouseDown = (event) =>
      this.multiselectMouseDown(event);
    this.vertexesDTO = [];
  }
  public setInactive(): void {
    if (this.dragInterval != null) clearInterval(this.dragInterval);
    if (this.drawUpdateInterval != null) clearInterval(this.drawUpdateInterval);
    this.releaseVertexes();
    this.dragInterval = null;
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
    this.drawUpdateInterval = window.setInterval(
      () => this.updateDraw(),
      this.DrawTime
    );
  }

  private async updateDraw() {
    const mousePos = this.boardManager.getMousePosition();
    this.boardManager.multiselectManager.appendPoint(mousePos);
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

  private mouseUp(event: KonvaEventObject<Vertex>) {
    if (this.boardManager.multiselectManager.isDragging) {
      this.boardManager.multiselectManager.stopDrag();
      if (this.dragInterval !== null) {
        clearInterval(this.dragInterval);
      }
      this.dragInterval = null;
    } else {
      if (this.drawUpdateInterval != null)
        clearInterval(this.drawUpdateInterval);
      this.drawUpdateInterval = null;
      this.boardManager.finishMultiselect();
      const selectedVertexes =
        this.boardManager.multiselectManager.selectedVertexes;
      if (selectedVertexes.length == 0) return;
      this.vertexesDTO = [];
      for (const vertex of selectedVertexes) {
        vertex.setAttrs({
          stroke: getUserColor(),
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
    this.vertexesDTO =
      this.boardManager.multiselectManager.updatedSelectedPosAsDto(
        mousePos,
        getUserColor()
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
        const areAllVertexEditable =
          this.boardManager.multiselectManager.selectedVertexes.every(
            (x) => x.followMousePointer
          );

        if (areAllVertexEditable) {
          if (this.dragInterval !== null) {
            clearInterval(this.dragInterval);
          }
          this.dragInterval = window.setInterval(
            () => this.sendVertexesEdit(),
            SentRequestInterval * 1.1
          );
          return true;
        }
        return false;
      },
      interval: this.PollingTime,
      maxAttempts: this.MaxAttempts,
      validate: (x) => x,
    });
  }
}
