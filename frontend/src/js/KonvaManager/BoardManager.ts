import EdgeManager, {
  Edge,
  EdgeDTO,
  LineDTO,
  TemporaryLine,
} from "./EdgeManager";
import VertexManager, { Cordinates, Vertex } from "./VertexManager";
import { sortItems } from "../Utils/LayerUtils";
import PencilManager, { PencilLine } from "./PencilManager";
import MultiselectManager, { SelectLine } from "./MultiselectManager";
import Konva from "konva";
import BaseBoardEventManager from "../BoardEventManager/BaseBoardEventManager";
import { Store } from "vuex";
import { State } from "@/store";
import { ClassNames } from "./ClassNames";

export default class BoardManager {
  addEdge(edge: Edge) {
    this.eventManager.bindItem(edge);
    this.addItemToLayer(edge);
  }

  private static boardManager: BoardManager;
  edgeManager: EdgeManager;
  vertexManager: VertexManager;
  pencilManager: PencilManager;
  eventManager!: BaseBoardEventManager;
  multiselectManager!: MultiselectManager;

  store: Store<State>;
  private constructor(store: Store<State>) {
    this.store = store;
    this.edgeManager = new EdgeManager();
    this.vertexManager = new VertexManager();
    this.pencilManager = new PencilManager();
    this.multiselectManager = new MultiselectManager(this);
  }

  public static createBoardManagerSingleton(store: Store<State>) {
    if (!BoardManager.boardManager) {
      BoardManager.boardManager = new BoardManager(store);
    }
  }

  public static getBoardManager(): BoardManager {
    return BoardManager.boardManager;
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

  updateVertex(attrs: Konva.NodeConfig) {
    const vertex = this.findById(attrs.id) as Vertex; //konva uses id as selector so # is required
    vertex.setAttrs(attrs);
    this.edgeManager.dragEdges(vertex);
  }

  disableDrag() {
    this.vertexManager.disableDrag(this.layers);
  }

  enableDrag() {
    this.vertexManager.enableDrag(this.layers);
  }

  setFollowMousePointerById(itemId: string, value: boolean) {
    const item = this.findById(itemId);
    if (item !== undefined) {
      const className = item.getClassName();
      if (className === ClassNames.Vertex) {
        const vertex = item as Vertex;
        vertex.followMousePointer = value;
      } else if (className === ClassNames.Edge) {
        const edge = item as Edge;
        edge.followMousePointer = value;
      }
    } else {
      throw new Error("cannot set followMousePointer, item not found");
    }
  }

  dragEdges(vertex: Vertex) {
    this.edgeManager.dragEdges(vertex);
  }

  setHighlight(target: Vertex | Edge, isHighlithed: boolean) {
    if (target.layer.id !== this.currentLayer.id) return;
    if (target.getClassName() === ClassNames.Vertex)
      this.vertexManager.setHiglight(target as Vertex, isHighlithed);
    else if (target.getClassName() === ClassNames.Edge)
      this.edgeManager.setHiglight(target as Edge, isHighlithed);
  }

  createVertex(
    position: Cordinates,
    attrs?: Konva.CircleConfig,
    layerId: string = this.currentLayer.id()
  ) {
    const layer: Konva.Layer = this.getLayerById(layerId)!;
    const vertex = this.vertexManager.create(layer, position, attrs);
    this.eventManager.bindItem(vertex);
    return vertex;
  }

  createEdge(edgeDTO: EdgeDTO) {
    const v1 = this.findById(edgeDTO.v1);
    const v2 = this.findById(edgeDTO.v2);
    if (v1 instanceof Vertex && v2 instanceof Vertex) {
      const edge = new Edge(v1, v2, edgeDTO);
      v1.edges.push(edge);
      v2.edges.push(edge);
      this.eventManager.bindItem(edge);
      return edge;
    }
  }

  deleteEdge(id: string) {
    const edge = this.findById(id) as Edge;
    this.edgeManager.removeEdges([edge]);
  }

  createLine(lineDTO: LineDTO) {
    const v1 = this.findById(lineDTO.v1);
    if (v1 instanceof Vertex) {
      const line = new TemporaryLine(lineDTO, v1);
      return line;
    }
  }

  editLine(lineDTO: LineDTO) {
    const line = this.findById(lineDTO.id) as TemporaryLine;
    line.setAttrs(lineDTO);
    line.moveToBottom();
  }

  deleteLine(lineId: string) {
    const line = this.findById(lineId) as TemporaryLine;
    this.edgeManager.removeLine(line);
  }

  addItemToLayer(konvaObject: Vertex | Edge | PencilLine | TemporaryLine) {
    sortItems(this.currentLayer);
    konvaObject.layer.add(konvaObject);
    if (konvaObject instanceof Edge || konvaObject instanceof TemporaryLine)
      konvaObject.moveToBottom();
  }

  connectVertexes(vertex: Vertex) {
    if (this.currentLayer !== vertex.layer)
      this.edgeManager.removeCurrentLine();
    return this.edgeManager.tryToConnectVertices(vertex);
  }

  startDrawingLine(vertex: Vertex) {
    if (this.currentLayer !== vertex.layer) return null;
    const line = this.edgeManager.startDrawingLine(vertex);
    sortItems(this.currentLayer);
    return line;
  }

  addLine(line: TemporaryLine) {
    const layer = line.layer;
    layer.add(line);
    sortItems(this.currentLayer);
    line.moveToBottom();
  }

  moveLineToPoint(position: Cordinates): boolean {
    return this.edgeManager.moveLineToPoint(position);
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
    const vertex = this.findById(vertexId) as Vertex;
    if (vertex) {
      this.eraseVertex(vertex);
    } else
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
    this.pencilManager.addPencilLineToLayer(pencilDrawing);
    this.eventManager.bindItem(pencilDrawing);
  }

  addPencil(
    attrs?: Konva.LineConfig,
    layerId: string = this.currentLayer.id()
  ): PencilLine {
    const layer: Konva.Layer = this.getLayerById(layerId)!;
    const pencilLine = this.pencilManager.newLine(layer, attrs);
    this.eventManager.bindItem(pencilLine);
    return pencilLine;
  }

  createPencil(position: Cordinates) {
    const pencilDrawing = this.pencilManager.create(
      position,
      this.currentLayer
    );
    this.eventManager.bindItem(pencilDrawing);
    return pencilDrawing;
  }

  movePencil(position: Cordinates) {
    this.pencilManager.appendPoint(position);
  }

  finishPencilDrawing() {
    this.pencilManager.finishDrawing();
  }

  startMultiselect(position: Cordinates) {
    this.setHighlightOfSelected(false);
    const multiselect: SelectLine = this.multiselectManager.create(
      position,
      this.currentLayer
    );
    this.eventManager.bindItem(multiselect as SelectLine);
  }

  finishMultiselect() {
    this.multiselectManager.finishDrawing();
    this.setHighlightOfSelected(true);
  }

  setHighlightOfSelected(value: boolean) {
    const selectedVertexes = this.multiselectManager.selectedVertexes;
    if (selectedVertexes != null && selectedVertexes.length > 0) {
      for (const vertex of selectedVertexes) {
        this.vertexManager.setHiglight(vertex, value);
      }
    }
  }

  eraseDrawing(drawing: any) {
    this.pencilManager.removeDrawing(drawing);
  }

  deletePencilLine(lineId: string) {
    const line = this.findById(lineId) as PencilLine;
    this.pencilManager.removeDrawing(line);
  }

  editPencilLine(lineDTO: LineDTO) {
    const line = this.findById(lineDTO.id) as PencilLine;
    line.points([...line.points(), ...lineDTO.points]);
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

  getLayerIndexById(layerId: string) {
    return this.layers.indexOf(this.getLayerById(layerId)!);
  }

  setCurrentLayer(layerId: string) {
    const layer = this.getLayerById(layerId);
    this.store.commit("setCurrentLayer", layer);
  }

  highlightLayer(layerId: string, on: boolean) {
    const layer = this.getLayerById(layerId);
    if (layer == null) return;
    layer
      .getChildren((node) => node.getClassName() === ClassNames.Vertex)
      .each((vertex) => this.vertexManager.setHiglight(vertex as Vertex, on));
    layer
      .getChildren((node) => node.getClassName() === ClassNames.Edge)
      .each((edge) => this.edgeManager.setHiglight(edge as Edge, on));
  }

  deleteLayer(layerId: string) {
    let newCurrentLayer = null;
    const layers = this.store.state.layers;
    const removedLayer = this.getLayerById(layerId);
    if (removedLayer == null) return;
    if (removedLayer == this.store.state.currentLayer) {
      newCurrentLayer = layers.find(
        (layer: Konva.Layer) => layer.attrs.id != layerId
      );
      if (newCurrentLayer == null) {
        return;
      } else this.store.commit("setCurrentLayer", newCurrentLayer);
    }
    removedLayer.destroy();
    const index = layers.indexOf(removedLayer);
    if (index > -1) {
      layers.splice(index, 1);
    }
    this.store.commit("setLayers", layers);
  }

  reorderLayers(layerId1: string, layerId2: string) {
    const index1 = this.getLayerIndexById(layerId1);
    const index2 = this.getLayerIndexById(layerId2);
    const stageLayers = this.store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    const zIndex1 = layer1.zIndex();
    const zIndex2 = layer2.zIndex();
    layer1.zIndex(zIndex2);
    layer2.zIndex(zIndex1);
    this.store.commit("swapLayers", [index1, index2]);
  }
}
