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

  async fileToStage(file: string) {
    const addedVertexes: { [name: string]: Cordinates } = {};

    const fileLines = file.split("\n");
    let i = 1;
    while (!fileLines[i].includes("edgedef")) {
      const vertexData = this.readVertexData(fileLines[i]);
      this.createVertex(vertexData.cords);
      addedVertexes[vertexData.id] = vertexData.cords;
      i++;
    }
    i++;
    const edgesToSkip: string[] = [];
    while (fileLines[i]) {
      const edgeData = this.readEdgeData(fileLines[i]);
      if (edgesToSkip.includes(edgeData.v1 + edgeData.v2)) {
        i++;
        continue;
      }

      const v1Cords = addedVertexes[edgeData.v1];
      const v2Cords = addedVertexes[edgeData.v2];

      const retries = 0;
      let v1;
      let v2;
      while (retries < 25) {
        v1 = this.findVertexByCords(v1Cords);
        v2 = this.findVertexByCords(v2Cords);
        if (v1 && v2) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (!v1 || !v2) {
        i++;
        continue;
      }
      this.createEdge(v1, v2);

      edgesToSkip.push(edgeData.v2 + edgeData.v1);
      i++;
    }
  }

  validateFile(file: string): boolean {
    const fileLines = file.split("\n");
    let readingEdges = false;
    for (const i in fileLines) {
      if (i == "0") {
        if (fileLines[0] != "nodedef>name VARCHAR,x DOUBLE,y DOUBLE") {
          return false;
        }
        continue;
      }
      if (!readingEdges) {
        if (
          fileLines[i] == "edgedef>node1 VARCHAR,node2 VARCHAR,directed BOOLEAN"
        ) {
          readingEdges = true;
          continue;
        }
        for (const params of fileLines[i].split(",")) {
          if (isNaN(parseInt(params))) {
            return false;
          }
        }
      } else {
        if (fileLines[i] == "") continue;
        const params = fileLines[i].split(",");
        if (isNaN(parseInt(params[0])) || isNaN(parseInt(params[1]))) {
          return false;
        }
      }
    }
    return true;
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

  readEdgeData(line: string) {
    const args = line.split(",");
    return {
      v1: args[0],
      v2: args[1],
    };
  }

  findVertexByCords(cords: Cordinates) {
    const layers = this.getLayers();
    for (const layer of layers) {
      const vertexes = this.getVertexes(layer as Konva.Layer);
      for (const vertex of vertexes) {
        if (vertex.x() == cords.x && vertex.y() == cords.y) return vertex;
      }
    }
  }
}
