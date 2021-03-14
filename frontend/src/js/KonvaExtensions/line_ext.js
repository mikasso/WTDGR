import Konva from "konva";

Konva.Line.prototype.redraw = function(point) {
  this.attrs.points[2] = point.x;
  this.attrs.points[3] = point.y;
  this.parent.draw();
  console.log("redraw");
};

Konva.Line.prototype.toEdge = function() {};
