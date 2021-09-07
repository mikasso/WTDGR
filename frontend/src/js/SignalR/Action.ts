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
  constructor(
    private userId: string,
    private layerProvider: { currentLayer: Konva.Layer }
  ) {}

  public create(actionType: string, item: Konva.NodeConfig) {
    item.layer = this.layerProvider.currentLayer.attrs.id;
    return new UserAction(actionType, this.userId, item);
  }
}

export interface EdgeDTO extends Konva.LineConfig {
  v1: string;
  v2: string;
}
