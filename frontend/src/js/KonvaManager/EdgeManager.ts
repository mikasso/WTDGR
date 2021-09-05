import Konva from "konva";
import DraggableManager from "./DraggableManager";
import { Cordinates, HighlightConfig, Vertex } from "./VertexManager";

export class Edge extends Konva.Line {
  v1: Vertex;
  v2: Vertex;
  baseConfig: Konva.LineConfig;
  constructor(v1: Vertex, v2: Vertex, config: Konva.LineConfig) {
    config.points = [v1.x(), v1.y(), v2.x(), v2.y()];
    const baseConfig = Object.assign({}, config);
    super(config);
    this.v1 = v1;
    this.v2 = v2;
    this.baseConfig = baseConfig;
  }

  get layer() {
    return this.v1.layer;
  }

  updatePosition() {
    this.points([this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()]);
  }

  redraw() {
    this.moveToBottom();
    this.layer.draw();
  }
}

export default class EdgeManager extends DraggableManager {
  constructor() {
    super();
    this.itemClassName = "Line";
    this.dragEnabled = false;
  }

  private startVertex: Vertex | undefined;
  private currentLine: Konva.Line | undefined;
  private draggedEdge: Edge | undefined;

  private vertexDistances: number[] = [0, 0, 0, 0];

  private readonly highlightConfigOn: HighlightConfig = {
    strokeWidth: 4,
  };

  private readonly highlightConfigOff: HighlightConfig = {
    strokeWidth: 2,
  };

  private readonly defaultConfig = {
    stroke: "black",
    lineCap: "round",
    lineJoin: "round",
    ...this.highlightConfigOff,
  } as Konva.LineConfig;

  public startDrawingLine(
    v1: Vertex,
    config: Konva.LineConfig = this.defaultConfig
  ) {
    this.startVertex = v1;
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    this.currentLine = new Konva.Line(config);
    v1.layer.add(this.currentLine);
    return this.currentLine;
  }

  public moveLineToPoint(point: Cordinates) {
    if (!this.currentLine || !this.startVertex) return;

    this.currentLine.points([
      this.startVertex.x(),
      this.startVertex.y(),
      point.x,
      point.y,
    ]);

    this.startVertex.layer.draw();
  }

  public tryToConnectVertices(vertex: Vertex) {
    if (!this.currentLine || !this.startVertex) return;

    const v1 = this.startVertex;
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
    const layerToRedraw = this.currentLine.getLayer();
    this.currentLine.destroy();
    this.currentLine = undefined;
    layerToRedraw?.draw();
  }

  public startDraggingEdge(edge: Edge, pos: Cordinates) {
    this.vertexDistances[0] = edge.v1.x() - pos.x;
    this.vertexDistances[1] = edge.v1.y() - pos.y;
    this.vertexDistances[2] = edge.v2.x() - pos.x;
    this.vertexDistances[3] = edge.v2.y() - pos.y;
    this.draggedEdge = edge;
  }

  public stopDraggingEdge() {
    console.log("stop drag");
    if (!this.draggedEdge) return;
    //this.draggedEdge.updatePosition();
    this.vertexDistances = [0, 0, 0, 0];
    this.draggedEdge = undefined;
  }

  public dragVertexes(pos: Cordinates) {
    if (!this.draggedEdge) return;

    this.draggedEdge.v1.position({
      x: pos.x + this.vertexDistances[0],
      y: pos.y + this.vertexDistances[1],
    });
    this.draggedEdge.v2.position({
      x: pos.x + this.vertexDistances[2],
      y: pos.y + this.vertexDistances[3],
    });
    this.dragEdges(this.draggedEdge.v1);
    this.dragEdges(this.draggedEdge.v2);
    this.draggedEdge.redraw();
  }

  public dragEdges(vertex: Vertex) {
    if (vertex.edges.length === 0) return;
    vertex.edges
      //.filter((edge) => edge !== this.draggedEdge)
      .forEach((edge) => edge.updatePosition());
  }

  public setHiglight(edge: Edge, isHighlithed: boolean) {
    const config: HighlightConfig = isHighlithed
      ? this.highlightConfigOn
      : this.highlightConfigOff;

    edge.setAttrs(config);
    edge.redraw();
  }

  public removeEdges(edges: Edge[]) {
    if (!edges.length) return;
    const edgesLayer = edges[0].layer;
    for (const edge of edges) {
      [edge.v1, edge.v2].forEach((vertex) => {
        if (vertex !== undefined)
          vertex.edges = vertex.edges.filter((x) => x !== edge);
      });
      edge.remove();
    }
    edgesLayer.draw();
  }

  public draw(edge: Edge) {
    edge.layer.add(edge);
    edge.redraw();
  }
}
