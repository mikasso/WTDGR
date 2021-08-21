export default class ApiManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
  }

  receiveActionResponse(response) {
    console.log(response);
  }

  receiveAction(action) {
    console.debug(action);
    switch (action.actionType) {
      case "Add":
        this.receiveAdd(action);
        break;
      default:
        throw Error(`Not implement action type ${action.actionType}`);
      case "Delete":
        this.receiveDelete(action);
    }
  }

  receiveAdd(action) {
    switch (action.item.type) {
      case "v-circle":
        var vertex = this.boardManager.createVertex(
          { x: action.item.x, y: action.item.y },
          action.item
        );
        this.boardManager.draw(vertex);
        break;
      default:
        throw Error(`Not implement add for ${action.item.type}`);
    }
  }

  receiveDelete(action) {
    switch (action.item.type) {
      case "v-circle":
        this.boardManager.eraseVertexById(action.item.id);
        break;
      default:
        throw Error(`Not implement add for ${action.item.type}`);
    }
  }
}
