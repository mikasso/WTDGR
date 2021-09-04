import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import BoardManager from "../KonvaManager/BoardManager";
import { Edge } from "../KonvaManager/EdgeManager";
import { Vertex } from "../KonvaManager/VertexManager";

export default class BaseBoardEventManager {
  click!: (...params: any[]) => void;
  mouseMove!: (...params: any[]) => void;
  mouseDown!: (...params: any[]) => void;
  mouseUp!: (...params: any[]) => void;
  vertexMouseUp!: (...params: any[]) => void;
  vertexMouseDown!: (...params: any[]) => void;
  vertexMouseEnter!: (...params: any[]) => void;
  vertexMouseLeave!: (...params: any[]) => void;
  vertexDrag!: (...params: any[]) => void;
  vertexDragend!: (...params: any[]) => void;
  vertexDragstart!: (...params: any[]) => void;
  edgeClick!: (...params: any[]) => void;
  edgeMouseEnter!: (...params: any[]) => void;
  edgeMouseLeave!: (...params: any[]) => void;
  edgeMouseUp!: (...params: any[]) => void;
  edgeMouseDown!: (...params: any[]) => void;
  edgeMouseMove!: (...params: any[]) => void;
  pencilClick!: (...params: any[]) => void;
  boardManager: BoardManager;
  store: any;

  constructor(boardManager: BoardManager, store: any) {
    this.boardManager = boardManager;
    this.store = store;
    this.clearHandlers();
    this.bindStageEvents(boardManager.stage);
  }

  clearHandlers() {
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
    this.edgeMouseUp = () => {};
    this.edgeMouseDown = () => {};
    this.edgeMouseMove = () => {};
    this.pencilClick = () => {};
  }

  bindStageEvents(stage: Konva.Stage) {
    stage.on("click", (event) => this.click(event));
    stage.on("mousedown", (event) => this.mouseDown(event));
    stage.on("mouseup", (event) => this.mouseUp(event));
    stage.on("mousemove", (event) => this.mouseMove(event));
  }

  bindVertexEvents(vertex: Vertex) {
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
  bindEdgeEvents(edge: Edge) {
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
    edge.on("mousemove", (event) => {
      this.edgeMouseMove(event);
    });
    edge.on("mouseup", (event) => {
      this.edgeMouseUp(event);
    });
  }

  bindPencilEvents(pencil: any) {
    pencil.on("click", (event: any) => {
      this.pencilClick(event);
    });
  }

  toolChanged(toolName: string) {
    this.boardManager.vertexManager.disableDrag(this.store.state.layers);
    this.clearHandlers();
    switch (toolName) {
      case "Select":
        this.setSelectToolHandlers();
        break;
      case "Vertex":
        this.setVertexToolHandlers();
        break;
      case "Edge":
        this.setEdgeToolHandlers();
        break;
      case "Erase":
        this.setEraseToolHandlers();
        break;
      case "Pencil":
        this.setPencilToolHandlers();
        break;
    }
  }

  setSelectToolHandlers() {
    throw new Error("Not implemented");
  }
  setVertexToolHandlers() {
    throw new Error("Not implemented");
  }
  setEdgeToolHandlers() {
    throw new Error("Not implemented");
  }
  setEraseToolHandlers() {
    throw new Error("Not implemented");
  }
  setPencilToolHandlers() {
    throw new Error("Not implemented");
  }

  isLeftClick(event: { evt: { which: number } }) {
    return event.evt.which === 1;
  }

  isRightClick(event: { evt: { which: number } }) {
    return event.evt.which === 3;
  }

  getPointFromEvent(event: any) {
    return {
      x: event.evt.layerX,
      y: event.evt.layerY,
    };
  }
}
