import Konva from "konva";
import { Cordinates, Vertex } from "./VertexManager";
import classifyPoint from "robust-point-in-polygon";
import { ClassNames } from "./ClassNames";

type Point = [number, number];

export class SelectLine extends Konva.Line {
  layer: Konva.Layer;
  constructor(config: Konva.LineConfig, layer: Konva.Layer) {
    super(config);
    this.layer = layer;
  }

  redraw(): void {
    this.layer.draw();
  }
}

export default class MultiselectManager {
  currentDrawing: SelectLine | undefined;
  isDrawing: boolean;
  selectedVertexes: Vertex[];
  isDragging: boolean;

  constructor() {
    this.currentDrawing = undefined;
    this.isDrawing = false;
    this.selectedVertexes = [];
    this.isDragging = false;
  }

  defualtConfig = {
    points: [],
    stroke: "black",
    strokeWidth: 1,
    lineCap: "round",
    lineJoin: "round",
    closed: true,
  };

  create(
    position: Cordinates,
    layer: Konva.Layer,
    config: any = this.defualtConfig
  ): SelectLine {
    this.selectedVertexes = [];
    config.points = [position.x, position.y];
    const newLine = new SelectLine(config, layer);
    this.isDrawing = true;
    if (this.currentDrawing != null) this.removeSelect();
    this.currentDrawing = newLine;
    this.draw(this.currentDrawing);
    return newLine;
  }

  draw(drawing: SelectLine) {
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
    if (this.currentDrawing == null) return;
    const layerToRedraw = this.currentDrawing?.layer;
    this.selectedVertexes = [];

    const points = this.numberArrayToPoints(this.currentDrawing!.points());
    console.log("halo");
    for (const vertex of layerToRedraw!.getChildren(
      (node) => node.getClassName() === ClassNames.Vertex
    )) {
      console.log(vertex.position().x, vertex.position().y);
      if (
        classifyPoint(points, [
          vertex.position().x,
          vertex.position().y,
        ] as Point) == -1
      ) {
        this.selectedVertexes.push(vertex as Vertex);
      }
    }
    console.log(this.selectedVertexes);
    if (this.selectedVertexes.length == 0) this.removeSelect();
    // this.currentDrawing!.attrs.stroke = "gray";
    layerToRedraw!.draw();
  }

  startDrag() {
    this.isDragging = true;
  }

  stopDrag() {
    this.isDragging = false;
  }

  numberArrayToPoints(numbers: number[]) {
    const result = [];
    for (let i = 0; i < numbers.length; i += 2) {
      result.push([numbers[i], numbers[i + 1]]);
    }
    return result as Point[];
  }

  removeSelect() {
    if (!this.currentDrawing) return;
    const removedDrawingLayer = this.currentDrawing!.layer;
    this.currentDrawing!.destroy();
    this.currentDrawing = undefined;
    removedDrawingLayer.draw();
  }
}
