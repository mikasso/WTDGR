export default class Action {
  constructor(actionType, userId, item) {
    this.actionType = actionType;
    this.userId = userId;
    this.item = item;
    this.item.id = actionType === "Add" ? null : item.id;
  }
}

export class ActionFactory {
  constructor(userId, layerProvider) {
    this.userId = userId;
    this.layerProvider = layerProvider;
  }

  create(actionType, item) {
    item.layer = this.layerProvider.getCurrentLayer().attrs.id;
    return new Action(actionType, this.userId, item);
  }
}
