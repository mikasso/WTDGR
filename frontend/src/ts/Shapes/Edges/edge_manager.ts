import { KonvaMouseEvent } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Vertex } from "../Vertices/vertex_manager";
import { EdgeManagerState, NotDrawingState } from "./drawing_state";
import { getPointFromEvent, isRightClick } from "../../Helpers/functions";
import { Vector2d } from "konva/types/types";
import { LineConfig } from "konva/types/shapes/Line";

class CustomLine extends Konva.Line {
  public redraw(point: Vector2d) {
    this.attrs.points[2] = point.x;
    this.attrs.points[3] = point.y;
    this.parent!.draw();
  }
}

export class Edge extends CustomLine {
  constructor(
    readonly v1: Vertex | null = null,
    readonly v2: Vertex | null = null,
    lineConfig: LineConfig
  ) {
    super(lineConfig);
  }
}

export class EdgeManager {
  private state: EdgeManagerState;
  private currentLine: CustomLine | null;
  private currentVertex: Vertex;
  private defaultLineConfig: LineConfig;
  constructor(private layer: Konva.Layer) {
    this.layer = layer;
    this.state = new NotDrawingState();
    this.currentLine = null;
    this.defaultLineConfig = {
      points: [],
      stroke: "black",
      strokeWidth: 2,
      lineCap: "round",
      lineJoin: "round",
    };
  }

  public startDrawing(event: KonvaMouseEvent) {
    if (!isRightClick(event)) return;

    this.state = this.state.startDrawing(() => {
      this.currentVertex = event.target as Vertex;
      const startPoint = this.currentVertex.attrs;
      const endPoint = getPointFromEvent(event);
      const lineConfig = this.defaultLineConfig;
      lineConfig.points = [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
      this.currentLine = new CustomLine(lineConfig);
      this.layer.add(this.currentLine);
      this.currentLine.draw();
    });
  }

  public tryToConnectVertices(event: KonvaMouseEvent) {
    if (!isRightClick(event)) return;

    const v1 = event.currentTarget as Vertex;
    const v2 = this.currentVertex as Vertex;
    const cord = v1.attrs;
    this.currentLine?.redraw(cord);
    const edge = new Edge(v1, v2, this.currentLine!.attrs);
    v1.edges.push(edge);
    v2.edges.push(edge);
    this.currentLine = null;
  }

  public dragEdges(event: KonvaMouseEvent) {
    const vertex = event.target as Vertex;
    for (let i = 0; i < vertex.edges.length; i++) {
      const edge = vertex.edges[i];
      let toChange = 2;
      console.log(edge.v1!._id);
      if (edge.v1!._id !== vertex._id) toChange = 0;

      edge.attrs.points[toChange] = vertex.attrs.x;
      edge.attrs.points[toChange + 1] = vertex.attrs.y;
    }
    this.layer.draw();
  }

  public handleMouseUp() {
    this.state = this.state.mouseUp();
    this.currentLine?.destroy();
    this.currentLine = null;
    this.layer.draw();
  }

  public handleMouseMove(event: KonvaMouseEvent) {
    this.state = this.state.mouseMove(() => {
      const endPoint = getPointFromEvent(event);
      this.currentLine?.redraw(endPoint);
    });
  }
}
