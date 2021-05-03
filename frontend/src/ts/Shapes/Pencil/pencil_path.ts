import { KonvaMouseEvent, VertexConfig } from "@/ts/Aliases/aliases";
import Konva from "konva";

export class PencilPath extends Konva.Line {
  constructor(config: Konva.LineConfig) {
    super(config);
  }
}