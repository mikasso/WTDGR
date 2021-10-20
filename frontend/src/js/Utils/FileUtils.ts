import Konva from "konva";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Vertex } from "../KonvaManager/VertexManager";
import BoardManager from "../KonvaManager/BoardManager";
import { ActionTypes } from "../SignalR/ApiHandler";
import { ActionFactory } from "../SignalR/Action";
import BoardHub from "../SignalR/Hub";
import { State } from "@/store";
import { Store } from "vuex";

export { getFormater };

interface Cordinates {
  x: number;
  y: number;
}

function getFormater(hub: BoardHub, fileExtension: string) {
  switch (fileExtension) {
    case "gdf":
      return new GdfFormater(hub);
    default:
      return new GdfFormater(hub);
  }
}

abstract class Formater {
  stage: Konva.Stage;
  store: Store<State>;
  constructor(private hub: BoardHub) {
    const boardManager = BoardManager.getBoardManager();
    this.store = boardManager.store;
    this.stage = boardManager.store.state.stage!;
  }

  exportStage(): string {
    const stageString = encodeURIComponent(this.stageToString());
    return `data:text/plain;charset=utf-8,${stageString}`;
  }
  importStage(stageFile: File): void {
    this.fileToStage(stageFile);
  }
  abstract stageToString(): string;
  abstract fileToStage(file: File): void;

  createVertex(position: Cordinates, id: string) {
    const boardManager = BoardManager.getBoardManager();
    if (this.store.state.isOnline) {
      const vertex = boardManager.createVertex(position);
      const actionFactory = new ActionFactory(
        this.store.state.user.userId,
        boardManager
      );
      const action = actionFactory.create(ActionTypes.Add, vertex.asDTO());
      this.hub.sendAction(action);
    } else {
      const vertex = boardManager.createVertex(position);
      vertex.id(id);
      boardManager.draw(vertex);
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

class GdfFormater extends Formater {
  stageToString(): string {
    const layers = this.getLayers();
    let nodesString = "nodedef>name VARCHAR,x DOUBLE,y DOUBLE\n";
    let edgesString = "edgedef>node1 VARCHAR,node2 VARCHAR,directed BOOLEAN\n";
    for (const layer of layers) {
      const vertexes = this.getVertexes(layer as Konva.Layer);
      for (const vertex of vertexes) {
        nodesString += `${vertex._id},${vertex.x()}.0,${vertex.y()}.0\n`;
        for (const edge of vertex.edges) {
          edgesString += `${vertex._id},`;
          const secondVertex = edge.v1._id == vertex._id ? edge.v2 : edge.v1;
          edgesString += `${secondVertex._id},false\n`;
        }
      }
    }
    return nodesString + edgesString;
  }

  fileToStage(file: File) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const result = reader.result as string;
      const fileLines = result.split("\n");
      let i = 1;
      while (!fileLines[i].includes("edgedef")) {
        const vertexData = this.readVertexData(fileLines[i]);
        this.createVertex(vertexData.cords, vertexData.id);
        i++;
      }
    };
  }

  readVertexData(line: string) {
    const args = line.split(",");
    const id = args[0];
    const cords = {
      x: parseInt(args[1]),
      y: parseInt(args[2]),
    };
    return {
      id: id,
      cords: cords,
    };
  }
}
