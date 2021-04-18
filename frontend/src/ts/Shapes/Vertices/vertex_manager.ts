import { VertexConfig } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Vector2d } from "konva/types/types";
import { Edge } from "../Edges/edge_manager";

export class Vertex extends Konva.Circle {
  constructor(config: Konva.CircleConfig, public edges: Edge[] = []) {
    super(config);
  }
}

export class VertexManager {
  private defualtConfig: VertexConfig;

  constructor(private layer: Konva.Layer) {
    console.log("Hello");
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
      x: Math.round(x),
      y: Math.round(y),
    };
    return config;
  }

  public create(config: VertexConfig): Vertex {
    config.draggable = true;
    const vertex: Vertex = new Vertex(config);
    return vertex;
  }

  public draw(vertexConfig: Vertex) {
    this.layer.add(vertexConfig);
    this.layer.draw();
  }
}
