import { Formater } from "./Formater";
import Konva from "konva";
import { Cordinates } from "../../KonvaManager/VertexManager";
import BoardHub from "../../SignalR/Hub";
import BoardManager from "../../KonvaManager/BoardManager";
import { State } from "@/store";
import { Store } from "vuex";

export { GdfFormater };

console.log(Formater);

class GdfFormater extends Formater {
  constructor(hub: BoardHub) {
    super(hub);
  }

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

      let retries = 0;
      let v1;
      let v2;
      while (retries < 25) {
        v1 = this.findVertexByCords(v1Cords);
        v2 = this.findVertexByCords(v2Cords);
        if (v1 && v2) {
          break;
        }
        retries++;
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
