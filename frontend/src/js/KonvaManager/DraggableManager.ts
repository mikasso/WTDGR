import Konva from "konva";
import { layerManager } from "./LayerManager";

export default class DraggableManager {
  protected dragEnabled = false;
  protected itemClassName = "";

  public enableDrag(layers: Konva.Layer[] = layerManager.layers) {
    this.dragEnabled = true;
    this.updateDragProp(layers);
  }

  public disableDrag(layers: Konva.Layer[]) {
    this.dragEnabled = false;
    this.updateDragProp(layers);
  }

  public setDraggable(item: Konva.Node, value: boolean) {
    item.setDraggable(value);
  }

  protected updateDragProp(layers: Konva.Layer[]) {
    for (const layer of layers) {
      const items = layer.getChildren();
      items.each((x) => {
        if (x.getClassName() === this.itemClassName)
          x.setDraggable(this.dragEnabled);
      });
    }
  }
}
