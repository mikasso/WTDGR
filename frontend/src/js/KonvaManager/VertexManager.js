import Konva from "konva";

export class Vertex extends Konva.Circle {
  constructor(layer, pos, config) {
    config.x = pos.x;
    config.y = pos.y;
    super(config);
    this.edges = [];
    this.layer = layer;
    this.pos = pos;
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
    radius: 10,
    fill: "gray",
    stroke: "black",
    strokeWidth: 2,
    draggeble: this.dragEnabled,
  };

  create(layer, pos, config = this.defaultConfig) {
    const newVertex = new Vertex(layer, pos, config);
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

  remove(vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
