import EdgeManager, { Edge } from "./EdgeManager";
import VertexManager, { Cordinates, Vertex } from "./VertexManager";
import { sortItems } from "../Utils/LayerUtils";
import PencilManager, { PencilLine } from "./PencilManager";
import Konva from "konva";
import BaseBoardEventManager from "../BoardEventManager/BaseBoardEventManager";
import { Store } from "vuex";
import { State } from "@/store";
import { NodeConfig } from "konva/types/Node";

export default class BoardManager {
  edgeManager: EdgeManager;
  vertexManager: VertexManager;
  pencilManager: PencilManager;
  eventManager!: BaseBoardEventManager;

  store: Store<State>;
  constructor(store: Store<State>) {
    this.store = store;
    this.edgeManager = new EdgeManager();
    this.vertexManager = new VertexManager();
    this.pencilManager = new PencilManager();
  }

  get currentLayer(): Konva.Layer {
    const layer = this.store.state.currentLayer;
    if (layer) return layer;
    else throw Error("Attempt to get layer when it is undefined");
  }

  get layers(): Konva.Layer[] {
    return this.store.state.layers;
  }

  get stage(): Konva.Stage {
    const stage = this.store.state.stage;
    if (stage) return stage;
    else throw Error("Attempt to get stage when it is undefined");
  }

  findById(id: string | undefined) {
    return this.stage.findOne(`#${id}`); //konva uses id as selector so # is required
  }

  getMousePosition(): Cordinates {
    const cords = this.stage.getPointerPosition();
    if (cords === null)
      throw Error("Pointer positions is null but it wasnt expected");
    return cords;
  }

  update(attrs: Konva.NodeConfig) {
    const item = this.findById(attrs.id); //konva uses id as selector so # is required
    item.setAttrs(attrs);
    this.stage.draw();
  }

  enableDrag() {
    this.vertexManager.enableDrag(this.layers);
    //this.edgeManager.enableDrag(this.layers);
  }

  setDraggableVertexById(vertexId: string, value: boolean) {
    const vertex = this.findById(vertexId);
    if (vertex) this.vertexManager.setDraggable(vertex, value);
  }

  dragEdges(vertex: Vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  setHighlight(
    targetType: string,
    target: Vertex | Edge,
    isHighlithed: boolean
  ) {
    if (target.layer.id !== this.currentLayer.id) return;
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
      this.pencilManager.draw(konvaObject);
  }

  connectVertexes(vertex: Vertex) {
    if (this.currentLayer !== vertex.layer)
      this.edgeManager.removeCurrentLine();
    const edge = this.edgeManager.tryToConnectVertices(vertex);
    if (edge == null) return;
    this.eventManager.bindEdgeEvents(edge!);
    this.edgeManager.draw(edge!);
  }

  startDrawingLine(vertex: Vertex) {
    if (this.currentLayer !== vertex.layer) return;
    const line = this.edgeManager.startDrawingLine(vertex);
    sortItems(this.currentLayer);
  }

  moveLineToPoint(position: Cordinates) {
    this.edgeManager.moveLineToPoint(position);
  }

  stopDrawingLine() {
    this.edgeManager.removeCurrentLine();
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

  eraseVertexById(vertexId: string) {
    const vertex = this.findById(vertexId);
    if (vertex) this.vertexManager.remove(vertex as Vertex);
    else
      throw Error(
        "Attempt to remove vertex with ID " + vertexId + " which doesnt exists"
      );
  }

  eraseVertex(vertex: Vertex) {
    this.edgeManager.removeEdges(vertex.edges);
    this.vertexManager.remove(vertex);
  }

  eraseEdge(edge: Edge) {
    if (this.currentLayer != edge.layer) return;
    this.edgeManager.removeEdges([edge]);
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

  getLayerById(layerId: string) {
    return this.layers.find((layer: Konva.Layer) => layer.attrs.id === layerId);
  }

  setCurrentLayer(layerId: string) {
    const layer = this.getLayerById(layerId);
    this.store.commit("setCurrentLayer", layer);
  }

  highlightLayer(layerId: string, on: boolean) {
    const layer = this.getLayerById(layerId);
    if (layer == null) return;
    layer
      .getChildren((node) => node.getClassName() === "Circle")
      .each((vertex) => this.vertexManager.setHiglight(vertex as Vertex, on));
    layer
      .getChildren((node) => node.getClassName() === "Line")
      .each((edge) => this.edgeManager.setHiglight(edge as Edge, on));
  }
}
