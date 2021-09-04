import EdgeManager, { Edge } from "./EdgeManager";
import VertexManager, { Cordinates, Vertex } from "./VertexManager";
import { sortItems } from "../Utils/LayerUtils";
import PencilManager, { PencilLine } from "./PencilManager.js";
import Konva from "konva";

export default class BoardManager {
  edgeManager: EdgeManager;
  vertexManager: VertexManager;
  pencilManager: PencilManager;
  eventManager: any;
  store: any;
  constructor(store: any) {
    this.store = store;
    this.eventManager = null;
    this.edgeManager = new EdgeManager();
    this.vertexManager = new VertexManager();
    this.pencilManager = new PencilManager();
  }

  get currentLayer(): Konva.Layer {
    return this.store.state.currentLayer;
  }

  get layers(): Konva.Layer[] {
    return this.store.state.layers;
  }

  get stage(): Konva.Stage {
    return this.store.state.stage;
  }

  getMousePosition(): Cordinates {
    const cords = this.stage.getPointerPosition();
    if (cords === null)
      throw Error("Pointer positions is null but it wasnt expected");
    return cords;
  }

  update(attrs: Konva.NodeConfig) {
    const item = this.stage.findOne(`#${attrs.id}`); //konva uses id as selector so # is required
    item.setAttrs(attrs);
    this.stage.draw();
  }

  enableDrag() {
    this.vertexManager.enableDrag(this.layers);
  }

  setDraggableVertexById(vertexId: string, value: boolean) {
    this.vertexManager.setDraggableById(vertexId, value);
  }

  dragEdges(vertex: Vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  setHighlight(
    targetType: string,
    target: Vertex | Edge,
    isHighlithed: boolean,
    checkLayer = false
  ) {
    if (checkLayer && target.layer != this.currentLayer) return;
    if (targetType === "vertex")
      this.vertexManager.setHiglight(target as Vertex, isHighlithed);
    else if (targetType === "edge")
      this.edgeManager.setHiglight(target as Edge, isHighlithed);
  }

  createVertex(position: Cordinates, attrs?: Konva.CircleConfig) {
    const vertex = this.vertexManager.create(
      this.currentLayer,
      position,
      attrs
    );
    this.eventManager.bindVertexEvents(vertex);
    return vertex;
  }

  draw(konvaObject: Vertex | Edge | PencilLine) {
    sortItems(this.currentLayer);
    if (konvaObject instanceof Vertex) this.vertexManager.draw(konvaObject);
    else if (konvaObject instanceof Edge) this.edgeManager.draw(konvaObject);
    else if (konvaObject instanceof PencilLine)
      console.error(
        "Piotr popraw to bo nie ma jak teraz to zrobic, fajnie jakby tam tez byla metoda draw()"
      );
  }

  connectVertexes(vertex: Vertex) {
    if (this.currentLayer != vertex.layer) this.edgeManager.removeCurrentEdge();
    this.edgeManager.tryToConnectVertices(vertex);
  }

  startDrawingEdge(vertex: Vertex) {
    if (this.currentLayer != vertex.layer) return;
    this.edgeManager.startDrawing(vertex);
    this.eventManager.bindEdgeEvents(this.edgeManager.currentEdge);
    sortItems(this.currentLayer);
  }

  moveCurrentEdge(position: Cordinates) {
    this.edgeManager.redrawCurrentEdge(position);
  }

  stopDrawingEdge() {
    this.edgeManager.removeCurrentEdge();
  }

  startDraggingEdge(edge: Edge, pos: Cordinates) {
    this.edgeManager.startDraggingEdge(edge, pos);
  }

  dragEdge(pos: Cordinates) {
    this.edgeManager.dragVertexes(pos);
  }

  stopDraggingEdge() {
    this.edgeManager.stopDraggingEdge();
  }

  eraseVertex(vertex: Vertex) {
    if (this.currentLayer != vertex.layer) return;
    this.edgeManager.remove(vertex.edges);
    this.vertexManager.remove(vertex);
  }

  eraseVertexById(vertexId: string) {
    const vertex = this.vertexManager.getVertexById(vertexId);
    if (vertex) this.eraseVertex(vertex);
    else
      throw Error(
        "Attempt to remove vertex with ID " + vertexId + " which doesnt exists"
      );
  }

  eraseEdge(edge: Edge) {
    if (this.currentLayer != edge.layer) return;
    this.edgeManager.remove([edge]);
  }

  startPencil(position: Cordinates) {
    const pencilDrawing = this.pencilManager.create(
      position,
      this.currentLayer
    );
    this.eventManager.bindPencilEvents(pencilDrawing);
  }

  movePencil(position: Cordinates) {
    this.pencilManager.appendPoint(position);
  }

  finishPencilDrawing() {
    this.pencilManager.finishDrawing();
  }

  eraseDrawing(drawing: any) {
    this.pencilManager.removeDrawing(drawing);
  }

  selectLayer(layerId: string) {
    this.selectLayer(layerId);
  }

  receiveAddLayer(layerId: string) {
    const newLayer = new Konva.Layer({
      id: layerId,
    });
    this.store.commit("addLayer", newLayer);
  }

  setCurrentLayer(layerId: string) {
    const layer = this.layers.find(
      (layer: Konva.Layer) => layer.attrs.id === layerId
    );
    this.store.commit("setCurrentLayer", layer);
  }
}
