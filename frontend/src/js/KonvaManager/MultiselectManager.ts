import Konva from "konva";
import { Cordinates, Vertex } from "./VertexManager";
import classifyPoint from "robust-point-in-polygon";
import { ClassNames } from "./ClassNames";
import BoardManager from "./BoardManager";
import { toHandlers } from "@vue/runtime-core";
import { formatArrayBuffer } from "@microsoft/signalr/dist/esm/Utils";

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
  vertexDragOfffset: { [id: string]: { offset: Cordinates; vertex: Vertex } };
  selectDragOffset: Cordinates | undefined;

  constructor(private boardManager: BoardManager) {
    this.currentDrawing = undefined;
    this.isDrawing = false;
    this.selectedVertexes = [];
    this.isDragging = false;
    this.vertexDragOfffset = {};
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
    for (const vertex of layerToRedraw!.getChildren(
      (node) => node.getClassName() === ClassNames.Vertex
    )) {
      if (
        classifyPoint(points, [
          vertex.position().x,
          vertex.position().y,
        ] as Point) == -1
      ) {
        this.selectedVertexes.push(vertex as Vertex);
      }
    }
    if (this.selectedVertexes.length == 0) this.removeSelect();
    layerToRedraw!.draw();
  }

  startDrag(mousePos: Cordinates) {
    this.isDragging = true;
    this.vertexDragOfffset = {};
    this.selectDragOffset = undefined;
    for (const vertex of this.selectedVertexes) {
      this.vertexDragOfffset[vertex._id] = {
        vertex: vertex,
        offset: {
          x: vertex.x() - mousePos.x,
          y: vertex.y() - mousePos.y,
        },
      };
    }
    this.selectDragOffset = {
      x: this.currentDrawing!.x() - mousePos.x,
      y: this.currentDrawing!.y() - mousePos.y,
    };
  }

  updateDrag(mousePos: Cordinates) {
    if (!this.isDragging) return;
    for (const i in this.vertexDragOfffset) {
      const offsetData = this.vertexDragOfffset[i];
      const newPos = {
        x: mousePos.x + offsetData.offset.x,
        y: mousePos.y + offsetData.offset.y,
      };
      offsetData.vertex.position(newPos);
      this.boardManager.dragEdges(offsetData.vertex);
    }
    this.moveDrawing(mousePos);
  }

  moveDrawing(mousePos: Cordinates) {
    this.currentDrawing?.position({
      x: this.selectDragOffset!.x + mousePos.x,
      y: this.selectDragOffset!.y + mousePos.y,
    });
  }

  stopDrag() {
    this.isDragging = false;
    this.vertexDragOfffset = {};
    this.selectDragOffset = undefined;
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

  updatedSelectedPosAsDto(mousePos: Cordinates, color: string) {
    const vertexDTO = [];
    for (const i in this.vertexDragOfffset) {
      const offsetData = this.vertexDragOfffset[i];
      offsetData.vertex.setAttrs({ stroke: color });
      vertexDTO.push({
        ...offsetData.vertex.asDTO(),
        x: mousePos.x + offsetData.offset.x,
        y: mousePos.y + offsetData.offset.y,
      });
    }
    return vertexDTO;
  }
}
