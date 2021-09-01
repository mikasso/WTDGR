import BaseBoardEventManager from "./BaseBoardEventManager";
import Konva from "konva";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  constructor(boardManager, store) {
    super(boardManager, store);
  }

  setSelectToolHandlers() {
    this.boardManager.enableDrag();
    this.mouseMove = () => {
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.mouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
    this.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target);
    };
    this.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true);
    };
    this.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false);
    };
    this.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true);
    };
    this.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false);
    };
    this.edgeMouseDown = (event) => {
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.startDraggingEdge(event.target, mousePos);
    };
    this.edgeMouseMove = () => {
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.edgeMouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
  }

  setVertexToolHandlers() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      const vertex = this.boardManager.createVertex(mousePos);
      this.boardManager.draw(vertex);
    };
  }

  setEdgeToolHandlers() {
    this.mouseUp = () => {
      this.boardManager.stopDrawingEdge();
    };

    this.mouseMove = (event) => {
      const point = this.getPointFromEvent(event);
      this.boardManager.moveCurrentEdge(point);
    };

    this.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      this.boardManager.startDrawingEdge(vertex);
    };

    this.vertexMouseUp = (event) => {
      const vertex = event.target;
      this.boardManager.connectVertexes(vertex);
    };
  }

  setEraseToolHandlers() {
    this.vertexMouseDown = (event) => {
      const vertex = event.target;
      this.boardManager.eraseVertex(vertex);
    };

    this.edgeClick = (event) => {
      const edge = event.target;
      this.boardManager.eraseEdge(edge);
    };

    this.pencilClick = (event) => {
      const drawing = event.target;
      this.boardManager.eraseDrawing(drawing);
    };

    this.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true, true);
    };

    this.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false, true);
    };

    this.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true, true);
    };

    this.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false, true);
    };
  }

  setPencilToolHandlers() {
    this.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.startPencil(mousePos);
    };
    this.mouseMove = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.movePencil(mousePos);
    };
    this.mouseUp = () => {
      this.boardManager.finishPencilDrawing();
    };
  }

  addLayer() {
    const newLayer = new Konva.Layer({
      id: `Layer ${this.store.state.layers.length + 1}`,
    });
    this.store.commit("addLayer", newLayer);
    this.store.commit("setCurrentLayer", newLayer);
  }
}
