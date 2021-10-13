import Konva from "konva";
import DraggableManager from "./DraggableManager";
import { layerManager } from "./LayerManager";
import { stageManager } from "./StageManager";
import { Cordinates, HighlightConfig, Vertex } from "./VertexManager";

export interface EdgeDTO extends Konva.LineConfig {
  v1: string;
  v2: string;
}

export class Edge extends Konva.Line {
  v1: Vertex;
  v2: Vertex;
  baseConfig: Konva.LineConfig;
  constructor(v1: Vertex, v2: Vertex, config: Konva.LineConfig) {
    config.points = [v1.x(), v1.y(), v2.x(), v2.y()];
    const baseConfig = Object.assign({}, config);
    super(config);
    this.v1 = v1;
    this.v2 = v2;
    this.baseConfig = baseConfig;
  }

  get layer() {
    return this.v1.layer;
  }

  updatePosition() {
    this.points([this.v1.x(), this.v1.y(), this.v2.x(), this.v2.y()]);
  }

  redraw() {
    this.moveToBottom();
    this.layer.draw();
  }

  asDTO(): EdgeDTO {
    return {
      ...this.attrs,
      type: "edge",
      v1: this.v1.id(),
      v2: this.v2.id(),
    };
  }
}

export default class EdgeManager extends DraggableManager {
  constructor() {
    super();
    this.dragEnabled = false;
  }
  private draggedEdge: Edge | undefined;

  private vertexDistances: number[] = [0, 0, 0, 0];

  private readonly highlightConfigOn: HighlightConfig = {
    strokeWidth: 4,
  };

  private readonly highlightConfigOff: HighlightConfig = {
    strokeWidth: 2,
  };

  private readonly defaultConfig = {
    stroke: "black",
    lineCap: "round",
    lineJoin: "round",
    ...this.highlightConfigOff,
  } as Konva.LineConfig;

  createEdge(edgeDTO: EdgeDTO) {
    const v1 = stageManager.findById(edgeDTO.v1);
    const v2 = stageManager.findById(edgeDTO.v2);
    if (v1 instanceof Vertex && v2 instanceof Vertex) {
      const edge = new Edge(v1, v2, edgeDTO);
      v1.edges.push(edge);
      v2.edges.push(edge);
      // bind missing
      return edge;
    }
  }

  public startDraggingEdge(edge: Edge, pos: Cordinates) {
    this.vertexDistances[0] = edge.v1.x() - pos.x;
    this.vertexDistances[1] = edge.v1.y() - pos.y;
    this.vertexDistances[2] = edge.v2.x() - pos.x;
    this.vertexDistances[3] = edge.v2.y() - pos.y;
    this.draggedEdge = edge;
  }

  public stopDraggingEdge() {
    console.log("stop drag");
    if (!this.draggedEdge) return;
    this.vertexDistances = [0, 0, 0, 0];
    this.draggedEdge = undefined;
  }

  public dragVertexes(pos: Cordinates) {
    if (!this.draggedEdge) return;

    this.draggedEdge.v1.position({
      x: pos.x + this.vertexDistances[0],
      y: pos.y + this.vertexDistances[1],
    });
    this.draggedEdge.v2.position({
      x: pos.x + this.vertexDistances[2],
      y: pos.y + this.vertexDistances[3],
    });
    this.dragEdges(this.draggedEdge.v1);
    this.dragEdges(this.draggedEdge.v2);
    this.draggedEdge.redraw();
  }

  public dragEdges(vertex: Vertex) {
    if (vertex.edges.length === 0) return;
    vertex.edges
      //.filter((edge) => edge !== this.draggedEdge)
      .forEach((edge) => edge.updatePosition());
  }

  public setHighlight(edge: Edge, isHighlithed: boolean) {
    const config: HighlightConfig = isHighlithed
      ? this.highlightConfigOn
      : this.highlightConfigOff;

    edge.setAttrs(config);
    edge.redraw();
  }

  public deleteById(id: string) {
    const edge = stageManager.findById(id) as Edge;
    this.deleteEdges([edge]);
  }

  public deleteEdges(edges: Edge[]) {
    if (!edges.length) return;
    const edgesLayer = edges[0].layer;
    for (const edge of edges) {
      [edge.v1, edge.v2].forEach((vertex) => {
        if (vertex !== undefined)
          vertex.edges = vertex.edges.filter((x) => x !== edge);
      });
      edge.remove();
    }
    edgesLayer.draw();
  }

  public draw(edge: Edge) {
    console.log("drawedge()");
    console.log(edge);
    edge.layer.add(edge);
    edge.redraw();
  }
}

export const edgeManager = new EdgeManager();
