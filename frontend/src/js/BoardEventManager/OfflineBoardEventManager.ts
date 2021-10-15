import BaseBoardEventManager from "./BaseBoardEventManager";
import Konva from "konva";
import BoardManager from "../KonvaManager/BoardManager";
import { State } from "@/store";
import { Store } from "vuex";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  constructor(boardManager: BoardManager, store: Store<State>) {
    super(boardManager, store);
    this;
    this.handlers = [];
  }

  setSelectToolHandlers() {}

  setVertexToolHandlers() {}

  setEdgeToolHandlers() {
    this.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      const line = this.boardManager.startDrawingLine(vertex);
      this.boardManager.addLine(line!);
    };
    this.mouseMove = (event) => {
      const point = this.getPointFromEvent(event);
      this.boardManager.moveLineToPoint(point);
    };
    this.vertexMouseUp = (event) => {
      const vertex = event.target;
      const edge = this.boardManager.connectVertexes(vertex);
      if (edge !== undefined) {
        this.bindEdgeEvents(edge);
        this.boardManager.draw(edge);
      }
    };
    this.mouseUp = () => {
      this.boardManager.stopDrawingLine();
    };
  }

  setEraseToolHandlers() {}

  setPencilToolHandlers() {}

  findLayerById(layerId: string) {
    const stageLayers = this.store.state.layers;
    return stageLayers.find((layer: Konva.Layer) => layer.attrs.id === layerId);
  }

  addLayer() {
    const stageLayers = this.store.state.layers;
    let layerId = "Layer ";
    let count = 1;
    while (layerId == "Layer ") {
      if (this.findLayerById("Layer " + count) == null) layerId += count;
      count += 1;
    }
    const newLayer = new Konva.Layer({
      id: layerId,
    });
    this.store.commit("addLayer", newLayer);
    this.store.commit("setCurrentLayer", newLayer);
  }

  reorderLayers(index1: number, index2: number) {
    const stageLayers = this.store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    this.boardManager.reorderLayers(layer1.id(), layer2.id());
  }

  removeLayer(layerId: string) {
    this.boardManager.deleteLayer(layerId);
  }
}
