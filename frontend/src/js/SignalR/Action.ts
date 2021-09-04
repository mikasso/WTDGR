import Konva from "konva";

export default class UserAction {
  actionType: string;
  userId: string;
  item: Konva.NodeConfig;
  constructor(actionType: string, userId: string, item: Konva.NodeConfig) {
    this.actionType = actionType;
    this.userId = userId;
    this.item = item;
    this.item.id = actionType === "Add" ? undefined : item.id;
  }
}

export class ActionFactory {
  userId: any;
  layerProvider: any;
  constructor(userId: string, layerProvider: { currentLayer: Konva.Layer }) {
    this.userId = userId;
    this.layerProvider = layerProvider;
  }

  create(actionType: string, item: Konva.NodeConfig) {
    item.layer = this.layerProvider.currentLayer.attrs.id;
    return new UserAction(actionType, this.userId, item);
  }
}
