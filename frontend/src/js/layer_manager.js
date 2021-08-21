// import EdgeManager from "./Shapes/Edges/edge_manager"
// import VertexManager from "./Shapes/Vertices/vertex_manager"
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
    const newLayer = new Konva.Layer({ name: layerID });
    this.currentLayer = newLayer;
    this.layers.push(newLayer);
    this.stage.add(newLayer);
    this.sendLayersStateToToolbar();
  }

  selectLayer(layerName) {
    for (const layer of this.layers) {
      if (layer.attrs.name == layerName) {
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

  enableDrag() {
    this.updateDragProp(true);
  }

  disableDrag() {
    this.updateDragProp(false);
  }

  updateDragProp(dragEnabled) {
    for (var layer of this.layers) {
      const items = layer.getChildren();
      items.each((x) => {
        if (x.getClassName() === "Circle") x.setDraggable(dragEnabled);
      });
      items.each((x) => {
        if (x.getClassName() === "Line") x.setDraggable(dragEnabled);
      });
    }
  }
}
