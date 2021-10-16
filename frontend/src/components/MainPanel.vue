<template>
  <el-container class="wrapper">
    <WelcomeWindow @connectionResult="handleConnection($event)"></WelcomeWindow>
    <el-header class="header" height="55px">
      <Toolbar @toolbarAction="handleToolbarAction($event)" />
    </el-header>

    <el-container>
      <el-main class="main" style="padding: 0px;">
        <div id="root">
          <div
            id="board"
            ref="boardComponentRef"
            @contextmenu="blockContextMenu($event)"
          />
        </div>
      </el-main>

      <el-aside class="aside" width="250px"><UsersList></UsersList></el-aside>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import OnlineBoardEventManager from "../js/BoardEventManager/OnlineBoardEventManager";
import OfflineBoardEventManager from "../js/BoardEventManager/OfflineBoardEventManager";
import BoardManager from "../js/KonvaManager/BoardManager";
import ApiManager from "../js/SignalR/ApiHandler";
import BoardHub from "../js/SignalR/Hub";
import { ActionFactory } from "../js/SignalR/Action";
import Konva from "konva";
import BaseBoardEventManager from "@/js/BoardEventManager/BaseBoardEventManager";
import { useStore } from "vuex";
import { key, State } from "../store";
import { useWindowSize } from "vue-window-size";
import Toolbar from "./Toolbar.vue";
import WelcomeWindow from "./WelcomeWindow.vue";
import UsersList from "./UsersList.vue";

interface BoardData {
  eventManager?: BaseBoardEventManager;
  hub?: BoardHub;
}

interface toolbarAction {
  type: string;
  value: any;
}

export default defineComponent({
  name: "MainPanel",
  data() {
    return {} as BoardData;
  },
  components: {
    Toolbar,
    WelcomeWindow,
    UsersList,
  },
  watch: {
    isOnline: {
      deep: true,
      handler(isOnline: boolean) {
        this.handleConnectionChange(isOnline);
      },
    },
    currentTool: {
      deep: true,
      handler(tool: string) {
        this.eventManager?.toolChanged(tool);
      },
    },
    windowWidth: {
      handler(newWindowWidth: number, oldWindowWidth: number) {
        const diff = oldWindowWidth - newWindowWidth;
        const stage = this.store.state.stage;
        const stageWidth = stage!.width() - diff;
        stage!.size({
          width: stageWidth,
          height: stage!.height(),
        });
      },
    },
    windowHeight: {
      handler(newWindowHeight: number, oldWindowHeight: number) {
        const diff = oldWindowHeight - newWindowHeight;
        const stage = this.store.state.stage;
        const stageHeight = stage!.height() - diff;
        stage!.size({
          width: stage!.width(),
          height: stageHeight,
        });
      },
    },
  },
  setup() {
    let connectionStarted = false;
    const store = useStore<State>(key);
    const { width, height } = useWindowSize();
    const isOnline = computed(() => {
      return store.state.isOnline;
    });
    const currentTool = computed(() => {
      return store.state.currentTool;
    });
    return {
      connectionStarted,
      store,
      isOnline,
      currentTool,
      windowWidth: width,
      windowHeight: height,
    };
  },
  mounted() {
    this.initalizeStageAndLayers();
  },
  methods: {
    async handleConnection(connectionResult: any) {
      this.initalizeStageAndLayers();
      if (connectionResult!.type == "join") {
        this.hub = connectionResult!.hub;
        const boardManager = connectionResult!.boardManager;
        this.eventManager = new OnlineBoardEventManager(
          boardManager,
          this.store,
          this.hub as BoardHub,
          new ActionFactory(this.store.state.user.id, boardManager)
        );
        this.store.commit("setOnline");
      }
      if (connectionResult!.type == "offline") {
        const boardManager = new BoardManager(this.store);
        this.eventManager = new OfflineBoardEventManager(
          boardManager,
          this.store
        );
      }
      this.eventManager?.toolChanged(this.currentTool);
      await this.$nextTick();
      this.connectionStarted = true;
    },
    handleConnectionChange(isOnline: boolean) {
      if (!this.connectionStarted) return;
      this.initalizeStageAndLayers();
      const boardManager = new BoardManager(this.store);
      if (isOnline) {
        const apiManager = new ApiManager(boardManager, this.store);
        const hub = new BoardHub(apiManager, this.store);
        this.eventManager = new OnlineBoardEventManager(
          boardManager,
          this.store,
          hub,
          new ActionFactory(this.store.state.user.id, boardManager)
        );
        this.hub = hub;
        this.hub?.joinRoomPromise().catch(async () => {
          alert("Failed to connect with hub, switching to ofline");
        });
      } else {
        if (this.hub !== undefined) {
          this.hub.disconnectPromise().catch(async () => {
            alert("Failed to connect with hub, switching to ofline");
          });
        }
        this.hub = undefined;
        this.eventManager = new OfflineBoardEventManager(
          boardManager,
          this.store
        );
      }

      this.eventManager?.toolChanged(this.currentTool);
    },
    initalizeStageAndLayers() {
      const initLayer = new Konva.Layer({ id: "Layer 1" });
      const initStage = new Konva.Stage({
        container: "board",
        width: this.getWidth(),
        height: this.getHeigth(),
      });
      initStage.add(initLayer);
      this.store.commit("setStage", initStage);
      this.store.commit("setLayers", [initLayer]);
      this.store.commit("setCurrentLayer", initLayer);
    },
    getHeigth() {
      if (document.getElementById("root") == null) return 0;
      else return document.getElementById("root")?.clientHeight;
    },
    getWidth() {
      if (document.getElementById("root") == null) return 0;
      else return document.getElementById("root")?.clientWidth;
    },

    handleToolbarAction(action: toolbarAction) {
      if (action.type == "addLayer") this.addLayer();
      if (action.type == "reorderLayers")
        this.reorderLayers(
          action.value.index1 as number,
          action.value.index2 as number
        );
      if (action.type == "highlightLayerOn")
        this.highlightLayer(action.value as string, true);
      if (action.type == "highlightLayerOff")
        this.highlightLayer(action.value as string, false);
      if (action.type == "removeLayer")
        this.removeLayer(action.value as string);
    },
    addLayer() {
      this.eventManager?.addLayer();
    },
    reorderLayers(index1: number, index2: number) {
      this.eventManager?.reorderLayers(index1, index2);
    },
    removeLayer(layerId: string) {
      this.eventManager?.removeLayer(layerId);
    },
    highlightLayer(layerId: string, on: boolean) {
      this.eventManager?.highlightLayer(layerId, on);
    },
    blockContextMenu(e: Event) {
      e.preventDefault(); //disable context menu when right click
    },
  },
});
</script>

<style scoped lang="scss">
.wrapper {
  min-height: 100vh;
}
.header {
  background-color: #f6f6f6;
}
.aside {
  background-color: #f6f6f6;
  text-align: center;
}
.main {
  border-right: 1px lightgray solid;
  border-top: 1px lightgray solid;
}
#root {
  width: 100%;
  height: 100%;
}
</style>
