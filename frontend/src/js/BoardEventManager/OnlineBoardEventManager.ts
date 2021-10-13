import { store } from "@/store";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";

const SentRequestInterval = 20;

export default class OnlineBoardEventManager extends BaseBoardEventManager {
  setSelectToolHandlers(): void {
    throw new Error("Method not implemented.");
  }
  setVertexToolHandlers(): void {
    throw new Error("Method not implemented.");
  }
  setEdgeToolHandlers(): void {
    throw new Error("Method not implemented.");
  }
  setEraseToolHandlers(): void {
    throw new Error("Method not implemented.");
  }
  setPencilToolHandlers(): void {
    throw new Error("Method not implemented.");
  }
  addLayer(): void {
    throw new Error("Method not implemented.");
  }
  removeLayer(layerId: string): void {
    throw new Error("Method not implemented.");
  }
  reorderLayers(index1: number, index2: number): void {
    throw new Error("Method not implemented.");
  }
  actionFactory: ActionFactory;
  hub: BoardHub;
  constructor(hub: BoardHub) {
    super(store);
    this.actionFactory = new ActionFactory(store.state.user.userId);
    this.hub = hub;
  }

  // setSelectToolHandlers() {
  //   this.mouseMove = () => {
  //     const mousePos = this.boardManager.getMousePosition();
  //     this.boardManager.dragEdge(mousePos);
  //   };
  //   this.mouseUp = () => {
  //     this.boardManager.stopDraggingEdge();
  //   };
  //   this.vertexDrag = (event) => {
  //     this.boardManager.dragEdges(event.target);
  //   };
  //   this.vertexMouseEnter = (event) => {
  //     const vertex = event.target;
  //     this.boardManager.setHighlight("vertex", vertex, true);
  //     const action = this.actionFactory.create(
  //       "RequestToEdit",
  //       event.target.attrs
  //     );
  //     this.hub.sendAction(action).then(() => sendVertexEdit(vertex));
  //   };
  //   this.vertexMouseLeave = (event) => {
  //     const vertex = event.target;
  //     this.boardManager.setHighlight("vertex", vertex, false);
  //     sendVertexEdit(vertex).then(() =>
  //       this.hub.sendAction(
  //         this.actionFactory.create("ReleaseItem", vertex.attrs)
  //       )
  //     );
  //     this.boardManager.setDraggableVertexById(vertex.attrs.id, false);
  //   };

  //   let intervalId: number | null = null;
  //   const sendVertexEdit = (vertex: Vertex) => {
  //     const action = this.actionFactory.create("Edit", vertex.attrs);
  //     return this.hub.sendAction(action);
  //   };
  //   this.vertexDragend = (event) => {
  //     const vertex = event.target;
  //     if (intervalId !== null) clearInterval(intervalId);
  //     intervalId = null;
  //     sendVertexEdit(vertex);
  //   };
  //   this.vertexDragstart = (event) => {
  //     const vertex = event.target;
  //     console.log(
  //       "vertex mouse down " + vertex.attrs.draggable + vertex.attrs.id
  //     );
  //     if (vertex.attrs.draggable)
  //       intervalId = setInterval(sendVertexEdit, SentRequestInterval, vertex);
  //   };

  //   this.edgeMouseEnter = (event) => {
  //     this.boardManager.setHighlight("edge", event.target, true);
  //   };
  //   this.edgeMouseLeave = (event) => {
  //     this.boardManager.setHighlight("edge", event.target, false);
  //   };
  //   this.edgeMouseUp = () => {
  //     const mousePos = this.boardManager.getMousePosition();
  //     this.boardManager.dragEdge(mousePos);
  //   };
  //   this.edgeMouseDown = () => {
  //     this.boardManager.stopDraggingEdge();
  //   };
  // }

  // setVertexToolHandlers() {
  //   this.click = (event) => {
  //     if (!this.isLeftClick(event)) return;
  //     const mousePos = this.boardManager.getMousePosition();
  //     const vertex = this.boardManager.createVertex(mousePos);

  //     const action = this.actionFactory.create("Add", vertex.attrs);
  //     this.hub.sendAction(action);
  //   };
  // }

  // setEdgeToolHandlers() {
  //   let intervalId: number | null = null;
  //   let currentLine: TemporaryLine | null = null;
  //   const sendLineEdit = (line: TemporaryLine) => {
  //     if (line !== null) {
  //       const mousePos = this.boardManager.getMousePosition();
  //       line.updatePosition(mousePos);
  //       const action = this.actionFactory.create("Edit", line.asDTO());
  //       return this.hub.sendAction(action);
  //     }
  //   };
  //   const stopSendLineEdit = async () => {
  //     if (intervalId !== null && currentLine !== null) {
  //       clearInterval(intervalId);
  //       const action = this.actionFactory.create("Delete", currentLine.asDTO());
  //       await this.hub.sendAction(action);
  //       intervalId = null;
  //       currentLine = null;
  //     }
  //   };

  //   this.vertexMouseDown = (event) => {
  //     if (!this.isLeftClick(event)) return;
  //     const vertex = event.target;
  //     const line = this.boardManager.startDrawingLine(vertex);
  //     if (line !== null) {
  //       currentLine = line;
  //       console.log(currentLine.asDTO());
  //       const action = this.actionFactory.create("Add", currentLine.asDTO());
  //       this.hub.sendAction(action);
  //       intervalId = setInterval(
  //         sendLineEdit,
  //         SentRequestInterval,
  //         currentLine
  //       );
  //     }
  //   };
  //   this.mouseMove = (event) => {
  //     // const point = this.getPointFromEvent(event);
  //     // this.boardManager.moveLineToPoint(point);
  //   };
  //   this.vertexMouseUp = async (event) => {
  //     const vertex = event.target;
  //     const edge = this.boardManager.connectVertexes(vertex);
  //     if (edge !== undefined) {
  //       const action = this.actionFactory.create("Add", edge.asDTO());
  //       this.hub.sendAction(action);
  //     }
  //   };
  //   this.mouseUp = async () => {
  //     await stopSendLineEdit();
  //   };
  // }

  // setEraseToolHandlers() {
  //   this.vertexMouseDown = (event) => {
  //     const vertex = event.target;
  //     const action = this.actionFactory.create("Delete", vertex.attrs);
  //     this.hub.sendAction(action);
  //   };

  //   this.edgeClick = (event) => {
  //     const edge = event.target;
  //     const action = this.actionFactory.create("Delete", edge.attrs);
  //     this.hub.sendAction(action);
  //   };

  //   this.pencilClick = (event) => {
  //     const drawing = event.target;
  //     this.boardManager.eraseDrawing(drawing);
  //   };

  //   this.vertexMouseEnter = (event) => {
  //     this.boardManager.setHighlight("vertex", event.target, true);
  //   };

  //   this.vertexMouseLeave = (event) => {
  //     this.boardManager.setHighlight("vertex", event.target, false);
  //   };

  //   this.edgeMouseEnter = (event) => {
  //     this.boardManager.setHighlight("edge", event.target, true);
  //   };

  //   this.edgeMouseLeave = (event) => {
  //     this.boardManager.setHighlight("edge", event.target, false);
  //   };
  // }

  // setPencilToolHandlers() {
  //   this.mouseDown = (event) => {
  //     if (!this.isLeftClick(event)) return;
  //     const mousePos = this.boardManager.getMousePosition();
  //     this.boardManager.startPencil(mousePos);
  //   };
  //   this.mouseMove = (event) => {
  //     if (!this.isLeftClick(event)) return;
  //     const mousePos = this.boardManager.getMousePosition();
  //     this.boardManager.movePencil(mousePos);
  //   };
  //   this.mouseUp = () => {
  //     this.boardManager.finishPencilDrawing();
  //   };
  // }

  // addLayer() {
  //   this.hub.sendAction(this.actionFactory.create("Add", { type: "layer" }));
  // }

  // reorderLayers(index1: number, index2: number) {
  //   const stageLayers = this.store.state.stage!.getLayers();
  //   const layer1 = stageLayers[index1];
  //   const layer2 = stageLayers[index2];
  //   this.hub.sendAction(
  //     this.actionFactory.create("Edit", {
  //       type: "layer",
  //       id: layer1.id(),
  //       ReplaceWithId: layer2.id(),
  //     })
  //   );
  // }

  // removeLayer(layerId: string) {
  //   const action = this.actionFactory.create("Delete", {
  //     type: "layer",
  //     id: layerId,
  //   });
  //   this.hub.sendAction(action);
  // }
}
