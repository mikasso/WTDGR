export default class BaseBoardEventManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
    this.clearHandlers();
    this.setSelectTool();
    this.bindStageEvents(boardManager.stage);
  }

  clearHandlers() {
    this.click = () => {};
    this.mouseMove = () => {};
    this.mouseDown = () => {};
    this.mouseUp = () => {};
    this.vertexMouseUp = () => {};
    this.vertexMouseDown = () => {};
    this.vertexDrag = () => {};
    this.edgeClick = () => {};
    this.pencilClick = () => {};
  }

  bindStageEvents(stage) {
    stage.on("click", (event) => this.click(event));
    stage.on("mousedown", (event) => this.mouseDown(event));
    stage.on("mouseup", (event) => this.mouseUp(event));
    stage.on("mousemove", (event) => this.mouseMove(event));
  }

  toolChanged(ToolName) {
    this.boardManager.vertexManager.disableDrag(
      this.boardManager.layerManager.layers
    );
    this.clearHandlers();
    switch (ToolName) {
      case "Select":
        this.setSelectTool();
        break;
      case "Vertex":
        this.setVertexTool();
        break;
      case "Edge":
        this.setEdgeTool();
        break;
      case "Erase":
        this.setEraseTool();
        break;
      case "Pencil":
        this.setPencilTool();
        break;
    }
  }

  setSelectTool() {
    throw new Error("Not implemented");
  }
  setVertexTool() {
    throw new Error("Not implemented");
  }
  setEdgeTool() {
    throw new Error("Not implemented");
  }
  setEraseTool() {
    throw new Error("Not implemented");
  }
  setPencilTool() {
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
