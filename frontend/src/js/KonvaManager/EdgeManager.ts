import Konva from "konva";
import { Cordinates, HighlightConfig, Vertex } from "./VertexManager";

export class Edge extends Konva.Line {
  v1: Vertex;
  v2: Vertex | undefined;
  layer: Konva.Layer;
  baseConfig: Konva.LineConfig;
  highlightConfig: any;
  constructor(
    layer: Konva.Layer,
    v1: any,
    config: Konva.LineConfig,
    highlightConfig: any
  ) {
    const baseConfig = Object.assign({}, config);
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    super(config);

    this.v1 = v1;
    this.v2 = undefined;
    this.layer = layer;
    this.baseConfig = baseConfig;
    this.highlightConfig = highlightConfig;
  }

  updatePosition(redraw: boolean, point: Cordinates | null = null) {
    let currentPoints;
    if (this.v2 !== undefined)
      currentPoints = [this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()];
    else if (point !== null) {
      currentPoints = [this.v1.x(), this.v1.y(), point.x, point.y];
      this.points(currentPoints);
    }

    if (redraw) this.redraw();
  }

  redraw() {
    this.layer.draw();
  }
}

export default class EdgeManager {
  currentStartVertex: any;
  currentEdge: any;
  isDrawing: boolean;
  vertexDistances: number[];
  isDragging: boolean;
  draggedEdge: any;
  constructor() {
    this.currentStartVertex = null;
    this.currentEdge = null;
    this.isDrawing = false;
    this.vertexDistances = [0, 0, 0, 0];
    this.isDragging = false;
    this.draggedEdge = null;
  }

  defaultConfig = {
    stroke: "black",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round",
    points: [],
  };

  highlightConfig: HighlightConfig = {
    strokeWidth: 4,
  };

  startDrawing(
    startVertex: Vertex,
    config: any = this.defaultConfig,
    highlightConfig = this.highlightConfig
  ) {
    this.currentStartVertex = startVertex;
    this.currentEdge = new Edge(
      startVertex.layer,
      startVertex,
      Object.assign({}, config),
      Object.assign({}, highlightConfig)
    );
    this.isDrawing = true;
    this.currentEdge.layer.add(this.currentEdge);
  }

  redrawCurrentEdge(point: any) {
    if (!this.currentEdge) return;
    this.currentEdge.updatePosition(true, point);
  }

  tryToConnectVertices(vertex: Vertex) {
    if (!this.currentEdge) return;
    const v1 = this.currentEdge.v1;
    const v2 = vertex;
    if (v1.layer != v2.layer) {
      this.removeCurrentEdge();
      return;
    }
    for (const edge of v2.edges) {
      if (edge.v1 == v1 || edge.v2 == v1) {
        this.removeCurrentEdge();
        return;
      }
    }

    this.currentEdge.v2 = v2;
    this.currentEdge.updatePosition(true);
    v1.edges.push(this.currentEdge);
    v2.edges.push(this.currentEdge);
    this.currentEdge = null;
  }

  dragEdges(vertex: Vertex, redraw = true) {
    if (!vertex.edges.length) return;
    for (const edge of vertex.edges) {
      edge.updatePosition(false);
    }
    if (redraw) vertex.edges[0].layer.draw();
  }

  startDraggingEdge(edge: Edge, pos: Cordinates) {
    if (edge.v2 !== undefined) {
      this.vertexDistances[0] = edge.v1.position().x - pos.x;
      this.vertexDistances[1] = edge.v1.position().y - pos.y;
      this.vertexDistances[2] = edge.v2.position().x - pos.x;
      this.vertexDistances[3] = edge.v2.position().y - pos.y;
      console.log(this.vertexDistances);
      this.isDragging = true;
      this.draggedEdge = edge;
    } else {
      throw Error("Edge should have exactly 2 vertives, but have only 1");
    }
  }

  dragVertexes(pos: Cordinates) {
    if (!this.isDragging) return;
    this.draggedEdge.v1.position({
      x: pos.x + this.vertexDistances[0],
      y: pos.y + this.vertexDistances[1],
    });
    this.dragEdges(this.draggedEdge.v1, false);
    this.draggedEdge.v2.position({
      x: pos.x + this.vertexDistances[2],
      y: pos.y + this.vertexDistances[3],
    });
    this.dragEdges(this.draggedEdge.v2);
  }

  stopDraggingEdge() {
    if (!this.isDragging) return;
    this.vertexDistances = [0, 0, 0, 0];
    this.isDragging = false;
    this.draggedEdge = null;
  }

  setHiglight(edge: Edge, isHighlithed: boolean) {
    let config;
    if (isHighlithed) config = edge.highlightConfig;
    else config = edge.baseConfig;

    edge.setAttrs(config);
    edge.updatePosition(true);
  }

  removeCurrentEdge() {
    if (!this.currentEdge) return;
    const removedEdgeLayer = this.currentEdge.layer;
    this.currentEdge.destroy();
    this.currentEdge = null;
    removedEdgeLayer.draw();
  }

  remove(edges: Edge[]) {
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

  draw(konvaObject: Edge) {
    konvaObject.draw();
  }
}
