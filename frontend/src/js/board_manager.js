import EdgeManager, { Edge } from "./Shapes/edge_manager";
import VertexManager, { Vertex } from "./Shapes/vertex_manager";
import LayerManager from "./layer_manager";
import PencilManager from "./Shapes/pencil_manager.js";
import Konva from "konva";

export default class BoardManager {
  constructor(parentComponent) {
    this.parentComponent = parentComponent;
    this.stage = new Konva.Stage(this.stageConfig);
    this.boardEventManager = null;
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
    const item = this.stage.findOne(`#${attrs.id}`);
    item.setAttrs(attrs);
  }
  //select functions
  enableDrag() {
    this.vertexManager.enableDrag(this.layerManager.layers);
  }

  dragEdges(vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  //vertex functions
  createVertex(position, attrs) {
    const vertex = this.vertexManager.create(
      this.layerManager.currentLayer,
      position,
      attrs
    );
    this.boardEventManager.bindVertexEvents(vertex);
    return vertex;
  }

  draw(konvaObject) {
    this.layerManager.sortItems();
    if (konvaObject instanceof Vertex) this.vertexManager.draw(konvaObject);
    else if (konvaObject instanceof Edge) this.edgeManager.draw(konvaObject);
    else if (konvaObject instanceof Konva.PencilLine)
      console.error("Piotr popraw to bo ni chuja jak teraz mozna to zrobic");
  }

  //edge functions
  startDrawingEdge(vertex) {
    if (this.layerManager.currentLayer != vertex.layer) return;
    this.edgeManager.startDrawing(vertex);
    this.boardEventManager.bindEdgeEvents(this.edgeManager.currentEdge);
    this.layerManager.sortItems();
  }

  moveCurrentEdge(position) {
    this.edgeManager.redrawCurrentEdge(position);
  }

  stopDrawingEdge() {
    this.edgeManager.removeCurrentEdge();
  }

  connectVertexes(vertex) {
    if (this.layerManager.currentLayer != vertex.layer)
      this.edgeManager.removeCurrentEdge();
    this.edgeManager.tryToConnectVertices(vertex);
  }

  //erase functions
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

  //pencil functions
  startPencil(position) {
    const pencilDrawing = this.pencilManager.create(
      position,
      this.layerManager.currentLayer
    );
    this.boardEventManager.bindPencilEvents(pencilDrawing);
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
}
