import { store } from "@/store";
import Konva from "konva";
import { Layer } from "konva/types/Layer";
import { stageManager } from "./StageManager";
import { Edge, edgeManager } from "./EdgeManager";
import { Vertex, vertexManager } from "./VertexManager";
import { PencilLine } from "./PencilManager";

class LayerManager {
  sortItems(layer: Layer) {
    layer
      .getChildren((node) => node.getClassName() === "Circle")
      .each((vertex) => vertex.moveToBottom());
    layer
      .getChildren((node) => node.getClassName() === "Line") // the checking if it is edge by node.v1 probably didnt work anyway
      .each((line) => {
        if (!(line instanceof PencilLine)) line.moveToBottom();
      });
  }

  deleteById(layerId: string) {
    let newCurrentLayer = null;
    const layers = store.state.layers;
    const removedLayer = this.getLayerById(layerId);
    if (removedLayer == null) return;
    if (removedLayer == store.state.currentLayer) {
      newCurrentLayer = layers.find(
        (layer: Konva.Layer) => layer.attrs.id != layerId
      );
      if (newCurrentLayer == null) {
        return;
      } else store.commit("setCurrentLayer", newCurrentLayer);
    }
    removedLayer.destroy();
    const index = layers.indexOf(removedLayer);
    if (index > -1) {
      layers.splice(index, 1);
    }
    store.commit("setLayers", layers);
  }

  reorderLayers(layerId1: string, layerId2: string) {
    const index1 = this.getLayerIndexById(layerId1);
    const index2 = this.getLayerIndexById(layerId2);
    const stageLayers = store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    const zIndex1 = layer1.zIndex();
    const zIndex2 = layer2.zIndex();
    layer1.zIndex(zIndex2);
    layer2.zIndex(zIndex1);
    store.commit("swapLayers", [index1, index2]);
  }
  getLayerIndexById(layerId1: string) {
    return this.layers.indexOf(this.getLayerById(layerId1));
  }

  selectLayer(layerId: string) {
    this.selectLayer(layerId);
  }

  setCurrentLayer(layerId: string) {
    const layer = this.getLayerById(layerId);
    store.commit("setCurrentLayer", layer);
  }

  receiveAddLayer(layerId: string) {
    const newLayer = new Konva.Layer({
      id: layerId,
    });
    store.commit("addLayer", newLayer);
  }
  getLayerById(layerId: string) {
    return stageManager.findById(layerId) as Layer;
  }

  highlightLayer(layerId: string, on: boolean) {
    const layer = this.getLayerById(layerId);
    if (layer == null) return;
    layer
      .getChildren((node) => node.getClassName() === "Circle")
      .each((vertex) => vertexManager.setHighlight(vertex as Vertex, on));
    layer
      .getChildren((node) => node.getClassName() === "Line")
      .each((edge) => edgeManager.setHighlight(edge as Edge, on));
  }

  get currentLayer(): Konva.Layer {
    const layer = store.state.currentLayer;
    if (layer) return layer;
    else throw Error("Attempt to get layer when it is undefined");
  }

  get layers(): Konva.Layer[] {
    return store.state.layers;
  }
}
export const layerManager = new LayerManager();
