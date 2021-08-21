import Konva from "konva";

export class Edge extends Konva.Line {
  constructor(layer, v1, config, highlightConfig) {
    let baseConfig = Object.assign({}, config);
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    super(config);

    this.v1 = v1;
    this.v2 = null;
    this.layer = layer;
    this.baseConfig = baseConfig;
    this.highlightConfig = highlightConfig;
  }

  updatePosition(redraw, point = null) {
    let currentPoints;
    if (this.v2)
      currentPoints = [this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()];
    else currentPoints = [this.v1.x(), this.v1.y(), point.x, point.y];
    this.points(currentPoints);
    if (redraw) this.redraw();
  }

  dragVertexes(preDragPoints) {
    const pos = this.position();
    console.log(this.position(), "przed");
    this.v1.position({
      x: preDragPoints[0] + pos.x,
      y: preDragPoints[1] + pos.y,
    });
    this.v1.dragEdges(false, this);
    this.v2.position({
      x: preDragPoints[2] + pos.x,
      y: preDragPoints[3] + pos.y,
    });
    this.v2.dragEdges(true, this);
    console.log(this.position(), "po");
    // this.points([
    //   points[0] - pos.x,
    //   points[1] - pos.y,
    //   points[2] - pos.x,
    //   points[3] - pos.y,
    // ]);
    // this.position({ x: 0, y: 0 });
  }

  redraw() {
    this.layer.draw();
  }
}

export default class EdgeManager {
  constructor() {
    this.currentStartVertex = null;
    this.currentEdge = null;
    this.isDrawing = false;
    this.isDragging = false;
    this.draggedEdge = null;
    this.preDragPoints = [];
  }

  defaultConfig = {
    stroke: "black",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round",
  };

  highlightConfig = {
    strokeWidth: 4,
  };

  startDrawing(
    startVertex,
    config = this.defaultConfig,
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

  redrawCurrentEdge(point) {
    if (!this.currentEdge) return;
    this.currentEdge.updatePosition(true, point);
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
    this.currentEdge.updatePosition(true);
    v1.edges.push(this.currentEdge);
    v2.edges.push(this.currentEdge);
    this.currentEdge = null;
  }

  startDraggingEdge(edge) {
    this.draggedEdge = edge;
    this.setHiglight(this.draggedEdge, true, false);
    this.isDragging = true;
    this.preDragPoints = edge.points().slice();
  }

  updateDragged() {
    this.draggedEdge.dragVertexes(this.preDragPoints);
  }

  stopDraggingEdge() {
    if (!this.isDragging) return;
    const pos = this.draggedEdge.position();
    this.draggedEdge.points([
      this.preDragPoints[0] + pos.x,
      this.preDragPoints[1] + pos.y,
      this.preDragPoints[2] + pos.x,
      this.preDragPoints[3] + pos.y,
    ]);
    this.draggedEdge.position({ x: 0, y: 0 });
    this.isDragging = false;
    this.setHiglight(this.draggedEdge, false, false);
    this.draggedEdge = null;
  }

  setHiglight(edge, isHighlithed, redraw = true) {
    if (this.isDragging) return;
    let config;
    if (isHighlithed) config = edge.highlightConfig;
    else config = edge.baseConfig;

    edge.setAttrs(config);
    if (redraw) edge.redraw(true);
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
