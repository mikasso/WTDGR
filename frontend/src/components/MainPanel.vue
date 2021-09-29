<template>
  <el-container class="wrapper">
    <el-header class="header" height="55px">
      <Toolbar
        @layers-reordered="reorderLayers($event)"
        @add-layer="addLayer()"
      />
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

      <el-aside class="aside" width="250px">userzy </el-aside>
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

interface User {
  userId: string;
  roomId: string;
}

interface BoardData {
  eventManager?: BaseBoardEventManager;
  hub?: BoardHub;
}

export default defineComponent({
  name: "MainPanel",
  data() {
    return {} as BoardData;
  },
  components: {
    Toolbar,
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
      handler(newWidth: number, oldWidth: number) {
        const diff = oldWidth - newWidth;
        const stage = this.store.state.stage;
        const updatedWidth = stage!.width() - diff;
        stage!.size({
          width: updatedWidth,
          height: stage!.height(),
        });
      },
    },
    windowHeight: {
      handler(newHeight: number, oldHeight: number) {
        const diff = oldHeight - newHeight;
        const stage = this.store.state.stage;
        const updatedHeight = stage!.height() - diff;
        stage!.size({
          width: stage!.width(),
          height: updatedHeight,
        });
      },
    },
  },
  setup() {
    const store = useStore<State>(key);
    const { width, height } = useWindowSize();
    const isOnline = computed(() => {
      return store.state.isOnline;
    });
    const currentTool = computed(() => {
      return store.state.currentTool;
    });
    return {
      store,
      isOnline,
      currentTool,
      windowWidth: width,
      windowHeight: height,
    };
  },
  mounted() {
    this.handleConnectionChange(this.isOnline);
  },
  methods: {
    handleConnectionChange(isOnline: boolean) {
      this.initalizeStageAndLayers();
      const boardManager = new BoardManager(this.store);
      if (isOnline) {
        const apiManager = new ApiManager(boardManager, this.store);
        const hub = new BoardHub(apiManager, this.store);
        this.eventManager = new OnlineBoardEventManager(
          boardManager,
          this.store,
          hub,
          new ActionFactory(this.store.state.user.userId, boardManager)
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
    addLayer() {
      this.eventManager?.addLayer();
    },
    reorderLayers(layers: string[]) {
      this.eventManager?.reorderLayers(layers);
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
