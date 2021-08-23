import Konva from "konva";

export class Vertex extends Konva.Circle {
  constructor(layer, pos, config, highlightConfig) {
    let baseConfig = Object.assign({}, config);
    config.x = pos.x;
    config.y = pos.y;
    super(config);
    this.baseConfig = baseConfig;
    this.highlightConfig = highlightConfig;
    this.edges = [];
    this.layer = layer;
  }

  redraw() {
    this.layer.draw();
  }
}

export default class VertexManager {
  constructor() {
    this.dragEnabled = true;
    this.vertexes = [];
  }

  defaultConfig = {
    type: "v-circle",
    name: "unnamed",
    radius: 12,
    fill: "#A8A8A8",
    stroke: "black",
    strokeWidth: 2,
    draggeble: this.dragEnabled,
  };

  highlightConfig = {
    strokeWidth: 3,
  };

  create(
    layer,
    pos,
    config = this.defaultConfig,
    highlightConfig = this.highlightConfig
  ) {
    const newVertex = new Vertex(
      layer,
      pos,
      Object.assign({}, config),
      Object.assign({}, highlightConfig)
    );
    this.vertexes.push(newVertex);
    return newVertex;
  }

  getVertexById(vertexId) {
    return this.vertexes.find((x) => x.attrs.id === vertexId);
  }

  draw(vertex) {
    vertex.layer.add(vertex);
    vertex.layer.draw();
  }

  enableDrag(layers) {
    this.dragEnabled = true;
    this.updateDragProp(layers);
  }

  disableDrag(layers) {
    this.dragEnabled = false;
    this.updateDragProp(layers);
  }

  updateDragProp(layers) {
    for (var layer of layers) {
      const items = layer.getChildren();
      items.each((x) => {
        if (x.getClassName() === "Circle") x.setDraggable(this.dragEnabled);
      });
    }
  }

  setHiglight(vertex, isHighlithed) {
    let config;
    if (isHighlithed) config = vertex.highlightConfig;
    else config = vertex.baseConfig;
    delete config.x;
    delete config.y;
    vertex.setAttrs(config);
    vertex.redraw();
  }

  remove(vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
