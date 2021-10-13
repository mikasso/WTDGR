import Konva from "konva";
import DraggableManager from "./DraggableManager";
import { Edge, edgeManager } from "./EdgeManager";
import { layerManager } from "./LayerManager";
import { stageManager } from "./StageManager";
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
    position: Cordinates,
    attrs: Konva.CircleConfig = this.defaultConfig,
    layerId: string = layerManager.currentLayer.id()
  ) {
    const layer: Konva.Layer = layerManager.getLayerById(layerId)!;
    const vertex = new Vertex(layer, position, attrs);
    return vertex;
  }

  draw(vertex: Vertex) {
    vertex.layer.add(vertex);
    vertex.layer.draw();
  }

  editVertex(attrs: Konva.NodeConfig) {
    if (!attrs.id) return;
    const vertex = stageManager.findById(attrs.id) as Vertex; //konva uses id as selector so # is required
    vertex.setAttrs(attrs);
    edgeManager.dragEdges(vertex);
    vertex.redraw();
  }

  setHighlight(vertex: Vertex, isHighlithed: boolean) {
    if (isHighlithed) vertex.setAttrs(this.highlightConfigOn);
    else vertex.setAttrs(this.highlightConfigOff);
    vertex.redraw();
  }

  delete(vertex: Vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }

  deleteById(vertexId: string) {
    const vertex = stageManager.findById(vertexId);
    if (vertex) {
      this.delete(vertex as Vertex);
    } else
      throw Error(
        "Attempt to remove vertex with ID " + vertexId + " which doesnt exists"
      );
  }
}

export const vertexManager = new VertexManager();
