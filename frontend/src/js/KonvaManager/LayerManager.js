import Konva from "konva";

export default class LayerManager {
  constructor(stage, boardComponent) {
    this.stage = stage;
    this.boardComponent = boardComponent;
    this.layers = [];
    this.layerCount = 0;
    this.addLayer();
  }

  addLayer() {
    this.layerCount += 1;
    const layerID = "Layer " + this.layerCount;
    const newLayer = new Konva.Layer({ id: layerID });
    this.currentLayer = newLayer;
    this.layers.push(newLayer);
    this.stage.add(newLayer);
    this.sendLayersStateToToolbar();
  }

  selectLayer(layerId) {
    for (const layer of this.layers) {
      if (layer.attrs.id == layerId) {
        this.currentLayer = layer;
        break;
      }
    }
  }

  sendLayersStateToToolbar() {
    const layerState = {
      layers: this.layers,
      currentLayer: this.currentLayer,
    };
    this.boardComponent.sendLayerStateToToolbar(layerState);
  }

  sortItems(layer = this.currentLayer) {
    const vertexes = layer.getChildren(function(node) {
      return node.getClassName() === "Circle";
    });
    for (const vertex of vertexes) vertex.moveToBottom();

    const edges = layer.getChildren(function(node) {
      return node.getClassName() === "Line" && node.v1;
    });
    for (const edge of edges) edge.moveToBottom();
  }
}
