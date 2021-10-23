import { State } from "@/store";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { ActionFactory } from "../SignalR/Action";
import { ActionTypes } from "../SignalR/ApiHandler";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";
import { IHandler } from "./IHandler";
import OfflineHighlightToolHandler from "./Offline/OfflineHighlightToolHandler";
import OfflinePencilToolHandler from "./Offline/OfflinePencilToolHandler";
import OnlineEdgeToolHandler from "./Online/OnlineEdgeToolHandler";
import OnlineEraseToolHandler from "./Online/OnlineEraseToolHandler";
import OnlineSelectToolHandler from "./Online/OnlineSelectToolHandler";
import OnlineVertextoolHandler from "./Online/OnlineVertexToolHandler";
import OnlineMultiselectToolHandler from "./Online/OnlineMultiselectToolHandler";

export const SentRequestInterval = 20;

export default class OnlineBoardEventManager extends BaseBoardEventManager {
  actionFactory: ActionFactory;
  hub: BoardHub;
  selectHandler: IHandler;
  edgeHandler: IHandler;
  vertexHandler: IHandler;
  eraseHandler: IHandler;
  pencilHandler: IHandler;
  highlightHandler: IHandler;
  multiselectHandler: IHandler;
  handlers: IHandler[];
  constructor(
    boardManager: BoardManager,
    store: Store<State>,
    hub: BoardHub,
    actionFactory: ActionFactory
  ) {
    super(boardManager, store);
    this.actionFactory = actionFactory;
    this.hub = hub;
    this.highlightHandler = new OfflineHighlightToolHandler(this.boardManager);
    this.pencilHandler = new OfflinePencilToolHandler(this.boardManager);
    this.selectHandler = new OnlineSelectToolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub,
      this.highlightHandler
    );
    this.edgeHandler = new OnlineEdgeToolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub
    );
    this.vertexHandler = new OnlineVertextoolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub
    );
    this.eraseHandler = new OnlineEraseToolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub,
      this.highlightHandler
    );
    this.multiselectHandler = new OnlineMultiselectToolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub,
      this.highlightHandler
    );
    this.handlers = [
      this.edgeHandler,
      this.selectHandler,
      this.vertexHandler,
      this.eraseHandler,
      this.eraseHandler,
      this.multiselectHandler,
    ];
  }

  public toolChanged(toolName: string) {
    this.clearHandlers();
    this.handlers.forEach((handler) => handler.setInactive());
    switch (toolName) {
      case "Select":
        this.selectHandler.setActive(this);
        break;
      case "Vertex":
        this.vertexHandler.setActive(this);
        break;
      case "Edge":
        this.edgeHandler.setActive(this);
        break;
      case "Erase":
        this.eraseHandler.setActive(this);
        break;
      case "Pencil":
        this.pencilHandler.setActive(this);
        break;
      case "Multiselect":
        this.multiselectHandler.setActive(this);
        break;
    }
  }

  addLayer() {
    this.hub.sendAction(
      this.actionFactory.create(ActionTypes.Add, { type: "Layer" })
    );
  }

  reorderLayers(index1: number, index2: number) {
    const stageLayers = this.store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    this.hub.sendAction(
      this.actionFactory.create(ActionTypes.Edit, {
        type: "Layer",
        id: layer1.id(),
        ReplaceWithId: layer2.id(),
      })
    );
  }

  removeLayer(layerId: string) {
    const action = this.actionFactory.create(ActionTypes.Delete, {
      type: "Layer",
      id: layerId,
    });
    this.hub.sendAction(action);
  }
}
