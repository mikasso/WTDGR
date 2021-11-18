import Konva from "konva";
import { ItemColors } from "../BoardEventManager/utils";
import { ClassNames } from "./ClassNames";
import { Cordinates, HighlightConfig, Vertex } from "./VertexManager";

export interface EdgeDTO extends Konva.LineConfig {
  v1: string;
  v2: string;
}

export interface LineDTO extends Konva.LineConfig {
  v1: string;
  endPoint: Cordinates;
}

export class Edge extends Konva.Line {
  v1: Vertex;
  v2: Vertex;
  baseConfig: Konva.LineConfig;
  followMousePointer: boolean;
  constructor(v1: Vertex, v2: Vertex, config: Konva.LineConfig) {
    config.points = [v1.x(), v1.y(), v2.x(), v2.y()];
    const baseConfig = Object.assign({}, config);
    super(config);
    this.v1 = v1;
    this.v2 = v2;
    this.followMousePointer = false;
    this.className = ClassNames.Edge;
    this.baseConfig = baseConfig;
  }

  get layer() {
    return this.v1.layer;
  }

  updatePosition() {
    this.points([this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()]);
  }

  asDTO(): EdgeDTO {
    return {
      ...this.attrs,
      v1: this.v1.id(),
      v2: this.v2.id(),
      type: this.getClassName(),
    };
  }
}

export class TemporaryLine extends Konva.Line {
  v1: Vertex;
  baseConfig: Konva.LineConfig;
  constructor(config: Konva.LineConfig, v1: Vertex) {
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    const baseConfig = Object.assign({}, config);
    super(config);
    if (this.id() === "") this.id(Math.random().toString() + v1.id());
    this.v1 = v1;
    this.className = ClassNames.TemporaryLine;
    this.baseConfig = baseConfig;
  }

  get layer() {
    return this.v1.layer;
  }

  updatePosition(mousePos: Cordinates) {
    this.points([this.v1.x(), this.v1.y(), mousePos.x, mousePos.y]);
  }

  asDTO(): LineDTO {
    return {
      ...this.attrs,
      v1: this.v1.id(),
      endPoint: { x: this.points()[2], y: this.points()[3] },
      type: this.getClassName(),
    };
  }
}

export default class EdgeManager {
  constructor() {}
  private currentLine: TemporaryLine | null = null;
  private draggedEdge: Edge | null = null;
  private vertexDistances: number[] = [0, 0, 0, 0];

  private readonly highlightConfigOn: HighlightConfig = {
    strokeWidth: 4,
  };

  private readonly highlightConfigOff: HighlightConfig = {
    strokeWidth: 2,
  };

  private readonly defaultConfig = {
    stroke: ItemColors.defaultStroke,
    lineCap: "round",
    lineJoin: "round",
    ...this.highlightConfigOff,
  } as Konva.LineConfig;

  public startDrawingLine(
    v1: Vertex,
    config: Konva.LineConfig = this.defaultConfig
  ) {
    this.currentLine = new TemporaryLine(config, v1);
    return this.currentLine;
  }

  public moveLineToPoint(point: Cordinates): boolean {
    if (!this.currentLine) return false;

    this.currentLine.points([
      this.currentLine.v1.x(),
      this.currentLine.v1.y(),
      point.x,
      point.y,
    ]);
    return true;
  }

  public tryToConnectVertices(vertex: Vertex) {
    if (!this.currentLine) return;

    const v1 = this.currentLine.v1;
    const v2 = vertex;
    if (v1.layer !== v2.layer || v1 === v2) {
      this.removeCurrentLine();
      return;
    }

    //check if the line will be the first edge
    for (const edge of v2.edges) {
      if (edge.v1 == v1 || edge.v2 == v1) {
        this.removeCurrentLine();
        return;
      }
    }

    const edge = new Edge(v1, v2, this.defaultConfig);
    v1.edges.push(edge);
    v2.edges.push(edge);
    this.removeCurrentLine();
    return edge;
  }

  public removeCurrentLine() {
    if (!this.currentLine) return;
    this.removeLine(this.currentLine);
    this.currentLine = null;
  }

  removeLine(line: TemporaryLine) {
    line.destroy();
  }

  public startDraggingEdge(edge: Edge, pos: Cordinates) {
    this.vertexDistances[0] = edge.v1.x() - pos.x;
    this.vertexDistances[1] = edge.v1.y() - pos.y;
    this.vertexDistances[2] = edge.v2.x() - pos.x;
    this.vertexDistances[3] = edge.v2.y() - pos.y;
    this.draggedEdge = edge;
  }

  public stopDraggingEdge() {
    if (!this.draggedEdge) return;
    this.vertexDistances = [0, 0, 0, 0];
    this.draggedEdge = null;
  }

  public calculcateNewVerticesPosition(pos: Cordinates): {
    v1Pos: Cordinates;
    v2Pos: Cordinates;
  } {
    if (!this.draggedEdge) throw Error("edge shouldnt be null");
    return {
      v1Pos: {
        x: pos.x + this.vertexDistances[0],
        y: pos.y + this.vertexDistances[1],
      },
      v2Pos: {
        x: pos.x + this.vertexDistances[2],
        y: pos.y + this.vertexDistances[3],
      },
    };
  }

  public dragVertexes(pos: Cordinates) {
    if (!this.draggedEdge) return;
    const { v1Pos, v2Pos } = this.calculcateNewVerticesPosition(pos);
    this.draggedEdge.v1.position(v1Pos);
    this.draggedEdge.v2.position(v2Pos);
    this.dragEdges(this.draggedEdge.v1);
    this.dragEdges(this.draggedEdge.v2);
    this.draggedEdge.moveToBottom();
  }

  public dragEdges(vertex: Vertex) {
    if (vertex.edges.length === 0) return;
    vertex.edges
      //.filter((edge) => edge !== this.draggedEdge)
      .forEach((edge) => edge.updatePosition());
  }

  public setHiglight(edge: Edge, isHighlithed: boolean) {
    if (isHighlithed)
      edge.setAttrs({
        ...this.highlightConfigOn,
      });
    else
      edge.setAttrs({
        ...this.highlightConfigOff,
      });
    edge.moveToBottom();
  }

  public removeEdges(edges: Edge[]) {
    if (!edges.length) return;
    for (const edge of edges) {
      [edge.v1, edge.v2].forEach((vertex) => {
        if (vertex !== undefined)
          vertex.edges = vertex.edges.filter((x) => x !== edge);
      });
      edge.remove();
    }
  }

  public addEdgeToLayer(edge: Edge) {
    edge.layer.add(edge);
    edge.moveToBottom();
  }

  public addLineToLayer(line: TemporaryLine) {
    line.layer.add(line);
    line.moveToBottom();
  }
}
