import Konva from "konva";
import { ClassNames } from "../KonvaManager/ClassNames";
import { Vertex } from "../KonvaManager/VertexManager";
import BoardManager from "../KonvaManager/BoardManager";
import { ActionTypes } from "../SignalR/ApiHandler";
import { ActionFactory } from "../SignalR/Action";

export {
    exportStage,
    importStage
}

function exportStage(fileFormat: string): string {
    const stageString = encodeURIComponent(
        getFormater(fileFormat).stageToString()
    );
    return `data:text/plain;charset=utf-8,${stageString}`;
}

function importStage(stageFile: File): void{
    const extension = getFileExtension(stageFile)
    getFormater(extension).fileToStage(stageFile)
}

function getFormater(fileFormat: string): Formater{
    switch(fileFormat){
        case 'gdf':
            return new gdfFormater();
        default:
            return new gdfFormater();
    }
}

interface Formater {
    stageToString(): string;
    fileToStage(file: File): void;
}

class gdfFormater implements Formater {
    stageToString(): string {
        const stage = getStage();
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
    fileToStage(file: File){
        const stage = getStage();
        const reader = new FileReader();
        reader.readAsText(file)
        reader.onload = () => {
            const result = reader.result as string;
            const fileLines = result.split("\n")
            let i = 1;
            while(!fileLines[i].includes('edgedef')){
                const vertexData = this.readVertexData(fileLines[i])
                createVertex(vertexData.cords, vertexData.id)
                i++;
            }      
        }
    }

    readVertexData(line: string){
        const args = line.split(",")
        const id = args[0];
        const cords = {
            x: parseInt(args[1]),
            y: parseInt(args[2])
        }
        return {
            id: id,
            cords: cords
        }
    }
}

function getFileExtension(file: File){
    const dotSplit = file.name.split(".");
    return dotSplit[dotSplit.length - 1]
}

function getStage(): Konva.Stage{    
    const boardManager = BoardManager.getBoardManager()
    return boardManager.store.state.stage!;
}

interface Cordinates {
    x: number;
    y: number;
}

function createVertex(position: Cordinates, id: string) {
    const boardManager = BoardManager.getBoardManager()
    const store = boardManager.store;
    
    if(store.state.isOnline){    
        // const vertex = boardManager.createVertex(position);
        // const actionFactory = new ActionFactory(store.state.user.userId, boardManager)
    
        // const action = actionFactory.create(ActionTypes.Add, vertex.asDTO());
        // this.hub.sendAction(action);
    }
    else{
        const vertex = boardManager.createVertex(position);
        vertex.id(id)
        boardManager.draw(vertex);
    }
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