import BaseBoardEventManager from "./BaseBoardEventManager";
import Konva from "konva";
import { State } from "@/store";
import { Store } from "vuex";
import { IHandler } from "./IHandler";
import OffLineSelectHandler from "./Offline/OfflineSelectToolHandler";
import OfflineHighlightToolHandler from "./Offline/OfflineHighlightToolHandler";
import OfflineEdgeToolHandler from "./Offline/OfflineEdgeToolHandlert";
import OfflineVertexToolHandler from "./Offline/OfflineVertexToolHandler";
import OfflinePencilToolHandler from "./Offline/OfflinePencilToolHandler";
import OfflineEraseToolHandler from "./Offline/OfflineEraseToolHandler";
import OfflineMultiselectToolHandler from "./Offline/OfflineMultiselectToolHandler";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  selectHandler: IHandler;
  edgeHandler: IHandler;
  vertexHandler: IHandler;
  eraseHandler: IHandler;
  pencilHandler: IHandler;
  highlightHandler: IHandler;
  multiselectHandler: IHandler;
  handlers: IHandler[];
  constructor(store: Store<State>) {
    super(store);
    this.highlightHandler = new OfflineHighlightToolHandler();
    this.selectHandler = new OffLineSelectHandler(this.highlightHandler);
    this.edgeHandler = new OfflineEdgeToolHandler();
    this.vertexHandler = new OfflineVertexToolHandler();
    this.eraseHandler = new OfflineEraseToolHandler(this.highlightHandler);
    this.pencilHandler = new OfflinePencilToolHandler();
    this.multiselectHandler = new OfflineMultiselectToolHandler();
    this.pencilHandler = new OfflinePencilToolHandler();

    this.handlers = [
      this.highlightHandler,
      this.selectHandler,
      this.edgeHandler,
      this.vertexHandler,
      this.eraseHandler,
      this.pencilHandler,
      this.multiselectHandler,
    ];
  }

  public toolChanged(toolName: string) {
    this.clearHandlers();
    this.handlers.forEach((handler) => handler.setInactive());
    switch (toolName) {
      case "Select":
        this.selectHandler.setActive(this);
        break;
      case "Vertex":
        this.vertexHandler.setActive(this);
        break;
      case "Edge":
        this.edgeHandler.setActive(this);
        break;
      case "Erase":
        this.eraseHandler.setActive(this);
        break;
      case "Pencil":
        this.pencilHandler.setActive(this);
        break;
      case "Multiselect":
        this.multiselectHandler.setActive(this);
        break;
    }
  }

  findLayerById(layerId: string) {
    const stageLayers = this.store.state.layers;
    return stageLayers.find((layer: Konva.Layer) => layer.attrs.id === layerId);
  }

  addLayer() {
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
