import EdgeManager, { Edge } from "./EdgeManager";
import VertexManager, { Vertex } from "./VertexManager";
import LayerManager from "./LayerManager";
import PencilManager from "./PencilManager.js";
import Konva from "konva";

export default class BoardManager {
  constructor(parentComponent) {
    this.parentComponent = parentComponent;
    this.stage = new Konva.Stage(this.stageConfig);
    this.eventManager = null;
    this.layerManager = new LayerManager(this.stage, this.parentComponent);
    this.edgeManager = new EdgeManager();
    this.vertexManager = new VertexManager();
    this.pencilManager = new PencilManager();
  }

  stageConfig = {
    container: "board",
    width: window.innerWidth * 0.8,
    height: window.innerHeight * 0.92,
  };

  update(attrs) {
    const item = this.stage.findOne(`#${attrs.id}`); //konva uses id as selector so # is required
    item.setAttrs(attrs);
    this.stage.draw();
  }

  enableDrag() {
    this.vertexManager.enableDrag(this.layerManager.layers);
  }

  setDraggableVertexById(vertexId, value) {
    this.vertexManager.setDraggableById(vertexId, value);
  }

  dragEdges(vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  setHighlight(targetType, target, isHighlithed, checkLayer = false) {
    if (checkLayer && target.layer != this.layerManager.currentLayer) return;
    if (targetType == "vertex")
      this.vertexManager.setHiglight(target, isHighlithed);
    else if (targetType == "edge")
      this.edgeManager.setHiglight(target, isHighlithed);
  }

  createVertex(position, attrs) {
    const vertex = this.vertexManager.create(
      this.layerManager.currentLayer,
      position,
      attrs
    );
    this.eventManager.bindVertexEvents(vertex);
    return vertex;
  }

  draw(konvaObject) {
    this.layerManager.sortItems();
    if (konvaObject instanceof Vertex) this.vertexManager.draw(konvaObject);
    else if (konvaObject instanceof Edge) this.edgeManager.draw(konvaObject);
    else if (konvaObject instanceof Konva.PencilLine)
      console.error(
        "Piotr popraw to bo nie ma jak teraz to zrobic, fajnie jakby tam tez byla metoda draw()"
      );
  }

  connectVertexes(vertex) {
    if (this.layerManager.currentLayer != vertex.layer)
      this.edgeManager.removeCurrentEdge();
    this.edgeManager.tryToConnectVertices(vertex);
  }

  startDrawingEdge(vertex) {
    if (this.layerManager.currentLayer != vertex.layer) return;
    this.edgeManager.startDrawing(vertex);
    this.eventManager.bindEdgeEvents(this.edgeManager.currentEdge);
    this.layerManager.sortItems();
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

  addLayer() {
    this.layerManager.addLayer();
  }

  selectLayer(layerID) {
    this.layerManager.selectLayer(layerID);
  }

  getCurrentLayer() {
    return this.layerManager.currentLayer;
  }
}
