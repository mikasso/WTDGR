import Konva from "konva";
import { NotDrawingState, DrawingState } from "./drawing_state";

export default {
  EdgeManager,
};

function EdgeManager(layer) {
  this.layer = layer;
  DrawingState();
  console.log("hello");
  this.state = new NotDrawingState();
  this.currentLine = new EmptyShape();
  this.currentVertex = null;
}

EdgeManager.prototype.startDrawing = function(event) {
  if (!event.evt.isRightClick()) return;

  this.state = this.state.startDrawing(() => {
    this.currentVertex = event.target;
    const startPoint = this.currentVertex.attrs;
    const endPoint = event.evt.getPoint();
    this.currentLine = this.getLine(startPoint, endPoint);
    this.layer.add(this.currentLine);
    this.currentLine.draw();
  });
};

EdgeManager.prototype.tryToConnectVertices = function(event) {
  if (!event.evt.isRightClick()) return;

  const v1 = event.currentTarget;
  const v2 = this.currentVertex;
  const cord = v1.attrs;
  this.currentLine.redraw(cord);
  const edge = {
    v1: v1,
    v2: v2,
    line: this.currentLine,
  };
  v1.edges.push(edge);
  v2.edges.push(edge);
  this.currentLine = new EmptyShape();
};

EdgeManager.prototype.dragEdges = function(event) {
  const vertex = event.target;
  var edge, line, toChange;
  for (var i = 0; i < vertex.edges.length; i++) {
    edge = vertex.edges[i];
    toChange = 2;
    line = edge.line;

    if (edge.v1.id !== vertex.id) toChange = 0;

    line.attrs.points[toChange] = vertex.attrs.x;
    line.attrs.points[toChange + 1] = vertex.attrs.y;
  }
  this.layer.draw();
};

EdgeManager.prototype.getLine = function(start, end) {
  var line = new Konva.Line({
    points: [start.x, start.y, end.x, end.y],
    stroke: "black",
    strokeWidth: 2,
    lineCap: "round",
    lineJoin: "round",
  });
  return line;
};

EdgeManager.prototype.handleMouseUp = function() {
  this.state = this.state.mouseUp();
  this.currentLine.destroy();
  this.currentLine = new EmptyShape();
  this.layer.draw();
};

EdgeManager.prototype.handleMouseMove = function(event) {
  this.state = this.state.mouseMove(() => {
    const endPoint = event.evt.getPoint();
    this.currentLine.redraw(endPoint);
  });
};

// Przeniesc to gdzies indziej!!!
const RightClickType = 3;

MouseEvent.prototype.getPoint = function() {
  return {
    x: this.layerX,
    y: this.layerY,
  };
};

MouseEvent.prototype.isRightClick = function() {
  return this.which == RightClickType;
};

Konva.Line.prototype.redraw = function(point) {
  this.attrs.points[2] = point.x;
  this.attrs.points[3] = point.y;
  this.parent.draw();
  console.log("redraw");
};

Konva.Line.prototype.toEdge = function() {};

function EmptyShape() {}
EmptyShape.prototype.destroy = function() {};
