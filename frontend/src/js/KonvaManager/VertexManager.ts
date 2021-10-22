import Konva from "konva";
import { ItemColors } from "../BoardEventManager/utils";
import { ClassNames } from "./ClassNames";
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
  followMousePointer: boolean;
  constructor(layer: Konva.Layer, pos: Cordinates, config: Konva.CircleConfig) {
    config.x = pos.x;
    config.y = pos.y;
    super(config);
    this.edges = [];
    this.layer = layer;
    this.className = ClassNames.Vertex;
    this.followMousePointer = false;
  }

  redraw() {
    this.layer.draw();
  }

  asDTO() {
    return {
      ...this.attrs,
      type: this.getClassName(),
    };
  }
}

export default class VertexManager {
  private readonly managedDragItems: string = ClassNames.Vertex;
  private dragEnabled = false;
  constructor() {}

  get defaultConfig() {
    return {
      type: "Vertex",
      radius: 12,
      fill: "#A8A8A8",
      stroke: ItemColors.defaultStroke,
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

  public enableDrag(layers: Konva.Layer[]) {
    this.dragEnabled = true;
    this.updateDragProp(layers);
  }

  public disableDrag(layers: Konva.Layer[]) {
    this.dragEnabled = false;
    this.updateDragProp(layers);
  }

  public setDraggable(item: Konva.Node, value: boolean) {
    item.setDraggable(value);
  }

  public updateDragProp(layers: Konva.Layer[]) {
    for (const layer of layers) {
      const items = layer.getChildren();
      items.each((x) => {
        if (x.getClassName() === this.managedDragItems)
          x.setDraggable(this.dragEnabled);
      });
    }
  }

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
    if (isHighlithed)
      vertex.setAttrs({
        ...this.highlightConfigOn,
      });
    else
      vertex.setAttrs({
        ...this.highlightConfigOff,
      });

    vertex.redraw();
  }

  remove(vertex: Vertex) {
    const vertexLayer = vertex.layer;
    vertex.remove();
    vertexLayer.draw();
  }
}
