import { State } from "@/store";
import { Store } from "vuex";
import { Cordinates } from "../../KonvaManager/VertexManager";
import Konva from "konva";
import { ClassNames } from "../../KonvaManager/ClassNames";
import { Vertex } from "../../KonvaManager/VertexManager";
import BoardManager from "../../KonvaManager/BoardManager";
import { ActionTypes } from "../../SignalR/ApiHandler";
import { ActionFactory } from "../../SignalR/Action";
import BoardHub from "../../SignalR/Hub";

export { Formater };

abstract class Formater {
  boardManager: BoardManager;
  stage: Konva.Stage;
  store: Store<State>;
  constructor(private hub: BoardHub) {
    this.boardManager = BoardManager.getBoardManager();
    this.store = this.boardManager.store;
    this.stage = this.boardManager.store.state.stage!;
  }

  exportStage(): string {
    const stageString = encodeURIComponent(this.stageToString());
    return `data:text/plain;charset=utf-8,${stageString}`;
  }
  importStage(stageFile: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const properFile = this.validateFile(result);
        if (!properFile) resolve(false);
        if (properFile) this.fileToStage(result);
        resolve(true);
      };
      reader.readAsText(stageFile);
    });
  }

  abstract stageToString(): string;
  abstract fileToStage(file: string): void;
  abstract validateFile(file: string): boolean;

  createVertex(position: Cordinates) {
    const vertex = this.boardManager.createVertex(position);
    if (this.store.state.isOnline) {
      const actionFactory = new ActionFactory(
        this.store.state.user.userId,
        this.boardManager
      );
      const action = actionFactory.create(ActionTypes.Add, vertex.asDTO());
      this.hub.sendAction(action);
    } else {
      this.boardManager.draw(vertex);
    }
  }

  createEdge(v1: Vertex, v2: Vertex) {
    const line = this.boardManager.startDrawingLine(v1);
    if (line) this.boardManager.addLine(line);
    const edge = this.boardManager.connectVertexes(v2);
    if (edge == undefined) return;
    if (this.store.state.isOnline) {
      const actionFactory = new ActionFactory(
        this.store.state.user.userId,
        this.boardManager
      );
      const action = actionFactory.create(ActionTypes.Add, edge.asDTO());
      this.hub.sendAction(action);
    } else {
      this.boardManager.addEdge(edge);
    }
  }

  getFileExtension(file: File) {
    const dotSplit = file.name.split(".");
    return dotSplit[dotSplit.length - 1];
  }

  getLayers() {
    return this.stage.getChildren((node) => node.getClassName() === "Layer");
  }

  getVertexes(layer: Konva.Layer): Array<Vertex> {
    const childrenCol = layer.getChildren();
    return [...childrenCol]
      .filter((item) => item.getClassName() == ClassNames.Vertex)
      .map((item) => item as Vertex);
  }
}
