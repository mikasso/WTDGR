import { State } from "@/store";
import Konva from "konva";
import { NodeConfig } from "konva/types/Node";
import { Store } from "vuex";
import { ItemColors } from "../BoardEventManager/utils";
import BoardManager from "../KonvaManager/BoardManager";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Edge, EdgeDTO, LineDTO } from "../KonvaManager/EdgeManager";
import { Vertex } from "../KonvaManager/VertexManager";
import UserAction from "./Action";

export enum ActionTypes {
  Add = "Add",
  Edit = "Edit",
  RequestToEdit = "RequestToEdit",
  ReleaseItem = "ReleaseItem",
  Delete = "Delete",
}
export default class ApiManager {
  public constructor(
    private boardManager: BoardManager,
    private store: Store<State>
  ) {}

  public receiveActionResponse(response: string) {
    console.log(response);
  }

  public loadItems(items: NodeConfig[]) {
    for (const item of items) {
      this.receiveAdd("room", item);
    }
  }

  public receiveAction(action: UserAction, isSucceded: boolean) {
    console.log("Recieved action", action);
    for (const item of action.items) {
      switch (action.actionType) {
        case ActionTypes.Add:
          this.receiveAdd(action.userId, item);
          break;
        case ActionTypes.Edit:
          this.receiveEdit(action, item);
          break;
        case ActionTypes.RequestToEdit:
          this.receiveRequestToEdit(action, item, isSucceded);
          break;
        case ActionTypes.ReleaseItem:
          this.receiveReleaseItem(action, item);
          break;
        case ActionTypes.Delete:
          this.receiveDelete(action, item);
          break;
        default:
          throw Error(`Not implemented action type ${action.actionType}`);
      }
    }
  }

  private get user() {
    return this.store.state.user;
  }

  private receiveAdd(actionUserId: string, item: NodeConfig) {
    if (item.id)
      switch (item.type) {
        case ClassNames.Vertex: {
          const vertex = this.boardManager.createVertex(
            {
              x: item.x as number,
              y: item.y as number,
            },
            item as Konva.CircleConfig,
            item.layer as string
          );
          this.boardManager.draw(vertex);
          break;
        }
        case ClassNames.Edge: {
          const edge = this.boardManager.createEdge(item as EdgeDTO);
          if (edge !== undefined) this.boardManager.draw(edge);
          break;
        }
        case ClassNames.TemporaryLine: {
          const line = this.boardManager.createLine(item as LineDTO);
          if (line !== undefined) this.boardManager.draw(line);
          break;
        }
        case ClassNames.Layer:
          this.boardManager.receiveAddLayer(item.id);
          if (
            actionUserId === this.user.userId ||
            this.store.state.currentLayer === undefined ||
            this.store.state.currentLayer === null
          )
            this.boardManager.setCurrentLayer(item.id);
          break;
        default:
          throw Error(`Not implemented add for ${item.type}`);
      }
  }

  private receiveDelete(action: UserAction, item: NodeConfig) {
    if (item.id)
      switch (item.type) {
        case ClassNames.Vertex:
          this.boardManager.eraseVertexById(item.id);
          break;
        case ClassNames.TemporaryLine:
          this.boardManager.deleteLine(item.id);
          break;
        case ClassNames.Edge:
          this.boardManager.deleteEdge(item.id);
          break;
        case ClassNames.Layer:
          this.boardManager.deleteLayer(item.id);
          break;
        default:
          throw Error(`Not implemented  delete for ${item.type}`);
      }
  }

  private receiveEdit(action: UserAction, item: NodeConfig) {
    switch (item.type) {
      case ClassNames.Vertex:
        this.boardManager.updateVertex(item);
        break;
      case ClassNames.Edge: {
        const edge = this.boardManager.findById(item.id) as Edge;
        edge.setAttrs(item);
        edge.redraw();
        break;
      }
      case ClassNames.TemporaryLine:
        this.boardManager.editLine(item as LineDTO);
        break;
      case ClassNames.Layer:
        this.boardManager.reorderLayers(
          item.id as string,
          item.replaceWithId as string
        );
        break;
      default:
        throw Error(`Not implemented edit for ${item.type}`);
    }
  }

  private receiveRequestToEdit(
    action: UserAction,
    item: NodeConfig,
    isSucceded: boolean
  ) {
    if (item.id)
      switch (item.type) {
        case ClassNames.Vertex:
          if (isSucceded) {
            if (this.store.state.user.userId === action.userId) {
              this.boardManager.setFollowMousePointerById(item.id, true);
            }
            const vertex = this.boardManager.findById(item.id) as Vertex;
            vertex.setAttrs(item);
            vertex.layer.draw();
          } else console.error("cannot edit vertex" + item.id);
          break;
        case ClassNames.Edge:
          if (isSucceded) {
            if (this.store.state.user.userId === action.userId) {
              this.boardManager.setFollowMousePointerById(item.id, true);
            }
          } else console.error("cannot edit vertex" + item.id);
          break;
        default:
          throw Error(`Not implemented  request to edit for ${item.type}`);
      }
  }

  private receiveReleaseItem(action: UserAction, item: NodeConfig) {
    if (item.id)
      switch (item.type) {
        case ClassNames.Vertex:
          {
            const vertex = this.boardManager.findById(item.id) as Vertex;
            vertex.setAttrs({
              stroke: ItemColors.defaultStroke,
            });
            vertex.redraw();
          }
          break;
        case ClassNames.Edge:
          {
            const edge = this.boardManager.findById(item.id) as Edge;
            edge.setAttrs({ stroke: ItemColors.defaultStroke });
            edge.redraw();
          }
          break;
        default:
          throw Error(`Not implemented receive edit for ${item.type}`);
      }
  }
}
