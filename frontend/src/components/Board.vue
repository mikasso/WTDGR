<template>
  <div id="root">
    <div id="board" ref="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script lang="ts">
import { Hub } from "../ts/SignalR/hub";
import { EdgeManager } from "../ts/Shapes/Edges/edge_manager";
import { VertexManager } from "../ts/Shapes/Vertices/vertex_manager";
// eslint-disable-next-line no-unused-vars
import { KonvaMouseEvent } from "@/ts/Aliases/aliases";
import Konva from "konva";
import { Component, Vue } from "vue-property-decorator";
// eslint-disable-next-line no-unused-vars
import { VertexConfig } from "../ts/Aliases/aliases";
import { isLeftClick, isRightClick } from "../ts/Helpers/functions";
@Component({
  props: ["toolbar"],
})
export default class Board extends Vue {
  name: string = "Board";
  private hub!: any;
  private toolbarState!: any;
  private stage!: Konva.Stage;
  private vertexLayer!: Konva.Layer;
  private edgesLayer!: Konva.Layer;
  private edgeManager!: EdgeManager;
  private vertexManager!: VertexManager;

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

  toolbarStateChanged(state: any) {
    this.toolbarState = state.state;
  }

  bindStage() {
    this.stage.on("click", (event: KonvaMouseEvent) => this.handleClick(event));

    this.stage.on("mouseup", (event: KonvaMouseEvent) =>
      this.handleMouseUp(event)
    );

    this.stage.on("mousemove", (event: KonvaMouseEvent) =>
      this.handleMouseMove(event)
    );
  }

  configLayers() {
    this.stage.add(this.edgesLayer);
    this.stage.add(this.vertexLayer);
    this.vertexLayer.moveToTop();
  }

  receiveVertex(config: VertexConfig) {
    const vertex = this.vertexManager.create(config);
    this.bindVertexEvents(vertex);
    this.vertexManager.draw(vertex);
  }

  bindVertexEvents(vertex: Konva.Circle) {
    vertex.on("mousedown", (event: KonvaMouseEvent) => {
      if (this.toolbarState.selected_tool == "Edge") {
        this.edgeManager.startDrawing(event);
      } else if (this.toolbarState.selected_tool == "Select") {
        this.vertexManager.startMoving(vertex);
      } else if (this.toolbarState.selected_tool == "Erase") {
        this.vertexManager.remove(vertex);
      }
    });

    vertex.on("mouseup", (event: KonvaMouseEvent) => {
      if (this.toolbarState.selected_tool == "Edge")
        this.edgeManager.tryToConnectVertices(event);
      else if (
        this.toolbarState.selected_tool == "Vertex" ||
        this.toolbarState.selected_tool == "Select"
      ) {
        this.vertexManager.stopMoving();
      }
    });

    vertex.on("dragmove", (event: KonvaMouseEvent) => {
      if (this.toolbarState.selected_tool == "Select") {
        this.edgeManager.dragEdges(event);
      }
    });
  }

  handleClick(event: KonvaMouseEvent) {
    if (isRightClick(event)) return;
    const mousePos = this.stage.getPointerPosition();
    if (this.toolbarState.selected_tool == "Vertex") {
      const vertex = this.vertexManager.createWithPos(mousePos);
      this.bindVertexEvents(vertex);
      this.vertexManager.draw(vertex);
    }
  }

  handleMouseUp(event: KonvaMouseEvent) {
    if (isRightClick(event)) return;
    if (this.toolbarState.selected_tool == "Select") {
      this.vertexManager.stopMoving();
    } else if (this.toolbarState.selected_tool == "Edge") {
      this.edgeManager.handleMouseUp();
    }
  }

  handleMouseMove(event: KonvaMouseEvent) {
    if (isLeftClick(event)) return;
    // if(this.toolbarState.selected_tool == "Select"){
    //   this.vertexManager.move(this.stage.getPointerPosition()!, this.edgeManager)
    // }
    else if (this.toolbarState.selected_tool == "Edge") {
      this.edgeManager.handleMouseMove(event);
    }
  }
}
</script>

<style scoped></style>
