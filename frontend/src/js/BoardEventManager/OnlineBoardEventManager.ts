import { State } from "@/store";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { Vertex } from "../KonvaManager/VertexManager";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";
export default class OnlineBoardEventManager extends BaseBoardEventManager {
  actionFactory: ActionFactory;
  hub: BoardHub;
  constructor(
    boardManager: BoardManager,
    store: Store<State>,
    hub: BoardHub,
    actionFactory: ActionFactory
  ) {
    super(boardManager, store);
    this.actionFactory = actionFactory;
    this.hub = hub;
  }

  setSelectToolHandlers() {
    this.mouseMove = () => {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.mouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
    this.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target);
    };
    this.vertexMouseEnter = (event) => {
      const vertex = event.target;
      this.boardManager.setHighlight("vertex", vertex, true);
      const action = this.actionFactory.create(
        "RequestToEdit",
        event.target.attrs
      );
      this.hub.sendAction(action).then(() => sendVertexEdit(vertex));
    };
    this.vertexMouseLeave = (event) => {
      const vertex = event.target;
      this.boardManager.setHighlight("vertex", vertex, false);
      sendVertexEdit(vertex).then(() =>
        this.hub.sendAction(
          this.actionFactory.create("ReleaseItem", vertex.attrs)
        )
      );
      this.boardManager.setDraggableVertexById(vertex.attrs.id, false);
    };

    let intervalId: number | null = null;
    const sendVertexEdit = (vertex: Vertex) => {
      const action = this.actionFactory.create("Edit", vertex.attrs);
      return this.hub.sendAction(action);
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
    this.edgeMouseUp = () => {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.edgeMouseDown = () => {
      this.boardManager.stopDraggingEdge();
    };
  }

  setVertexToolHandlers() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      const vertex = this.boardManager.createVertex(mousePos);

      const action = this.actionFactory.create("Add", vertex.attrs);
      this.hub.sendAction(action);
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
      const edge = this.boardManager.connectVertexes(vertex);
      if (edge !== undefined) {
        const action = this.actionFactory.create("Add", {
          ...edge.attrs,
          type: "edge",
          v1: edge.v1.id(),
          v2: edge.v2.id(),
        });
        this.hub.sendAction(action);
      }
    };
    this.mouseUp = () => {
      this.boardManager.stopDrawingLine();
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
    this.hub.sendAction(this.actionFactory.create("Add", { type: "layer" }));
  }
}
