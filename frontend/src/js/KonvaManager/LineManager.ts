import Konva from "konva";
import { Edge } from "./EdgeManager";
import { layerManager } from "./LayerManager";
import { stageManager } from "./StageManager";
import { Cordinates, Vertex } from "./VertexManager";

export interface LineDTO extends Konva.LineConfig {
  v1: string;
  endPoint: Cordinates;
}

export class TemporaryLine extends Konva.Line {
  v1: Vertex;
  baseConfig: Konva.LineConfig;
  constructor(config: Konva.LineConfig, v1: Vertex) {
    config.points = [v1.x(), v1.y(), v1.x(), v1.y()];
    const baseConfig = Object.assign({}, config);
    super(config);
    if (this.id() === "") this.id(Math.random().toString() + v1.id());
    this.v1 = v1;
    this.baseConfig = baseConfig;
  }

  get layer() {
    return this.v1.layer;
  }

  updatePosition(mousePos: Cordinates) {
    this.points([this.v1.x(), this.v1.y(), mousePos.x, mousePos.y]);
  }

  redraw() {
    this.moveToBottom();
    this.layer.draw();
  }

  asDTO(): LineDTO {
    return {
      ...this.attrs,
      type: "line",
      v1: this.v1.id(),
      endPoint: { x: this.points()[2], y: this.points()[3] },
    };
  }
}

class LineManager {
  private currentLine: TemporaryLine | undefined;
  private readonly defaultConfig = {
    stroke: "gray",
    lineCap: "round",
    lineJoin: "round",
    strokeWidth: 3,
  } as Konva.LineConfig;

  createLine(lineDTO: LineDTO) {
    const v1 = stageManager.findById(lineDTO.v1);
    if (v1 instanceof Vertex) {
      const line = new TemporaryLine(lineDTO, v1);
      return line;
    }
  }
  editLine(lineDTO: LineDTO) {
    if (!lineDTO.id) return;
    const line = stageManager.findById(lineDTO.id) as TemporaryLine;
    console.log("requested line" + JSON.stringify(lineDTO));
    console.log("founded line" + line);
    line.setAttrs(lineDTO);
    line.redraw();
  }

  deleteById(lineId: string) {
    const line = stageManager.findById(lineId) as TemporaryLine;
    this.removeLine(line);
  }

  public startDrawingLine(
    v1: Vertex,
    config: Konva.LineConfig = this.defaultConfig
  ) {
    if (layerManager.currentLayer !== v1.layer) return null;
    this.currentLine = new TemporaryLine(config, v1);
    v1.layer.add(this.currentLine);
    layerManager.sortItems(layerManager.currentLayer);
    return this.currentLine;
  }

  public moveLineToPoint(point: Cordinates): boolean {
    if (!this.currentLine) return false;

    this.currentLine.points([
      this.currentLine.v1.x(),
      this.currentLine.v1.y(),
      point.x,
      point.y,
    ]);
    this.currentLine.layer.draw();
    return true;
  }

  public tryToConnectVertices(vertex: Vertex) {
    if (!this.currentLine) return;
    if (layerManager.currentLayer !== vertex.layer) this.removeCurrentLine();
    const v1 = this.currentLine.v1;
    const v2 = vertex;
    if (v1.layer !== v2.layer || v1 === v2) {
      this.removeCurrentLine();
      return;
    }

    //check if the line will be the first edge
    for (const edge of v2.edges) {
      if (edge.v1 == v1 || edge.v2 == v1) {
        this.removeCurrentLine();
        return;
      }
    }

    const edge = new Edge(v1, v2, this.defaultConfig);
    v1.edges.push(edge);
    v2.edges.push(edge);
    this.removeCurrentLine();
    return edge;
  }

  public removeCurrentLine() {
    if (!this.currentLine) return;
    this.removeLine(this.currentLine);
    this.currentLine = undefined;
  }

  removeLine(line: TemporaryLine) {
    const layerToRedraw = line.getLayer();
    line.destroy();
    layerToRedraw?.draw();
  }
  public drawLine(line: TemporaryLine) {
    console.log("drawline()");
    console.log(line);
    line.layer.add(line);
    line.redraw();
    console.log(line.layer);
  }
}

export const lineManager = new LineManager();
