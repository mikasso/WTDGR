import Konva from "konva";
import DraggableManager from "./DraggableManager";
import { Edge } from "./EdgeManager";

export interface Cordinates {
  x: number;
  y: number;
}

export interface HighlightConfig {
  strokeWidth: number;
}
export class Vertex extends Konva.Circle {
  edges: Edge[];
  layer: Konva.Layer;
  constructor(layer: Konva.Layer, pos: Cordinates, config: Konva.CircleConfig) {
    config.x = pos.x;
    config.y = pos.y;
    super(config);
    this.edges = [];
    this.layer = layer;
  }

  redraw() {
    this.layer.draw();
  }
}

export default class VertexManager extends DraggableManager {
  constructor() {
    super();
    this.dragEnabled = true;
    this.itemClassName = "Circle";
  }

  get defaultConfig() {
    return {
      type: "v-circle",
      name: "unnamed",
      radius: 12,
      fill: "#A8A8A8",
      stroke: "black",
      ...this.highlightConfigOff,
      draggeble: this.dragEnabled,
    };
  }

  private readonly highlightConfigOn = {
    strokeWidth: 3,
  };

  private readonly highlightConfigOff = {
    strokeWidth: 2,
  };

  create(
    layer: Konva.Layer,
    pos: Cordinates,
    config: Konva.CircleConfig = this.defaultConfig
  ) {
    const newVertex = new Vertex(layer, pos, config);
    return newVertex;
  }

  draw(vertex: Vertex) {
    vertex.layer.add(vertex);
    vertex.layer.draw();
  }

  setHiglight(vertex: Vertex, isHighlithed: boolean) {
    if (isHighlithed) vertex.setAttrs(this.highlightConfigOn);
    else vertex.setAttrs(this.highlightConfigOff);

    vertex.redraw();
  }

  remove(vertex: Vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
