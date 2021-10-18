import Konva from "konva";
import { Collection } from "konva/types/Util";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Vertex } from "../KonvaManager/VertexManager";
import BoardManager from "../KonvaManager/BoardManager";

export {
    exportStage
}

const boardManager = BoardManager.getBoardManager();

function exportStage(stage: Konva.Stage, fileFormat: string): string {
    const stageString = encodeURIComponent(
        stageToString(stage, fileFormat)
    );
    return `data:text/plain;charset=utf-8,${stageString}`;
}

function stageToString(stage: Konva.Stage, fileFormat: string): string{
    switch(fileFormat){
        case 'GDF':
            return stageToGdf(stage)
        default:
            return "";
    }
}

function stageToGdf(stage: Konva.Stage): string {
    const layers = getLayers(stage)
    let nodesString = "nodedef>name VARCHAR,x DOUBLE,y DOUBLE\n";
    let edgesString = "edgedef>node1 VARCHAR,node2 VARCHAR,directed BOOLEAN\n";
    for (const layer of layers) {
      const vertexes = getVertexes(layer as Konva.Layer);
      for (const vertex of vertexes) {
        nodesString += `${vertex._id},${vertex.x()}.0,${vertex.y()}.0\n`
        for (const edge of vertex.edges) {
          edgesString += `${vertex._id},`;
          const secondVertex = edge.v1._id == vertex._id ? edge.v2 : edge.v1;
          edgesString += `${secondVertex._id},false\n`;
        }
      }
    }
    return nodesString + edgesString;
  }

  

  function getLayers(stage: Konva.Stage){
    return stage.getChildren(
        (node) => node.getClassName() === "Layer"
    );
  }

  function getVertexes(layer: Konva.Layer): Array<Vertex>{
    const childrenCol = layer.getChildren();
    return [...childrenCol].filter((item) => item.getClassName() == ClassNames.Vertex).map((item) => item as Vertex)
  }