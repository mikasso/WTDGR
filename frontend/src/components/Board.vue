<template>
  <div id="root">
    <div id="board" ref="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script lang="ts">
import { Hub } from "../ts/SignalR/hub";
import { EdgeManager } from "../ts/Shapes/Edges/edge_manager";
import { VertexManager, Vertex } from "../ts/Shapes/Vertices/vertex_manager";
import { PencilManager, Pencil } from "../ts/Shapes/Pencil/pencil_manager";
import { KonvaMouseEvent } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Component, Vue } from "vue-property-decorator";
import { VertexConfig } from "../ts/Aliases/aliases";
import { isLeftClick, isRightClick } from "../ts/Helpers/functions";
@Component({
  props: ["toolbar"],
})
export default class Board extends Vue {
  name: string = "Board";
  private hub!: any;
  private stage!: Konva.Stage;
  private vertexLayer!: Konva.Layer;
  private edgesLayer!: Konva.Layer;
  private pencilLayer!: Konva.Layer;
  private edgeManager!: EdgeManager;
  private vertexManager!: VertexManager;
  private pencilManager!: PencilManager;
  private handleClick!: (event: KonvaMouseEvent) => void;
  private handleMouseMove!: (event: KonvaMouseEvent) => void;
  private handleMouseDown!: (event: KonvaMouseEvent) => void;
  private handleMouseUp!: (event: KonvaMouseEvent) => void;
  private handlePencilMouseDown!: (
    event: KonvaMouseEvent,
    pencil: Pencil
  ) => void;
  private handleVertexMouseUp!: (
    event: KonvaMouseEvent,
    vertex: Vertex
  ) => void;
  private handleVertexMouseDown!: (
    event: KonvaMouseEvent,
    vertex: Vertex
  ) => void;
  private handleVertexDrag!: (event: KonvaMouseEvent, vertex: Vertex) => void;
  mounted() {
    this.hub = new Hub(this);
    // this.hub.joinRoom(this.getRandomUserName(), "1");

    this.stage = new Konva.Stage({
      container: "board",
      width: document.getElementById("board")!.clientWidth,
      height: window.innerHeight,
    });
    this.vertexLayer = new Konva.Layer();
    this.edgesLayer = new Konva.Layer();
    this.pencilLayer = new Konva.Layer();
    this.configLayers();

    // Create managers objects to manage vertices and lines
    this.pencilManager = new PencilManager(this.pencilLayer);
    this.edgeManager = new EdgeManager(this.edgesLayer);
    this.vertexManager = new VertexManager(this.vertexLayer);

    this.toolbarStateChanged({ state: "Select" });
    this.bindStage();
  }

  joinRoom() {
    console.log("TODO joinRoom()");
  }

  createRoom() {
    console.log("TODO createRoom()");
  }

  getRandomUserName(): string {
    const id = Math.floor(Math.random() * 10000);
    return "User_" + id.toString();
  }

  blockContextMenu(e: Event) {
    e.preventDefault(); //disable context menu when right click
  }

  bindStage() {
    this.stage.on("click", (event: KonvaMouseEvent) => this.handleClick(event));
    this.stage.on("mousedown", (event: KonvaMouseEvent) =>
      this.handleMouseDown(event)
    );
    this.stage.on("mouseup", (event: KonvaMouseEvent) =>
      this.handleMouseUp(event)
    );
    this.stage.on("mousemove", (event: KonvaMouseEvent) =>
      this.handleMouseMove(event)
    );
  }

  bindVertexEvents(vertex: Vertex) {
    vertex.on("mousedown", (event: KonvaMouseEvent) => {
      this.handleVertexMouseDown(event, vertex);
    });
    vertex.on("mouseup", (event: KonvaMouseEvent) => {
      this.handleVertexMouseUp(event, vertex);
    });
    vertex.on("dragmove", (event: KonvaMouseEvent) => {
      this.handleVertexDrag(event, vertex);
    });
  }

  toolbarStateChanged(stateChanged: { state: string }) {
    const selectedTool = stateChanged.state;
    this.clearHandlers();

    this.vertexManager.disableDrag();
    this.edgeManager.disableRemove();
    if (selectedTool == "Vertex") {
      this.handleClick = this.createVertex;
    } else if (selectedTool == "Edge") {
      this.handleMouseUp = () => this.edgeManager.removeCurrentEdge();
      this.handleMouseMove = (event: KonvaMouseEvent) => {
        this.edgeManager.moveCurrentEdge(event);
      };
      this.handleVertexMouseDown = (event: KonvaMouseEvent) => {
        if (!isLeftClick(event)) return;
        else this.edgeManager.startDrawing(event);
      };
      this.handleVertexMouseUp = (event: KonvaMouseEvent) =>
        this.edgeManager.create(event);
    } else if (selectedTool == "Custom") {
      this.vertexManager.enableDrag();
      this.handleClick = this.createVertex;
      this.handleMouseUp = () => this.edgeManager.removeCurrentEdge();
      this.handleMouseMove = (event: KonvaMouseEvent) => {
        this.edgeManager.moveCurrentEdge(event);
      };
      this.handleVertexMouseDown = (event: KonvaMouseEvent) => {
        if (!isLeftClick(event)) this.edgeManager.startDrawing(event);
      };
      this.handleVertexMouseUp = (event: KonvaMouseEvent) =>
        this.edgeManager.create(event);
      this.handleVertexDrag = (event: KonvaMouseEvent) =>
        this.edgeManager.dragEdges(event);
    } else if (selectedTool == "Select") {
      this.vertexManager.enableDrag();
      this.handleVertexDrag = (event: KonvaMouseEvent) =>
        this.edgeManager.dragEdges(event);
    } else if (selectedTool == "Erase") {
      this.handleVertexMouseDown = (__, vertex: Vertex) => {
        this.edgeManager.remove(vertex.edges);
        this.vertexManager.remove(vertex);
      };
      this.handlePencilMouseDown = (__, pencil: Pencil) =>
        this.pencilManager.remove(pencil);
      this.edgeManager.enableRemove();
    } else if (selectedTool == "Pencil") {
      this.handleMouseDown = (event: KonvaMouseEvent) => {
        this.startPencil(event);
      };
      this.handleMouseMove = (event: KonvaMouseEvent) => {
        this.movePencil(event);
      };
      this.handleMouseUp = () => {
        this.pencilManager.finishDrawing();
      };
    }
  }
  clearHandlers() {
    this.handleMouseMove = () => {};
    this.handleMouseDown = () => {};
    this.handleMouseUp = () => {};
    this.handleClick = () => {};
    this.handleVertexMouseUp = () => {};
    this.handleVertexMouseDown = () => {};
    this.handleVertexDrag = () => {};
    this.handlePencilMouseDown = () => {};
  }

  createVertex(event: KonvaMouseEvent) {
    if (!isLeftClick(event)) return;
    const mousePos = this.stage.getPointerPosition();
    const vertexConfig = this.vertexManager.getConfig(mousePos);
    const vertex = this.vertexManager.create(vertexConfig);
    this.bindVertexEvents(vertex);
    this.vertexManager.draw(vertex);
  }

  startPencil(event: KonvaMouseEvent) {
    if (!isLeftClick(event)) return;
    const mousePos = this.stage.getPointerPosition();
    const pencilConfig = this.pencilManager.defualtConfig;
    const pencil = this.pencilManager.create(mousePos, pencilConfig);
    pencil.on("mousedown", (event: KonvaMouseEvent) => {
      this.handlePencilMouseDown(event, pencil);
    });
  }

  movePencil(event: KonvaMouseEvent) {
    if (!isLeftClick(event)) return;
    const mousePos = this.stage.getPointerPosition();
    this.pencilManager.appendPoint(mousePos);
  }

  configLayers() {
    this.stage.add(this.pencilLayer);
    this.stage.add(this.edgesLayer);
    this.edgesLayer.moveToTop();
    this.stage.add(this.vertexLayer);
    this.vertexLayer.moveToTop();
  }

  receiveVertex(config: VertexConfig) {
    const vertex = this.vertexManager.create(config);
    this.bindVertexEvents(vertex);
    this.vertexManager.draw(vertex);
  }
}
</script>

<style scoped></style>
