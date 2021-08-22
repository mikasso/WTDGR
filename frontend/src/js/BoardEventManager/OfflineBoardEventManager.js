import BaseBoardEventManager from "./BaseBoardEventManager";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  constructor(boardManager) {
    super(boardManager);
  }

  bindVertexEvents(vertex) {
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
  }

  bindEdgeEvents(edge) {
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

  bindPencilEvents(pencil) {
    pencil.on("click", (event) => {
      this.pencilClick(event);
    });
  }

  toolChanged(toolName) {
    this.boardManager.vertexManager.disableDrag(
      this.boardManager.layerManager.layers
    );
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

  toolbarButton(buttonName) {
    switch (buttonName) {
      case "Layer":
        this.boardManager.addLayer();
        break;
    }
  }

  toolbarSelect(selected) {
    switch (selected.type) {
      case "layer":
        this.boardManager.selectLayer(selected.value);
        break;
    }
  }
}
