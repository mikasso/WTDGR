import { VertexConfig } from "@/ts/Aliases/aliases";
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
  private movedNode: Konva.Node;
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
      x: Math.round(x),
      y: Math.round(y),
    };
    return config;
  }

  public create(config: VertexConfig): Vertex {
    config.draggable = false;
    config.name = "Vertex" + this.vertexCount.toString();
    this.vertexCount += 1;
    const vertex: Vertex = new Vertex(config);
    this.vertexes.push(vertex);
    return vertex;
  }

  private findVertexByName(name: String) {
    for (var i = 0; i < this.vertexes.length; i++) {
      if (this.vertexes[i].attrs.name == name) return this.vertexes[i];
    }
    return this.vertexes[0]; // :)
  }

  public createWithPos(mousePos: Vector2d | null): Vertex {
    const config = this.getConfig(mousePos);
    return this.create(config);
  }

  public draw(vertexConfig: Vertex) {
    this.layer.add(vertexConfig);
    this.layer.draw();
  }

  public startMoving(vertex: Konva.Circle) {
    this.movedNode = this.layer.findOne("." + vertex.attrs.name);
    this.movedNode.draggable(true);
  }

  public stopMoving() {
    this.movedNode.draggable(false);
  }

  public remove(vertex: Konva.Circle /*, edgeManager: EdgeManager*/) {
    const removedNode = this.layer.findOne("." + vertex.attrs.name);
    // var removedVertex = this.findVertexByName(vertex.attrs.name);
    // edgeManager.removeFromVertex(removedVertex);
    removedNode.remove();
    this.layer.draw();
  }
}
