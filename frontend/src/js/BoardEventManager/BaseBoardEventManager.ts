import { State } from "@/store";
import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import { Shape } from "konva/types/Shape";
import { CircleConfig } from "konva/types/shapes/Circle";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Edge } from "../KonvaManager/EdgeManager";
import { PencilLine } from "../KonvaManager/PencilManager";
import { Vertex } from "../KonvaManager/VertexManager";
import { IHandler } from "./IHandler";

interface IEventBinder {
  bindItem(item: Shape<CircleConfig>): void;
}
export default abstract class BaseBoardEventManager implements IEventBinder {
  click!: (event: KonvaEventObject<any>) => void;
  mouseMove!: (event: KonvaEventObject<any>) => void;
  mouseDown!: (event: KonvaEventObject<any>) => void;
  mouseUp!: (event: KonvaEventObject<any>) => void;
  vertexMouseUp!: (event: KonvaEventObject<any>) => void;
  vertexMouseDown!: (event: KonvaEventObject<any>) => void;
  vertexMouseEnter!: (event: KonvaEventObject<any>) => void;
  vertexMouseLeave!: (event: KonvaEventObject<any>) => void;
  vertexDrag!: (event: KonvaEventObject<any>) => void;
  vertexDragend!: (event: KonvaEventObject<any>) => void;
  vertexDragstart!: (event: KonvaEventObject<any>) => void;
  edgeClick!: (event: KonvaEventObject<any>) => void;
  edgeMouseEnter!: (event: KonvaEventObject<any>) => void;
  edgeMouseLeave!: (event: KonvaEventObject<any>) => void;
  edgeMouseDown!: (event: KonvaEventObject<any>) => void;
  edgeMouseUp!: (event: KonvaEventObject<any>) => void;
  pencilClick!: (event: KonvaEventObject<any>) => void;

  boardManager: BoardManager;
  store: Store<State>;
  handlers: IHandler[];

  constructor(boardManager: BoardManager, store: Store<State>) {
    this.boardManager = boardManager;
    this.boardManager.eventManager = this;
    this.store = store;
    this.clearHandlers();
    this.bindStageEvents(boardManager.stage);
    this.handlers = [];
  }

  public bindItem(item: Shape<CircleConfig>): void {
    switch (item.getClassName()) {
      case ClassNames.Vertex:
        this.bindVertexEvents(item as Vertex);
        break;
      case ClassNames.Edge:
        this.bindEdgeEvents(item as Edge);
        break;
      case ClassNames.PencilLine:
        this.bindPencilEvents(item as PencilLine);
        break;
      default:
        throw new Error(
          `Cannot bind this item. Konva ClassName: ${item.getClassName()}`
        );
    }
  }

  public abstract toolChanged(toolName: string): void;
  /**
   * @deprecated Move to layer handler
   */
  abstract addLayer(): void;
  /**
   * @deprecated Move to layer handler
   */
  abstract removeLayer(layerId: string): void;

  /**
   * @deprecated Move to layer handler
   */
  abstract reorderLayers(index1: number, index2: number): void;
  /**
   * @deprecated Move to layer handler
   */
  highlightLayer(layerId: string, on: boolean) {
    this.boardManager.highlightLayer(layerId, on);
  }

  protected clearHandlers() {
    this.click = () => {};
    this.mouseMove = () => {};
    this.mouseDown = () => {};
    this.mouseUp = () => {};
    this.vertexMouseUp = () => {};
    this.vertexMouseDown = () => {};
    this.vertexMouseEnter = () => {};
    this.vertexMouseLeave = () => {};
    this.vertexDrag = () => {};
    this.vertexDragend = () => {};
    this.vertexDragstart = () => {};
    this.edgeClick = () => {};
    this.edgeMouseEnter = () => {};
    this.edgeMouseLeave = () => {};
    this.edgeMouseDown = () => {};
    this.edgeMouseUp = () => {};
    this.pencilClick = () => {};
  }

  private bindStageEvents(stage: Konva.Stage) {
    stage.on("click", (event) => this.click(event));
    stage.on("mousedown", (event) => this.mouseDown(event));
    stage.on("mouseup", (event) => this.mouseUp(event));
    stage.on("mousemove", (event) => this.mouseMove(event));
  }

  private bindVertexEvents(vertex: Vertex) {
    vertex.on("mousedown", (event) => {
      this.vertexMouseDown(event);
    });
    vertex.on("mouseenter", (event) => {
      this.vertexMouseEnter(event);
    });
    vertex.on("mouseleave", (event) => {
      this.vertexMouseLeave(event);
    });
    vertex.on("mouseup", (event) => {
      this.vertexMouseUp(event);
    });
    vertex.on("dragmove", (event) => {
      this.vertexDrag(event);
    });
    vertex.on("dragstart", (event) => {
      this.vertexDragstart(event);
    });
    vertex.on("dragend", (event) => {
      this.vertexDragend(event);
    });
  }

  private bindEdgeEvents(edge: Edge) {
    edge.on("click", (event) => {
      this.edgeClick(event);
    });
    edge.on("mouseenter", (event) => {
      this.edgeMouseEnter(event);
    });
    edge.on("mouseleave", (event) => {
      this.edgeMouseLeave(event);
    });
    edge.on("mousedown", (event) => {
      this.edgeMouseDown(event);
    });

    edge.on("mouseup", (event) => {
      this.edgeMouseUp(event);
    });
  }

  private bindPencilEvents(pencil: PencilLine) {
    pencil.on("click", (event: any) => {
      this.pencilClick(event);
    });
  }
}
