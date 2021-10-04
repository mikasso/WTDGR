import { State } from "@/store";
import Konva from "konva";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { EdgeDTO, LineDTO } from "../KonvaManager/EdgeManager";
import UserAction from "./Action";

export default class ApiManager {
  constructor(
    private boardManager: BoardManager,
    private store: Store<State>
  ) {}

  private get user() {
    return this.store.state.user;
  }

  public receiveActionResponse(response: string) {
    console.log(response);
  }

  public receiveAction(action: UserAction, isSucceded: boolean) {
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

  private receiveAdd(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle": {
          const vertex = this.boardManager.createVertex(
            {
              x: action.item.x as number,
              y: action.item.y as number,
            },
            action.item as Konva.CircleConfig
          );
          this.boardManager.draw(vertex);
          break;
        }
        case "edge": {
          console.log(action.item);
          const edge = this.boardManager.createEdge(action.item as EdgeDTO);
          if (edge !== undefined) this.boardManager.draw(edge);
          break;
        }
        case "line": {
          console.log(action.item);
          const line = this.boardManager.createLine(action.item as LineDTO);
          if (line !== undefined) this.boardManager.draw(line);
          break;
        }
        case "layer":
          this.boardManager.receiveAddLayer(action.item.id);
          if (action.userId === this.user.userId)
            this.boardManager.setCurrentLayer(action.item.id);
          break;
        default:
          throw Error(`Not implement add for ${action.item.type}`);
      }
  }

  private receiveDelete(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle":
          this.boardManager.eraseVertexById(action.item.id);
          break;
        case "line":
          this.boardManager.deleteLine(action.item.id);
          break;
        case "edge":
          this.boardManager.deleteEdge(action.item.id);
          break;
        default:
          throw Error(`Not implement delete for ${action.item.type}`);
      }
  }

  private receiveEdit(action: UserAction) {
    switch (action.item.type) {
      case "v-circle":
        this.boardManager.updateVertex(action.item);
        break;
      case "line":
        this.boardManager.editLine(action.item as LineDTO);
        break;
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }

  private receiveRequestToEdit(action: UserAction, isSucceded: boolean) {
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
