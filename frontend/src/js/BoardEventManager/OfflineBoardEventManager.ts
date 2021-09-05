import BaseBoardEventManager from "./BaseBoardEventManager";
import Konva from "konva";
import BoardManager from "../KonvaManager/BoardManager";
import { State } from "@/store";
import { Store } from "vuex";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  constructor(boardManager: BoardManager, store: Store<State>) {
    super(boardManager, store);
  }

  setSelectToolHandlers() {
    this.boardManager.enableDrag();
    this.mouseMove = () => {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.dragEdge(mousePos);
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
      const mousePos = this.boardManager.getMousePosition();
      if (mousePos !== null)
        this.boardManager.startDraggingEdge(event.target, mousePos);
    };
    this.edgeMouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
  }

  setVertexToolHandlers() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      if (mousePos !== null) {
        const vertex = this.boardManager.createVertex(mousePos);
        this.boardManager.draw(vertex);
      }
    };
  }

  setEdgeToolHandlers() {
    this.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      this.boardManager.startDrawingLine(vertex);
    };
    this.mouseMove = (event) => {
      const point = this.getPointFromEvent(event);
      this.boardManager.moveLineToPoint(point);
    };
    this.vertexMouseUp = (event) => {
      const vertex = event.target;
      this.boardManager.connectVertexes(vertex);
    };
    this.mouseUp = () => {
      this.boardManager.stopDrawingLine();
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
  }

  setPencilToolHandlers() {
    this.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.startPencil(mousePos);
    };
    this.mouseMove = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
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
