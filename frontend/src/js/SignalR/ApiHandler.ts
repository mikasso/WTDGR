import { State } from "@/store";
import Konva from "konva";
import { Store } from "vuex";
import { EdgeDTO, edgeManager } from "../KonvaManager/EdgeManager";
import { layerManager } from "../KonvaManager/LayerManager";
import { LineDTO, lineManager } from "../KonvaManager/LineManager";
import { stageManager } from "../KonvaManager/StageManager";
import { Vertex, vertexManager } from "../KonvaManager/VertexManager";
import UserAction from "./Action";

export default class ApiManager {
  constructor(private store: Store<State>) {}

  private get user() {
    return this.store.state.user;
  }

  public receiveActionResponse(response: string) {
    console.log(response);
  }

  public receiveAction(action: UserAction, isSucceded: boolean) {
    console.log("Recieved action", action);
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
          const vertex = vertexManager.create(
            {
              x: action.item.x as number,
              y: action.item.y as number,
            },
            action.item as Konva.CircleConfig,
            action.item.layer as string
          );
          stageManager.draw(vertex);
          break;
        }
        case "edge": {
          console.log(action.item);
          const edge = edgeManager.createEdge(action.item as EdgeDTO);
          if (edge !== undefined) stageManager.draw(edge);
          break;
        }
        case "line": {
          console.log(action.item);
          const line = lineManager.createLine(action.item as LineDTO);
          if (line !== undefined) stageManager.draw(line);
          break;
        }
        case "layer":
          layerManager.receiveAddLayer(action.item.id);
          if (action.userId === this.user.userId)
            layerManager.setCurrentLayer(action.item.id);
          break;
        default:
          throw Error(`Not implement add for ${action.item.type}`);
      }
  }

  private receiveDelete(action: UserAction) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle":
          vertexManager.deleteById(action.item.id);
          break;
        case "line":
          lineManager.deleteById(action.item.id);
          break;
        case "edge":
          edgeManager.deleteById(action.item.id);
          break;
        case "layer":
          layerManager.deleteById(action.item.id);
          break;
        default:
          throw Error(`Not implement delete for ${action.item.type}`);
      }
  }

  private receiveEdit(action: UserAction) {
    switch (action.item.type) {
      case "v-circle":
        vertexManager.editVertex(action.item);
        break;
      case "line":
        lineManager.editLine(action.item as LineDTO);
        break;
      case "layer":
        layerManager.reorderLayers(
          action.item.id as string,
          action.item.replaceWithId as string
        );
        break;
      default:
        throw Error(`Not implement edit for ${action.item.type}`);
    }
  }

  private receiveRequestToEdit(action: UserAction, isSucceded: boolean) {
    if (action.item.id)
      switch (action.item.type) {
        case "v-circle": {
          if (!isSucceded)
            return console.error("cannot edit vertex" + action.item.id);
          const vertex = stageManager.findById(action.item.id) as Vertex;
          if (vertex) vertexManager.setDraggable(vertex, true);
          break;
        }
        default:
          throw Error(`Not implement edit for ${action.item.type}`);
      }
  }
}
