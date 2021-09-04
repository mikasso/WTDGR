import Konva from "konva";
import { Cordinates } from "./VertexManager";

export class PencilLine extends Konva.Line {
  layer: any;
  constructor(config: Konva.LineConfig, layer: Konva.Layer) {
    super(config);
    this.layer = layer;
  }

  redraw() {
    this.layer.draw();
  }
}

export default class PencilManager {
  currentDrawing: any;
  isDrawing: boolean;
  constructor() {
    this.currentDrawing = undefined;
    this.isDrawing = false;
  }

  defualtConfig = {
    points: [],
    stroke: "red",
    strokeWidth: 3,
    lineCap: "round",
    lineJoin: "round",
  };

  create(
    position: Cordinates,
    layer: Konva.Layer,
    config: any = this.defualtConfig
  ) {
    config.points = [position.x, position.y];
    const newLine = new PencilLine(config, layer);
    this.isDrawing = true;
    this.currentDrawing = newLine;
    this.currentDrawing.layer.add(this.currentDrawing);
    this.currentDrawing.redraw();
    return newLine;
  }

  appendPoint(position: Cordinates) {
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

  removeDrawing(drawing: any) {
    const removedDrawingLayer = drawing.layer;
    drawing.destroy();
    removedDrawingLayer.draw();
  }
}
