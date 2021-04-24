<template>
  <div id="root">
    <button v-on:click="createRoom()">Create room</button>
    <button v-on:click="joinRoom()">Join room</button>
    <div id="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script lang="ts">
import { Hub } from "../ts/SignalR/hub";
import { EdgeManager } from "../ts/Shapes/Edges/edge_manager";
import { VertexManager } from "../ts/Shapes/Vertices/vertex_manager";
import { KonvaMouseEvent } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Component, Vue } from "vue-property-decorator";
import { VertexConfig } from "../ts/Aliases/aliases";
import { isRightClick } from "@/ts/Helpers/functions";

@Component
export default class Board extends Vue {
  name: string = "Board";
  private hub!: any;
  private stage!: Konva.Stage;
  private vertexLayer!: Konva.Layer;
  private edgesLayer!: Konva.Layer;
  private edgeManager!: EdgeManager;
  private vertexManager!: VertexManager;
  mounted() {
    this.hub = new Hub(this);
    this.hub.joinRoom(this.getRandomUserName(), "1");
    // Create and configure stage, layers, to draw
    const stageConfig = {
      container: "board",
      width: window.innerWidth * 0.8,
      height: window.innerHeight * 0.92,
    };
    this.stage = new Konva.Stage(stageConfig);
    this.vertexLayer = new Konva.Layer();
    this.edgesLayer = new Konva.Layer();
    this.configLayers();
    // Create managers objects to manage vertices and lines
    this.edgeManager = new EdgeManager(this.edgesLayer);
    this.vertexManager = new VertexManager(this.vertexLayer);
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
  handleClik(event: KonvaMouseEvent) {
    if (isRightClick(event)) return;
    const mousePos = this.stage.getPointerPosition();
    const vertex = this.vertexManager.getConfig(mousePos);
    this.hub.sendVertex(vertex);
  }
  toolbarButton(name: string) {
    console.log("Board: " + name);
  }
  bindStage() {
    this.stage.on("click", (event: KonvaMouseEvent) => this.handleClik(event));

    this.stage.on("mouseup", () => this.edgeManager.handleMouseUp());

    this.stage.on("mousemove", (event: KonvaMouseEvent) =>
      this.edgeManager.handleMouseMove(event)
    );
  }
  configLayers() {
    this.stage.add(this.edgesLayer);
    this.stage.add(this.vertexLayer);
    this.vertexLayer.moveToTop();
  }
  bindVertexEvents(vertex: Konva.Circle) {
    vertex.on("mousedown", (event: KonvaMouseEvent) =>
      this.edgeManager.startDrawing(event)
    );

    vertex.on("mouseup", (event: KonvaMouseEvent) =>
      this.edgeManager.tryToConnectVertices(event)
    );

    vertex.on("dragmove", (event: KonvaMouseEvent) =>
      this.edgeManager.dragEdges(event)
    );
  }
  receiveVertex(config: VertexConfig) {
    const vertex = this.vertexManager.create(config);
    this.bindVertexEvents(vertex);
    this.vertexManager.draw(vertex);
  }
}
</script>

<style scoped>
.stage {
  width: 100%;
  height: 100%;
}
</style>
