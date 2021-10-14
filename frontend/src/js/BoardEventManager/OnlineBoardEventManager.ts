import { State } from "@/store";
import { Store } from "vuex";
import BoardManager from "../KonvaManager/BoardManager";
import { TemporaryLine } from "../KonvaManager/EdgeManager";
import { Vertex } from "../KonvaManager/VertexManager";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import BaseBoardEventManager from "./BaseBoardEventManager";

function poll<T>(params: {
  fn: () => T;
  validate: (result: T) => boolean;
  interval: number;
  maxAttempts: number;
}) {
  let attempts = 0;
  const { fn, validate, interval, maxAttempts } = params;
  const executePoll = async () => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return result;
    } else if (maxAttempts && attempts === maxAttempts) {
      throw new Error("Exceeded max attempts");
    } else {
      setTimeout(executePoll, interval);
    }
  };

  return new Promise(executePoll);
}

const SentRequestInterval = 20;

export default class OnlineBoardEventManager extends BaseBoardEventManager {
  actionFactory: ActionFactory;
  hub: BoardHub;
  constructor(
    boardManager: BoardManager,
    store: Store<State>,
    hub: BoardHub,
    actionFactory: ActionFactory
  ) {
    super(boardManager, store);
    this.actionFactory = actionFactory;
    this.hub = hub;
  }

  setSelectToolHandlers() {
    let intervalId: NodeJS.Timeout | null = null;
    const sendVertexEdit = (vertex: Vertex) => {
      const mousePos = this.boardManager.getMousePosition();
      vertex.setAttrs({ x: mousePos.x, y: mousePos.y });
      const action = this.actionFactory.create("Edit", vertex.attrs);
      return this.hub.sendAction(action);
    };

    this.mouseMove = () => {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.mouseUp = () => {
      this.boardManager.stopDraggingEdge();
    };
    this.vertexDrag = (event) => {
      this.boardManager.dragEdges(event.target);
    };
    this.vertexMouseDown = (event) => {
      const vertex = event.target as Vertex;
      this.boardManager.setHighlight("vertex", vertex, true);
      const action = this.actionFactory.create(
        "RequestToEdit",
        event.target.attrs
      );
      this.hub.sendAction(action).then(() => sendVertexEdit(vertex));

      poll({
        fn: () => {
          if (vertex.followMousePointer) {
            intervalId = setInterval(
              sendVertexEdit,
              SentRequestInterval,
              vertex
            );
            return true;
          }
          return false;
        },
        interval: 100,
        maxAttempts: 3,
        validate: (x) => x,
      }).catch((e) => {
        console.error(e);
      });
    };
    this.vertexMouseUp = (event) => {
      const vertex = event.target;
      this.boardManager.setHighlight("vertex", vertex, false);
      sendVertexEdit(vertex).then(() =>
        this.hub.sendAction(
          this.actionFactory.create("ReleaseItem", vertex.attrs)
        )
      );
      this.boardManager.setVertexFollowMousePointerById(vertex.attrs.id, false);
      if (intervalId !== null) clearInterval(intervalId);
      intervalId = null;
      sendVertexEdit(vertex);
    };

    this.edgeMouseEnter = (event) => {
      this.boardManager.setHighlight("edge", event.target, true);
    };
    this.edgeMouseLeave = (event) => {
      this.boardManager.setHighlight("edge", event.target, false);
    };
    this.edgeMouseUp = () => {
      const mousePos = this.boardManager.getMousePosition();
      this.boardManager.dragEdge(mousePos);
    };
    this.edgeMouseDown = () => {
      this.boardManager.stopDraggingEdge();
    };
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
    let intervalId: NodeJS.Timer | undefined;
    let currentLine: TemporaryLine | undefined;
    const sendLineEdit = (line: TemporaryLine | undefined) => {
      if (line !== undefined) {
        const mousePos = this.boardManager.getMousePosition();
        line.updatePosition(mousePos);
        const action = this.actionFactory.create("Edit", line.asDTO());
        return this.hub.sendAction(action);
      }
    };
    const stopSendLineEdit = async () => {
      if (intervalId !== undefined && currentLine !== undefined) {
        clearInterval(intervalId);
        const action = this.actionFactory.create("Delete", currentLine.asDTO());
        await this.hub.sendAction(action);
        intervalId = undefined;
        currentLine = undefined;
      }
    };

    this.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      const line = this.boardManager.startDrawingLine(vertex);
      if (line !== undefined) {
        currentLine = line;
        console.log(currentLine.asDTO());
        const action = this.actionFactory.create("Add", currentLine.asDTO());
        this.hub.sendAction(action);
        intervalId = setInterval(
          sendLineEdit,
          SentRequestInterval,
          currentLine
        );
      }
    };
    this.mouseMove = (event) => {
      // const point = this.getPointFromEvent(event);
      // this.boardManager.moveLineToPoint(point);
    };
    this.vertexMouseUp = async (event) => {
      const vertex = event.target;
      const edge = this.boardManager.connectVertexes(vertex);
      if (edge !== undefined) {
        const action = this.actionFactory.create("Add", edge.asDTO());
        this.hub.sendAction(action);
      }
    };
    this.mouseUp = async () => {
      await stopSendLineEdit();
    };
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
