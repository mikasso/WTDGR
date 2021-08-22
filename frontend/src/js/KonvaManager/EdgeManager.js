import Konva from "konva";

export class Edge extends Konva.Line {
  constructor(layer, v1, config) {
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    super(config);

    this.v1 = v1;
    this.v2 = null;
    this.layer = layer;
  }

  redraw(point = null) {
    let currentPoints;
    if (this.v2)
      currentPoints = [this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()];
    else currentPoints = [this.v1.x(), this.v1.y(), point.x, point.y];
    this.points(currentPoints);
    this.layer.draw();
  }
}

export default class EdgeManager {
  constructor() {
    this.currentStartVertex = null;
    this.currentEdge = null;
    this.isDrawing = false;
  }

  defaultConfig = {
    stroke: "black",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round",
  };

  startDrawing(startVertex, config = this.defaultConfig) {
    this.currentStartVertex = startVertex;
    this.currentEdge = new Edge(startVertex.layer, startVertex, config);
    this.isDrawing = true;
    this.currentEdge.layer.add(this.currentEdge);
  }

  redrawCurrentEdge(point) {
    if (!this.currentEdge) return;
    this.currentEdge.redraw(point);
  }

  tryToConnectVertices(vertex) {
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
    this.currentEdge.redraw();
    v1.edges.push(this.currentEdge);
    v2.edges.push(this.currentEdge);
    this.currentEdge = null;
  }

  dragEdges(vertex) {
    for (const edge of vertex.edges) {
      edge.redraw();
    }
    vertex.layer.draw();
  }

  removeCurrentEdge() {
    if (!this.currentEdge) return;
    const removedEdgeLayer = this.currentEdge.layer;
    this.currentEdge.destroy();
    this.currentEdge = null;
    removedEdgeLayer.draw();
  }

  remove(edges) {
    if (!edges.length) return;
    const edgesLayer = edges[0].layer;
    for (const edge of edges) {
      [edge.v1, edge.v2].forEach((vertex) => {
        vertex.edges = vertex.edges.filter((x) => x !== edge);
      });
      edge.remove();
    }
    edgesLayer.draw();
  }
}
