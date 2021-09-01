<template>
  <div id="root">
    <div id="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script>
import OnlineBoardEventManager from "../js/BoardEventManager/OnlineBoardEventManager";
import OfflineBoardEventManager from "../js/BoardEventManager/OfflineBoardEventManager";
import BoardManager from "../js/KonvaManager/BoardManager";
import ApiManager from "../js/SignalR/ApiHandler";
import BoardHub from "../js/SignalR/Hub";
import { ActionFactory } from "../js/SignalR/Action";
import { mapGetters } from "vuex";
import Konva from "konva";
export default {
  name: "Board",
  data() {
    return {
      eventManager: null,
      hub: null,
      lastToolSelected: null,
      user: { userId: Math.random().toString(), roomId: "1" },
    };
  },
  computed: {
    ...mapGetters(["isOnline"]),
  },
  watch: {
    isOnline: {
      deep: true,
      handler(isOnline) {
        this.handleConnectionChange(isOnline);
      },
    },
  },
  mounted() {
    this.handleConnectionChange(this.isOnline);
  },
  methods: {
    handleConnectionChange(isOnline) {
      this.initalizeStageAndLayers();
      const boardManager = new BoardManager(this.$store);
      if (isOnline) {
        this.eventManager = this.getOnlineEventManager(boardManager);
        this.switchToOnline(this);
      } else {
        this.eventManager = new OfflineBoardEventManager(
          boardManager,
          this.$store
        );
        this.switchToOffline(this);
      }
      boardManager.eventManager = this.eventManager;

      if (this.lastToolSelected !== null)
        this.eventManager.toolbarSelect(this.lastToolSelected);
    },
    initalizeStageAndLayers() {
      const initLayer = new Konva.Layer({ id: "Layer 1" });
      const initStage = new Konva.Stage({
        container: "board",
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.92,
      });
      initStage.add(initLayer);
      this.$store.commit("setStage", initStage);
      this.$store.commit("setLayers", [initLayer]);
      this.$store.commit("setCurrentLayer", initLayer);
    },
    getOnlineEventManager(boardManager) {
      const apiManager = new ApiManager(boardManager);
      this.hub = new BoardHub(
        apiManager,
        this.user,
        () => this.$store.commit("setOffline"),
        () => this.$store.commit("setOnline")
      );
      return new OnlineBoardEventManager(
        boardManager,
        this.$store,
        this.hub,
        new ActionFactory(this.user.userId, boardManager)
      );
    },
    async switchToOnline(that) {
      that.hub.joinRoomPromise().catch(async () => {
        alert("Failed to connect with hub, switching to ofline");
      });
    },
    async switchToOffline(that) {
      if (that.hub !== null) {
        await that.hub.disconnectPromise();
        that.hub = null;
      }
    },
    addLayer() {
      this.eventManager.addLayer();
    },
    toolbarSelect(selected) {
      this.lastToolSelected = selected;
      this.eventManager.toolbarSelect(selected);
    },
    toolChanged(toolName) {
      this.eventManager.toolChanged(toolName);
    },
    blockContextMenu(e) {
      e.preventDefault(); //disable context menu when right click
    },
  },
};
</script>

<style scoped>
.stage {
  width: 100%;
  height: 100%;
}
</style>
