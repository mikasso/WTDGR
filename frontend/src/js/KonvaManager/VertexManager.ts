import Konva from "konva";
import { KonvaEventListener, KonvaEventObject } from "konva/types/Node";
import { Edge } from "./EdgeManager";

export interface Cordinates {
  x: number;
  y: number;
}

export interface HighlightConfig {
  strokeWidth: number;
}
export class Vertex extends Konva.Circle {
  baseConfig: Konva.CircleConfig;
  highlightConfig: HighlightConfig;
  edges: Edge[];
  layer: Konva.Layer;
  constructor(
    layer: Konva.Layer,
    pos: Cordinates,
    config: Konva.CircleConfig,
    highlightConfig: HighlightConfig
  ) {
    const baseConfig = Object.assign({}, config);
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
  dragEnabled: boolean;
  vertexes: Vertex[];
  constructor() {
    this.dragEnabled = true;
    this.vertexes = [];
  }

  get defaultConfig() {
    return {
      type: "v-circle",
      name: "unnamed",
      radius: 12,
      fill: "#A8A8A8",
      stroke: "black",
      strokeWidth: 2,
      draggeble: this.dragEnabled,
    };
  }

  highlightConfig = {
    strokeWidth: 3,
  };

  create(
    layer: Konva.Layer,
    pos: Cordinates,
    config: any = this.defaultConfig,
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

  getVertexById(vertexId: string) {
    return this.vertexes.find((x) => x.attrs.id === vertexId);
  }

  draw(vertex: Vertex) {
    vertex.layer.add(vertex);
    vertex.layer.draw();
  }

  enableDrag(layers: Konva.Layer[]) {
    this.dragEnabled = true;
    this.updateDragProp(layers);
  }

  setDraggableById(vertexId: string, value: boolean) {
    const vertex = this.getVertexById(vertexId);
    if (vertex !== undefined) vertex.setAttrs({ draggable: value });
    throw new Error(`Couldn't find vertex to drag by id ${vertexId}`);
  }

  disableDrag(layers: Konva.Layer[]) {
    this.dragEnabled = false;
    this.updateDragProp(layers);
  }

  updateDragProp(layers: Konva.Layer[]) {
    for (const layer of layers) {
      const items = layer.getChildren();
      items.each((x) => {
        if (x.getClassName() === "Circle") x.setDraggable(this.dragEnabled);
      });
    }
  }

  setHiglight(vertex: Vertex, isHighlithed: boolean) {
    if (isHighlithed) vertex.setAttrs(vertex.highlightConfig);
    else vertex.setAttrs(vertex.baseConfig);

    vertex.redraw();
  }

  remove(vertex: Vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
