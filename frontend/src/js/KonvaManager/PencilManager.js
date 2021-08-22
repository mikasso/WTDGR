import Konva from "konva";

export class PencilLine extends Konva.Line {
  constructor(config, layer) {
    super(config);
    this.layer = layer;
  }

  redraw() {
    this.layer.draw();
  }
}

export default class PencilManager {
  constructor() {
    this.currentDrawing = null;
    this.isDrawing = false;
  }

  defualtConfig = {
    points: [],
    stroke: "red",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round",
  };

  create(position, layer, config = this.defualtConfig) {
    config.points = [position.x, position.y];
    const newLine = new PencilLine(config, layer);
    this.isDrawing = true;
    this.currentDrawing = newLine;
    this.currentDrawing.layer.add(this.currentDrawing);
    this.currentDrawing.redraw();
    return newLine;
  }

  appendPoint(position) {
    if (!this.isDrawing) return;
    const points = this.currentDrawing.attrs.points;
    points.push(position.x);
    points.push(position.y);
    this.currentDrawing.points(points);
    this.currentDrawing.redraw();
  }

  finishDrawing() {
    this.isDrawing = false;
    this.currentDrawing = null;
  }

  removeDrawing(drawing) {
    const removedDrawingLayer = drawing.layer;
    drawing.destroy();
    removedDrawingLayer.draw();
  }
}
