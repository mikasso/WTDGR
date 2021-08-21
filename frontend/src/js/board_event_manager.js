import BoardManager from "./board_manager";

export default class BoardEventManager {
  constructor(parentComponent) {
    this.boardManager = new BoardManager(parentComponent, this);
    this.handlers = null;
    this.clearHandlers();
    this.setSelectToolHandlers();
  }

  clearHandlers() {
    this.handlers = {
      click: () => {},
      mouseMove: () => {},
      mouseDown: () => {},
      mouseUp: () => {},
      vertexMouseUp: () => {},
      vertexMouseDown: () => {},
      vertexMouseEnter: () => {},
      vertexMouseLeave: () => {},
      vertexDrag: () => {},
      edgeClick: () => {},
      edgeMouseEnter: () => {},
      edgeMouseLeave: () => {},
      edgeDragStart: () => {},
      edgeDrag: () => {},
      edgeDragStop: () => {},
      pencilClick: () => {},
    };
  }

  bindStageEvents(stage) {
    stage.on("click", (event) => this.handlers.click(event));
    stage.on("mousedown", (event) => this.handlers.mouseDown(event));
    stage.on("mouseup", (event) => this.handlers.mouseUp(event));
    stage.on("mousemove", (event) => this.handlers.mouseMove(event));
  }

  bindVertexEvents(vertex) {
    vertex.on("mousedown", (event) => {
      this.handlers.vertexMouseDown(event);
    });
    vertex.on("mouseenter", (event) => {
      this.handlers.vertexMouseEnter(event);
    });
    vertex.on("mouseleave", (event) => {
      this.handlers.vertexMouseLeave(event);
    });
    vertex.on("mouseup", (event) => {
      this.handlers.vertexMouseUp(event);
    });
    vertex.on("dragmove", (event) => {
      this.handlers.vertexDrag(event);
    });
  }

  bindEdgeEvents(edge) {
    edge.on("click", (event) => {
      this.handlers.edgeClick(event);
    });
    edge.on("mouseenter", (event) => {
      this.handlers.edgeMouseEnter(event);
    });
    edge.on("mouseleave", (event) => {
      this.handlers.edgeMouseLeave(event);
    });
    edge.on("dragstart", (event) => {
      this.handlers.edgeDragStart(event);
    });
    edge.on("dragmove", (event) => {
      this.handlers.edgeDrag(event);
    });
    edge.on("dragstop", (event) => {
      this.handlers.edgeDrag(event);
    });
  }

  bindPencilEvents(pencil) {
    pencil.on("click", (event) => {
      this.handlers.pencilClick(event);
    });
  }

  toolChanged(toolName) {
    this.boardManager.disableDrag();
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
    this.handlers.mouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
    this.handlers.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target);
    };
    this.handlers.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true);
    };
    this.handlers.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false);
    };
    this.handlers.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true);
    };
    this.handlers.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false);
    };
    this.handlers.edgeDragStart = (event) => {
      this.boardManager.startDraggingEdge(event.target);
    };
    this.handlers.edgeDrag = () => {
      this.boardManager.dragEdge();
    };
    this.handlers.edgeDragStop = () => {
      this.boardManager.stopDraggingEdge();
    };
  }

  setVertexToolHandlers() {
    this.handlers.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.createVertex(mousePos);
    };
  }

  setEdgeToolHandlers() {
    this.handlers.mouseUp = () => {
      this.boardManager.stopDrawingEdge();
    };

    this.handlers.mouseMove = (event) => {
      const point = this.getPointFromEvent(event);
      this.boardManager.moveCurrentEdge(point);
    };

    this.handlers.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      this.boardManager.startDrawingEdge(vertex);
    };

    this.handlers.vertexMouseUp = (event) => {
      const vertex = event.target;
      this.boardManager.connectVertexes(vertex);
    };

    this.handlers.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true);
    };

    this.handlers.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false);
    };
  }

  setEraseToolHandlers() {
    this.handlers.vertexMouseDown = (event) => {
      const vertex = event.target;
      this.boardManager.eraseVertex(vertex);
    };

    this.handlers.edgeClick = (event) => {
      const edge = event.target;
      this.boardManager.eraseEdge(edge);
    };

    this.handlers.pencilClick = (event) => {
      const drawing = event.target;
      this.boardManager.eraseDrawing(drawing);
    };

    this.handlers.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true, true);
    };

    this.handlers.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false, true);
    };

    this.handlers.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true, true);
    };

    this.handlers.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false, true);
    };
  }

  setPencilToolHandlers() {
    this.handlers.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.startPencil(mousePos);
    };
    this.handlers.mouseMove = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      this.boardManager.movePencil(mousePos);
    };
    this.handlers.mouseUp = () => {
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

  isLeftClick(event) {
    return event.evt.which === 1;
  }

  isRightClick(event) {
    return event.evt.which === 3;
  }

  getPointFromEvent(event) {
    return {
      x: event.evt.layerX,
      y: event.evt.layerY,
    };
  }
}
