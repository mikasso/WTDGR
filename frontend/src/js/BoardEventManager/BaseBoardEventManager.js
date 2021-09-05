export default class BaseBoardEventManager {
  constructor(boardManager, store) {
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

  bindStageEvents(stage) {
    stage.on("click", (event) => this.click(event));
    stage.on("mousedown", (event) => this.mouseDown(event));
    stage.on("mouseup", (event) => this.mouseUp(event));
    stage.on("mousemove", (event) => this.mouseMove(event));
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
    vertex.on("dragstart", (event) => {
      this.vertexDragstart(event);
    });
    vertex.on("dragend", (event) => {
      this.vertexDragend(event);
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
