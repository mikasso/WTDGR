import { KonvaMouseEvent, VertexConfig } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Vector2d } from "konva/types/types";
import { Edge, EdgeManager } from "../Edges/edge_manager";

export class Vertex extends Konva.Circle {
  constructor(config: Konva.CircleConfig, public edges: Edge[] = []) {
    super(config);
  }
}

export class VertexManager {
  private defualtConfig: VertexConfig;
  private dragging: boolean;
  private vertexCount: number;
  private vertexes: Vertex[];

  constructor(private layer: Konva.Layer) {
    this.vertexCount = 0;
    this.vertexes = [];
    this.defualtConfig = {
      type: "v-circle",
      name: "unnamed",
      radius: 10,
      fill: "gray",
      stroke: "black",
      strokeWidth: 2,
    };
  }

  public getConfig(mousePos: Vector2d | null): VertexConfig {
    const x = mousePos!.x;
    const y = mousePos!.y;
    const config: VertexConfig = {
      type: this.defualtConfig.type,
      name: this.defualtConfig.name,
      radius: this.defualtConfig.radius,
      fill: this.defualtConfig.fill,
      stroke: this.defualtConfig.stroke,
      strokeWidth: this.defualtConfig.strokeWidth,
      draggable: this.dragging,
      x: Math.round(x),
      y: Math.round(y),
    };
    return config;
  }

  public create(config: VertexConfig): Vertex {
    config.name = "Vertex" + this.vertexCount.toString();
    this.vertexCount += 1;
    const vertex: Vertex = new Vertex(config);
    this.vertexes.push(vertex);
    return vertex;
  }

  public draw(vertexConfig: Vertex) {
    this.layer.add(vertexConfig);
    this.layer.draw();
  }

  public enableDrag() {
    this.dragging = true;
    this.updateDragProp();
  }

  public disableDrag() {
    this.dragging = false;
    this.updateDragProp();
  }

  private updateDragProp() {
    const items = this.layer.getChildren();
    items.each((x) => {
      if (x.getClassName() === "Circle") x.setDraggable(this.dragging);
    });
  }
  public remove(vertex: Konva.Circle) {
    vertex.remove();
    this.layer.draw();
  }
}
