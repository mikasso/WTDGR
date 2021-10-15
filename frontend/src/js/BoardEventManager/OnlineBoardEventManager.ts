import { State } from "@/store";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { TemporaryLine } from "../KonvaManager/EdgeManager";
import { Vertex } from "../KonvaManager/VertexManager";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";
import { IHandler } from "./IHandler";
import OnlineEdgeToolHandler from "./Online/OnlineEdgeToolHandler";
import OnlineSelectToolHandler from "./Online/OnlineSelectToolHandler";
import poll from "./poll";

export const SentRequestInterval = 20;

export default class OnlineBoardEventManager extends BaseBoardEventManager {
  actionFactory: ActionFactory;
  hub: BoardHub;
  selectHandler: OnlineSelectToolHandler;
  edgeHandler: OnlineEdgeToolHandler;
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
    this.handlers = [this.edgeHandler, this.selectHandler];
  }

  setSelectToolHandlers() {
    this.selectHandler.setActive(this);
  }

  setVertexToolHandlers() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      const vertex = this.boardManager.createVertex(mousePos);

      const action = this.actionFactory.create("Add", vertex.attrs);
      this.hub.sendAction(action);
    };
  }

  setEdgeToolHandlers() {
    this.edgeHandler.setActive(this);
  }

  setEraseToolHandlers() {
    this.vertexMouseDown = (event) => {
      const vertex = event.target;
      const action = this.actionFactory.create("Delete", vertex.attrs);
      this.hub.sendAction(action);
    };

    this.edgeClick = (event) => {
      const edge = event.target;
      const action = this.actionFactory.create("Delete", edge.attrs);
      this.hub.sendAction(action);
    };

    this.pencilClick = (event) => {
      const drawing = event.target;
      this.boardManager.eraseDrawing(drawing);
    };

    this.vertexMouseEnter = (event) => {
      this.boardManager.setHighlight("vertex", event.target, true);
    };

    this.vertexMouseLeave = (event) => {
      this.boardManager.setHighlight("vertex", event.target, false);
    };

    this.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true);
    };

    this.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false);
    };
  }

  setPencilToolHandlers() {
    this.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.startPencil(mousePos);
    };
    this.mouseMove = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.movePencil(mousePos);
    };
    this.mouseUp = () => {
      this.boardManager.finishPencilDrawing();
    };
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
