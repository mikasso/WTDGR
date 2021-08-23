export default class BaseBoardEventManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
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
