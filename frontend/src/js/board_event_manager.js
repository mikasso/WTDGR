export default class BoardEventManager {
  constructor(boardManager, actionFactory, isOffline) {
    this.boardManager = boardManager;
    this.actionFactory = actionFactory;
    this.hub = null;
    this.clearHandlers();
    this.setSelectToo();
    this.isOffline = isOffline;
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

  bindVertexEvents(vertex) {
    vertex.on("mousedown", (event) => {
      this.vertexMouseDown(event);
    });
    vertex.on("mouseup", (event) => {
      this.vertexMouseUp(event);
    });
    vertex.on("dragmove", (event) => {
      this.vertexDrag(event);
    });

    vertex.on("dragend", (event) => {
      this.vertexDrag(event);
      if (!this.isOffline) {
        const action = this.actionFactory.create("Edit", event.target.attrs);
        this.hub.sendAction(action);
      }
    });
  }

  bindEdgeEvents(edge) {
    edge.on("click", (event) => {
      this.edgeClick(event);
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
        this.setSelectToo();
        break;
      case "Vertex":
        this.setVertexToo();
        break;
      case "Edge":
        this.setEdgeToo();
        break;
      case "Erase":
        this.setEraseToo();
        break;
      case "Pencil":
        this.setPencilToo();
        break;
    }
  }

  setSelectToo() {
    this.boardManager.enableDrag();
    this.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target);
    };
  }

  setVertexToo() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.stage.getPointerPosition();
      const vertex = this.boardManager.createVertex(mousePos);
      if (this.isOffline) {
        this.boardManager.draw(vertex);
      } else {
        const action = this.actionFactory.create("Add", vertex.attrs);
        this.hub.sendAction(action);
      }
    };
  }

  setEdgeToo() {
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

  setEraseToo() {
    this.vertexMouseDown = (event) => {
      const vertex = event.target;
      if (this.isOffline) {
        this.boardManager.eraseVertex(vertex);
      } else {
        const action = this.actionFactory.create("Delete", vertex.attrs);
        this.hub.sendAction(action);
      }
    };

    this.edgeClick = (event) => {
      const edge = event.target;
      this.boardManager.eraseEdge(edge);
    };

    this.pencilClick = (event) => {
      const drawing = event.target;
      this.boardManager.eraseDrawing(drawing);
    };
  }

  setPencilToo() {
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
