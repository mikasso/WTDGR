import Konva from "konva";
import { ActionTypes } from "./ApiHandler";

export type DTO = { type: string } & Konva.NodeConfig;
export default class UserAction {
  actionType: string;
  userId: string;
  items: Konva.NodeConfig[];
  constructor(actionType: string, userId: string, items: Konva.NodeConfig[]) {
    this.actionType = actionType;
    this.userId = userId;
    this.items = items;
  }
}

export class ActionFactory {
  constructor(
    private userId: string,
    private layerProvider: { currentLayer: Konva.Layer }
  ) {}

  public create(
    actionType: ActionTypes,
    item: Konva.NodeConfig | Konva.NodeConfig[]
  ) {
    if (!Array.isArray(item)) {
      item.layer = this.specifyLayerId(item);
      return new UserAction(actionType, this.userId, [item]);
    } else {
      item.every((it) => (it.layer = this.specifyLayerId(item)));
      return new UserAction(actionType, this.userId, item);
    }
  }

  private specifyLayerId(item: Konva.NodeConfig): string {
    if (item.layer !== undefined) return item.layer;
    else return this.layerProvider.currentLayer.attrs.id;
  }
}
