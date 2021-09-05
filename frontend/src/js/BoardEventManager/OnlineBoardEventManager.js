import BaseBoardEventManager from "./BaseBoardEventManager";
export default class OnlineBoardEventManager extends BaseBoardEventManager {
  constructor(boardManager, store, hub, actionFactory) {
    super(boardManager, store);
    this.actionFactory = actionFactory;
    this.hub = hub;
  }

  setSelectToolHandlers() {
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
      const action = this.actionFactory.create(
        "RequestToEdit",
        event.target.attrs
      );
      this.hub.sendAction(action);
    };
    this.vertexMouseLeave = (event) => {
      const vertex = event.target;
      this.boardManager.setHighlight("vertex", vertex, false);
      this.hub.sendAction(
        this.actionFactory.create("ReleaseItem", vertex.attrs)
      );
      this.boardManager.setDraggableVertexById(vertex.attrs.id, false);
    };

    let intervalId;
    const sendVertexEdit = (vertex) => {
      const action = this.actionFactory.create("Edit", vertex.attrs);
      this.hub.sendAction(action);
    };
    this.vertexDragend = (event) => {
      const vertex = event.target;
      if (intervalId !== null) clearInterval(intervalId);
      intervalId = null;
      sendVertexEdit(vertex);
    };
    this.vertexDragstart = (event) => {
      const vertex = event.target;
      console.log(
        "vertex mouse down " + vertex.attrs.draggable + vertex.attrs.id
      );
      if (vertex.attrs.draggable)
        intervalId = setInterval(sendVertexEdit, 33, vertex);
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

      const action = this.actionFactory.create("Add", vertex.attrs);
      this.hub.sendAction(action);
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
      const action = this.actionFactory.create("Delete", vertex.attrs);
      this.hub.sendAction(action);
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
    this.hub.sendAction(this.actionFactory.create("Add", { type: "layer" }));
  }
}
