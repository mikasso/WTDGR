<template>
  <div id="root">
    <div id="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script lang="ts">
import OnlineBoardEventManager from "../js/BoardEventManager/OnlineBoardEventManager";
import OfflineBoardEventManager from "../js/BoardEventManager/OfflineBoardEventManager";
import BoardManager from "../js/KonvaManager/BoardManager";
import ApiManager from "../js/SignalR/ApiHandler";
import BoardHub from "../js/SignalR/Hub";
import { ActionFactory } from "../js/SignalR/Action";
import Konva from "konva";
import { computed, defineComponent } from "vue";
import BaseBoardEventManager from "@/js/BoardEventManager/BaseBoardEventManager";
import { useStore } from "vuex";
import { key, State } from "../store";

interface User {
  userId: string;
  roomId: string;
}

interface BoardData {
  eventManager?: BaseBoardEventManager;
  hub?: BoardHub;
}

export default defineComponent({
  name: "Board",
  data() {
    return {} as BoardData;
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
  },
  setup() {
    const store = useStore<State>(key);
    const isOnline = computed(() => {
      return store.state.isOnline;
    });
    const currentTool = computed(() => {
      return store.state.currentTool;
    });
    console.log("Board setup");
    return { store, isOnline, currentTool };
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
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.92,
      });
      initStage.add(initLayer);
      this.store.commit("setStage", initStage);
      this.store.commit("setLayers", [initLayer]);
      this.store.commit("setCurrentLayer", initLayer);
    },
    addLayer() {
      this.eventManager?.addLayer();
    },
    blockContextMenu(e: Event) {
      e.preventDefault(); //disable context menu when right click
    },
  },
});
</script>

<style scoped>
.stage {
  width: 100%;
  height: 100%;
}
</style>
