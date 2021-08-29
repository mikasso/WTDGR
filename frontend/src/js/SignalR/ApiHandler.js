export default class ApiManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
  }

  receiveActionResponse(response) {
    console.log(response);
  }

  receiveAction(action, isSucceded) {
    switch (action.actionType) {
      case "Add":
        this.receiveAdd(action);
        break;
      case "Edit":
        this.receiveEdit(action);
        break;
      case "RequestToEdit":
        this.receiveRequestToEdit(action, isSucceded);
        break;
      case "ReleaseItem":
        console.log("Realeas item" + action.item.id);
        break;
      case "Delete":
        this.receiveDelete(action);
        break;
      default:
        throw Error(`Not implement action type ${action.actionType}`);
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
        throw Error(`Not implement delete for ${action.item.type}`);
    }
  }

  receiveEdit(action) {
    switch (action.item.type) {
      case "v-circle":
        this.boardManager.update(action.item);
        break;
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }

  receiveRequestToEdit(action, isSucceded) {
    switch (action.item.type) {
      case "v-circle":
        if (isSucceded)
          this.boardManager.setDraggableVertexById(action.item.id, true);
        else console.error("cannot edit vertex" + action.item.id);
        break;
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }
}
