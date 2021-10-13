import BaseBoardEventManager from "./BaseBoardEventManager";
import Konva from "konva";
import { State } from "@/store";
import { Store } from "vuex";
import { Edge, edgeManager } from "../KonvaManager/EdgeManager";
import VertexManager, { vertexManager } from "../KonvaManager/VertexManager";
import { stageManager } from "../KonvaManager/StageManager";
import { pencilManager } from "../KonvaManager/PencilManager";
import { layerManager } from "../KonvaManager/LayerManager";
import { lineManager } from "../KonvaManager/LineManager";

export default class OffLineBoardEventManager extends BaseBoardEventManager {
  setSelectToolHandlers() {
    edgeManager.enableDrag();
    vertexManager.enableDrag();
    this.mouseMove = () => {
      const mousePos = stageManager.getMousePosition();
      edgeManager.dragVertexes(mousePos);
    };
    this.vertexDrag = (event) => {
      edgeManager.dragEdges(event.target);
    };

    this.vertexMouseEnter = (event) => {
      vertexManager.setHighlight(event.target, true);
    };
    this.vertexMouseLeave = (event) => {
      vertexManager.setHighlight(event.target, false);
    };

    this.edgeMouseEnter = (event) => {
      edgeManager.setHighlight(event.target, true);
    };
    this.edgeMouseLeave = (event) => {
      edgeManager.setHighlight(event.target, false);
    };

    this.edgeMouseDown = (event) => {
      const mousePos = stageManager.getMousePosition();
      if (mousePos !== null)
        edgeManager.startDraggingEdge(event.target, mousePos);
    };
    this.edgeMouseUp = () => {
      edgeManager.stopDraggingEdge();
    };
  }

  setVertexToolHandlers() {
    this.click = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = stageManager.getMousePosition();
      if (mousePos !== null) {
        const vertex = vertexManager.create(mousePos);
        stageManager.draw(vertex);
      }
    };
  }

  setEdgeToolHandlers() {
    this.vertexMouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const vertex = event.target;
      lineManager.startDrawingLine(vertex);
    };
    this.mouseMove = (event) => {
      const point = this.getPointFromEvent(event);
      lineManager.moveLineToPoint(point);
    };
    this.vertexMouseUp = (event) => {
      const vertex = event.target;
      const edge = lineManager.tryToConnectVertices(vertex);
      if (edge !== undefined) {
        this.bindEdgeEvents(edge);
        edgeManager.draw(edge);
      }
    };
    this.mouseUp = () => {
      lineManager.removeCurrentLine();
    };
  }

  setEraseToolHandlers() {
    this.vertexMouseDown = (event) => {
      const vertex = event.target;
      vertexManager.delete(vertex);
    };

    this.edgeClick = (event) => {
      const edge = event.target;
      edgeManager.deleteEdges([edge]);
    };

    this.pencilClick = (event) => {
      const drawing = event.target;
      pencilManager.delete(drawing);
    };

    this.vertexMouseEnter = (event) => {
      vertexManager.setHighlight(event.target, true);
    };

    this.vertexMouseLeave = (event) => {
      vertexManager.setHighlight(event.target, false);
    };

    this.edgeMouseEnter = (event) => {
      edgeManager.setHighlight(event.target, true);
    };

    this.edgeMouseLeave = (event) => {
      edgeManager.setHighlight(event.target, false);
    };
  }

  setPencilToolHandlers() {
    this.mouseDown = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = stageManager.getMousePosition();
      pencilManager.start(mousePos);
    };
    this.mouseMove = (event) => {
      if (!this.isLeftClick(event)) return;
      const mousePos = stageManager.getMousePosition();
      pencilManager.appendPoint(mousePos);
    };
    this.mouseUp = () => {
      pencilManager.finishDrawing();
    };
  }

  findLayerById(layerId: string) {
    const stageLayers = this.store.state.layers;
    return stageLayers.find((layer: Konva.Layer) => layer.attrs.id === layerId);
  }

  addLayer() {
    const stageLayers = this.store.state.layers;
    let layerId = "Layer ";
    let count = 1;
    while (layerId == "Layer ") {
      if (this.findLayerById("Layer " + count) == null) layerId += count;
      count += 1;
    }
    const newLayer = new Konva.Layer({
      id: layerId,
    });
    this.store.commit("addLayer", newLayer);
    this.store.commit("setCurrentLayer", newLayer);
  }

  reorderLayers(index1: number, index2: number) {
    const stageLayers = this.store.state.stage!.getLayers();
    const layer1 = stageLayers[index1];
    const layer2 = stageLayers[index2];
    layerManager.reorderLayers(layer1.id(), layer2.id());
  }

  removeLayer(layerId: string) {
    layerManager.deleteById(layerId);
  }
}
