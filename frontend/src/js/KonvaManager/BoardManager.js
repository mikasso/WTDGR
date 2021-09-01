import EdgeManager, { Edge } from "./EdgeManager";
import VertexManager, { Vertex } from "./VertexManager";
import { sortItems } from "../Utils/LayerUtils";
import PencilManager from "./PencilManager.js";
import Konva from "konva";

export default class BoardManager {
  constructor(store) {
    this.store = store;
    this.eventManager = null;
    this.edgeManager = new EdgeManager();
    this.vertexManager = new VertexManager();
    this.pencilManager = new PencilManager();
  }

  get currentLayer() {
    return this.store.state.currentLayer;
  }

  get layers() {
    return this.store.state.layers;
  }

  get stage() {
    return this.store.state.stage;
  }

  update(attrs) {
    const item = this.stage.findOne(`#${attrs.id}`); //konva uses id as selector so # is required
    item.setAttrs(attrs);
    this.stage.draw();
  }

  enableDrag() {
    this.vertexManager.enableDrag(this.layers);
  }

  setDraggableVertexById(vertexId, value) {
    this.vertexManager.setDraggableById(vertexId, value);
  }

  dragEdges(vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  setHighlight(targetType, target, isHighlithed, checkLayer = false) {
    if (checkLayer && target.layer != this.currentLayer) return;
    if (targetType == "vertex")
      this.vertexManager.setHiglight(target, isHighlithed);
    else if (targetType == "edge")
      this.edgeManager.setHiglight(target, isHighlithed);
  }

  createVertex(position, attrs) {
    const vertex = this.vertexManager.create(
      this.currentLayer,
      position,
      attrs
    );
    this.eventManager.bindVertexEvents(vertex);
    return vertex;
  }

  draw(konvaObject) {
    sortItems(this.currentLayer);
    if (konvaObject instanceof Vertex) this.vertexManager.draw(konvaObject);
    else if (konvaObject instanceof Edge) this.edgeManager.draw(konvaObject);
    else if (konvaObject instanceof Konva.PencilLine)
      console.error(
        "Piotr popraw to bo nie ma jak teraz to zrobic, fajnie jakby tam tez byla metoda draw()"
      );
  }

  connectVertexes(vertex) {
    if (this.currentLayer != vertex.layer) this.edgeManager.removeCurrentEdge();
    this.edgeManager.tryToConnectVertices(vertex);
  }

  startDrawingEdge(vertex) {
    if (this.currentLayer != vertex.layer) return;
    this.edgeManager.startDrawing(vertex);
    this.eventManager.bindEdgeEvents(this.edgeManager.currentEdge);
    sortItems(this.currentLayer);
  }

  moveCurrentEdge(position) {
    this.edgeManager.redrawCurrentEdge(position);
  }

  stopDrawingEdge() {
    this.edgeManager.removeCurrentEdge();
  }

  startDraggingEdge(edge, pos) {
    this.edgeManager.startDraggingEdge(edge, pos);
  }

  dragEdge(pos) {
    this.edgeManager.dragVertexes(pos);
  }

  stopDraggingEdge() {
    this.edgeManager.stopDraggingEdge();
  }

  eraseVertex(vertex) {
    if (this.layerManager.currentLayer != vertex.layer) return;
    this.edgeManager.remove(vertex.edges);
    this.vertexManager.remove(vertex);
  }

  eraseVertexById(vertexId) {
    const vertex = this.vertexManager.getVertexById(vertexId);
    this.eraseVertex(vertex);
  }

  eraseEdge(edge) {
    if (this.layerManager.currentLayer != edge.layer) return;
    this.edgeManager.remove([edge]);
  }

  startPencil(position) {
    const pencilDrawing = this.pencilManager.create(
      position,
      this.layerManager.currentLayer
    );
    this.eventManager.bindPencilEvents(pencilDrawing);
  }

  movePencil(position) {
    this.pencilManager.appendPoint(position);
  }

  finishPencilDrawing() {
    this.pencilManager.finishDrawing();
  }

  eraseDrawing(drawing) {
    this.pencilManager.removeDrawing(drawing);
  }

  selectLayer(layerID) {
    this.layerManager.selectLayer(layerID);
  }

  receiveAddLayer(layerId) {
    const newLayer = new Konva.Layer({
      id: layerId,
    });
    this.store.commit("addLayer", newLayer);
  }

  setCurrentLayer(layerId) {
    const layer = this.layers.find((layer) => layer.attrs.id === layerId);
    this.store.commit("setCurrentLayer", layer);
  }
}
