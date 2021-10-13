import Konva from "konva";
import { layerManager } from "../KonvaManager/LayerManager";

export default class UserAction {
  actionType: string;
  userId: string;
  item: Konva.NodeConfig;
  constructor(actionType: string, userId: string, item: Konva.NodeConfig) {
    this.actionType = actionType;
    this.userId = userId;
    this.item = item;
  }
}

export class ActionFactory {
  constructor(private userId: string) {}

  public create(actionType: string, item: Konva.NodeConfig) {
    item.layer = layerManager.currentLayer.attrs.id;
    return new UserAction(actionType, this.userId, item);
  }
}
