import { State } from "@/store";
import Konva from "konva";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Edge, EdgeDTO, LineDTO } from "../KonvaManager/EdgeManager";
import { Vertex } from "../KonvaManager/VertexManager";
import UserAction from "./Action";
import { LineConfig } from "konva/types/shapes/Line";

export enum ActionTypes {
  Add = "Add",
  Edit = "Edit",
  RequestToEdit = "RequestToEdit",
  ReleaseItem = "ReleaseItem",
  Delete = "Delete",
}
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
    console.log("Recieved action", action);
    switch (action.actionType) {
      case ActionTypes.Add:
        this.receiveAdd(action);
        break;
      case ActionTypes.Edit:
        this.receiveEdit(action);
        break;
      case ActionTypes.RequestToEdit:
        this.receiveRequestToEdit(action, isSucceded);
        break;
      case ActionTypes.ReleaseItem:
        this.receiveReleaseItem(action);
        break;
      case ActionTypes.Delete:
        this.receiveDelete(action);
        break;
      default:
        throw Error(`Not implement action type ${action.actionType}`);
    }
  }

  private receiveAdd(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case ClassNames.Vertex: {
          const vertex = this.boardManager.createVertex(
            {
              x: action.item.x as number,
              y: action.item.y as number,
            },
            action.item as Konva.CircleConfig,
            action.item.layer as string
          );
          this.boardManager.draw(vertex);
          break;
        }
        case ClassNames.Edge: {
          console.log(action.item);
          const edge = this.boardManager.createEdge(action.item as EdgeDTO);
          if (edge !== undefined) this.boardManager.draw(edge);
          break;
        }
        case ClassNames.TemporaryLine: {
          console.log(action.item);
          const line = this.boardManager.createLine(action.item as LineDTO);
          if (line !== undefined) this.boardManager.draw(line);
          break;
        }
        case ClassNames.Layer:
          this.boardManager.receiveAddLayer(action.item.id);
          if (action.userId === this.user.userId)
            this.boardManager.setCurrentLayer(action.item.id);
          break;
        case ClassNames.PencilLine: {
          const pencilLine = this.boardManager.addPencil(
            {
              x: action.item.x as number,
              y: action.item.y as number,
            },
            action.item as LineConfig,
            action.item.layer as string
          );
          this.boardManager.draw(pencilLine);
          break;
        }
        default:
          throw Error(`Not implement add for ${action.item.type}`);
      }
  }

  private receiveDelete(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case ClassNames.Vertex:
          this.boardManager.eraseVertexById(action.item.id);
          break;
        case ClassNames.TemporaryLine:
          this.boardManager.deleteLine(action.item.id);
          break;
        case ClassNames.Edge:
          this.boardManager.deleteEdge(action.item.id);
          break;
        case ClassNames.Layer:
          this.boardManager.deleteLayer(action.item.id);
          break;
        default:
          throw Error(`Not implement delete for ${action.item.type}`);
      }
  }

  private receiveEdit(action: UserAction) {
    switch (action.item.type) {
      case ClassNames.Vertex:
        this.boardManager.updateVertex(action.item);
        break;
      case ClassNames.TemporaryLine:
        this.boardManager.editLine(action.item as LineDTO);
        break;
      case ClassNames.Layer:
        this.boardManager.reorderLayers(
          action.item.id! as string,
          action.item.replaceWithId! as string
        );
        break;
      case ClassNames.PencilLine: {
        this.boardManager.editPencilLine(action.item as LineDTO);
        break;
      }
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }

  private receiveRequestToEdit(action: UserAction, isSucceded: boolean) {
    if (action.item.id)
      switch (action.item.type) {
        case ClassNames.Vertex:
          if (isSucceded) {
            const vertex = this.boardManager.findById(action.item.id) as Vertex;
            this.boardManager.setHighlight(vertex, true);
            if (this.store.state.user.userId === action.userId) {
              this.boardManager.setFollowMousePointerById(action.item.id, true);
            }
          } else console.error("cannot edit vertex" + action.item.id);
          break;
        case ClassNames.Edge:
          if (isSucceded) {
            const edge = this.boardManager.findById(action.item.id) as Edge;
            this.boardManager.setHighlight(edge, true);
            this.boardManager.setHighlight(edge.v1, true);
            this.boardManager.setHighlight(edge.v2, true);
            if (this.store.state.user.userId === action.userId) {
              this.boardManager.setFollowMousePointerById(action.item.id, true);
            }
          } else console.error("cannot edit vertex" + action.item.id);
          break;
        default:
          throw Error(`Not implement edit for ${action.item.type}`);
      }
  }

  private receiveReleaseItem(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case ClassNames.Vertex:
          {
            const vertex = this.boardManager.findById(action.item.id) as Vertex;
            this.boardManager.setHighlight(vertex, false);
          }
          break;
        case ClassNames.Edge:
          {
            const edge = this.boardManager.findById(action.item.id) as Edge;
            this.boardManager.setHighlight(edge, false);
            this.boardManager.setHighlight(edge.v1, false);
            this.boardManager.setHighlight(edge.v2, false);
          }
          break;
        default:
          throw Error(`Not implement edit for ${action.item.type}`);
      }
  }
}
