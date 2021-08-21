export default class ApiManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
  }

  receiveAction(action) {
    console.log(action);
    switch (action.actionType) {
      case "Add":
        this.receiveAddAction(action);
        break;
      default:
        throw Error(`Not implement action type ${action.actionType}`);
    }
  }

  receiveAddAction(action) {
    switch (action.item.type) {
      case "v-circle":
        this.boardManager.createVertex(
          { x: action.item.x, y: action.item.y },
          action.item
        );
        break;
      default:
        throw Error(`Not implement add for ${action.item.type}`);
    }
  }
}
