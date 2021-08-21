export default class Action {
  constructor(actionType, userId, item) {
    this.actionType = actionType;
    this.userId = userId;
    this.item = item;
    this.item.id = actionType === "Add" ? null : item.id;
  }
}

export class ActionFactory {
  constructor(userId) {
    this.userId = userId;
  }

  create(actionType, item) {
    return new Action(actionType, this.userId, item);
  }
}
