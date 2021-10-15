import { State } from "@/store";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";
import { IHandler } from "./IHandler";
import OfflineHighlightToolHandler from "./Offline/OfflineHighlightToolHandler";
import OfflinePencilToolHandler from "./Offline/OfflinePencilToolHandler";
import OnlineEdgeToolHandler from "./Online/OnlineEdgeToolHandler";
import OnlineEraseToolHandler from "./Online/OnlineEraseToolHandler";
import OnlineSelectToolHandler from "./Online/OnlineSelectToolHandler";
import OnlineVertextoolHandler from "./Online/OnlineVertexToolHandler";

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
    this.selectHandler = new OnlineSelectToolHandler(
      this.boardManager,
      this.actionFactory,
      this.hub
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
    this.highlightHandler = new OfflineHighlightToolHandler(this.boardManager);
    this.pencilHandler = new OfflinePencilToolHandler(this.boardManager);

    this.eraseHandler = new OnlineEraseToolHandler(
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
    ];
  }

  setSelectToolHandlers() {
    this.selectHandler.setActive(this);
  }

  setVertexToolHandlers() {
    this.vertexHandler.setActive(this);
  }

  setEdgeToolHandlers() {
    this.edgeHandler.setActive(this);
  }

  setEraseToolHandlers() {
    this.eraseHandler.setActive(this);
  }

  setPencilToolHandlers() {
    this.pencilHandler.setActive(this);
  }

  addLayer() {
    this.hub.sendAction(this.actionFactory.create("Add", { type: "layer" }));
  }

  reorderLayers(index1: number, index2: number) {
    const stageLayers = this.store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    this.hub.sendAction(
      this.actionFactory.create("Edit", {
        type: "layer",
        id: layer1.id(),
        ReplaceWithId: layer2.id(),
      })
    );
  }

  removeLayer(layerId: string) {
    const action = this.actionFactory.create("Delete", {
      type: "layer",
      id: layerId,
    });
    this.hub.sendAction(action);
  }
}
