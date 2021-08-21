import Konva from "konva";

class Vertex extends Konva.Circle {
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

  dragEdges(redraw = true, excludedEdge = null) {
    if (!this.edges.length) return;
    for (const edge of this.edges) {
      if (edge == excludedEdge) {
        continue;
      }
      edge.updatePosition(false);
    }
    if (redraw) this.edges[0].layer.draw();
  }

  redraw() {
    this.layer.draw();
  }
}

export default class VertexManager {
  constructor() {
    this.dragEnabled = false;
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

  draw(vertex) {
    vertex.layer.add(vertex);
    vertex.layer.draw();
  }

  setHiglight(vertex, isHighlithed) {
    let config;
    if (isHighlithed) config = vertex.highlightConfig;
    else config = vertex.baseConfig;

    vertex.setAttrs(config);
    vertex.redraw();
  }

  remove(vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
