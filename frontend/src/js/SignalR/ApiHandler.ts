import Konva from "konva";
import BoardManager from "../KonvaManager/BoardManager";
import UserAction from "./Action";

export default class ApiManager {
  boardManager: BoardManager;
  constructor(boardManager: BoardManager) {
    this.boardManager = boardManager;
  }

  receiveActionResponse(response: string) {
    console.log(response);
  }

  receiveAction(action: UserAction, isSucceded: boolean) {
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

  receiveAdd(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle":
          var vertex = this.boardManager.createVertex(
            { x: action.item.x as number, y: action.item.y as number },
            action.item as Konva.CircleConfig
          );
          this.boardManager.draw(vertex);
          break;
        case "layer":
          this.boardManager.receiveAddLayer(action.item.id);
          // if (action.userId === this.store.state.user)
          this.boardManager.setCurrentLayer(action.item.id);
          break;
        default:
          throw Error(`Not implement add for ${action.item.type}`);
      }
  }

  receiveDelete(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle":
          this.boardManager.eraseVertexById(action.item.id);
          break;
        default:
          throw Error(`Not implement delete for ${action.item.type}`);
      }
  }

  receiveEdit(action: UserAction) {
    switch (action.item.type) {
      case "v-circle":
        this.boardManager.update(action.item);
        break;
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }

  receiveRequestToEdit(action: UserAction, isSucceded: boolean) {
    if (action.item.id)
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
