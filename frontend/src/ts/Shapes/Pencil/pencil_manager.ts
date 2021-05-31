import Konva from "konva";
import { Vector2d } from "konva/types/types";
import { LineConfig } from "konva/types/shapes/Line";

export class Pencil extends Konva.Line {
  constructor(config: Konva.LineConfig) {
    super(config);
  }
}

export class PencilManager {
    public defualtConfig: LineConfig;
    private drawing: boolean;
    private currentDrawing: Pencil;
  
    constructor(private layer: Konva.Layer) {
      this.defualtConfig = {
        points: [],
        stroke: "red",
        strokeWidth: 2,
        lineCap: "round",
        lineJoin: "round",
      };
      this.drawing = false;
    }

    public create(mousePos: Vector2d | null, config: LineConfig): Pencil {
        const x = mousePos!.x;
        const y = mousePos!.y;
        config.points = [x, y];
        const pencil: Pencil = new Pencil(config);
        this.drawing = true;
        this.currentDrawing = pencil;
        this.draw();
        return pencil;
    }

    public appendPoint(mousePos: Vector2d | null){
      if(!this.drawing) return;
      const points = this.currentDrawing.attrs.points;
      points.push(mousePos!.x);
      points.push(mousePos!.y);
      this.currentDrawing.points(points);
      this.draw();
    }

    public finishDrawing() {
      this.drawing = false;
  }

    public draw() {
      this.layer.add(this.currentDrawing);
      this.layer.draw();
    }      

    public remove(pencilConfig: Pencil){
      pencilConfig.remove();
      this.layer.draw();
    }
}
