export default class Action {
  constructor(actionType, userId, item) {
    this.actionType = actionType;
    this.userId = userId;
    this.item = item;
    this.item.id = actionType === "Add" ? null : this.item.name;
  }
}
