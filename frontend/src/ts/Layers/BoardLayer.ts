import { KonvaMouseEvent } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Vector2d } from "konva/types/types";
import { LineConfig } from "konva/types/shapes/Line";

export class BoardLayer {
  public vertexLayer: Konva.Layer;
  public edgeLayer: Konva.Layer;
  public pencilLayer: Konva.Layer;
  
  constructor(public name: string) {
    this.vertexLayer = new Konva.Layer();
    this.edgeLayer = new Konva.Layer();
    this.pencilLayer = new Konva.Layer();
  }
}

export class LayerManager {
  public boardLayers: BoardLayer[];
  public currentLayer: BoardLayer;
  private layerCount: number;

  constructor(private stage: Konva.Stage) {
    this.boardLayers = [];
    this.layerCount = 0;
    this.addLayerToTop();
  }  

  public addLayerToTop(): BoardLayer{
    var newLayer = new BoardLayer("Layer " + this.layerCount);
    
    this.stage.add(newLayer.pencilLayer);
    this.stage.add(newLayer.edgeLayer);
    newLayer.edgeLayer.moveToTop();
    this.stage.add(newLayer.vertexLayer);
    newLayer.vertexLayer.moveToTop();

    this.boardLayers.push(newLayer);
    this.currentLayer = this.boardLayers[this.boardLayers.length - 1];
    this.layerCount = this.layerCount + 1;

    return this.currentLayer;
  }
}
