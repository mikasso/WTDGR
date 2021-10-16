import Konva from "konva";
import { ClassNames } from "./ClassNames";
import { Cordinates } from "./VertexManager";

export class PencilLine extends Konva.Line {
  layer: Konva.Layer;
  constructor(config: Konva.LineConfig, layer: Konva.Layer) {
    super(config);
    this.layer = layer;
    this.className = ClassNames.PencilLine;
  }

  redraw(): void {
    this.layer.draw();
  }
}

export default class PencilManager {
  currentDrawing: PencilLine | undefined;
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
    this.draw(this.currentDrawing);
    return newLine;
  }

  draw(drawing: PencilLine) {
    drawing.layer.add(drawing);
    drawing.redraw();
  }

  appendPoint(position: Cordinates) {
    if (!this.isDrawing) return;
    const points = this.currentDrawing?.attrs.points;
    points.push(position.x);
    points.push(position.y);
    this.currentDrawing?.points(points);
    this.currentDrawing?.redraw();
  }

  finishDrawing() {
    this.isDrawing = false;
    this.currentDrawing = undefined;
  }

  removeDrawing(drawing: any) {
    const removedDrawingLayer = drawing.layer;
    drawing.destroy();
    removedDrawingLayer.draw();
  }
}
