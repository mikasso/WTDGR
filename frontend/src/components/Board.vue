<template>
  <div id="root">
    <div id="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script>
import BoardEventManager from "../js/board_event_manager";
import BoardManager from "../js/board_manager";
import ApiManager from "../js/api_manager";
import BoardHub from "../js/SignalR/hub";
import { ActionFactory } from "../js/action";
export default {
  name: "Board",
  props: {
    toolbar: {
      default: null,
    },
  },
  data() {
    return {
      boardManager: null,
      eventManager: null,
      apiManager: null,
      user: { userId: Math.random().toString(), roomId: "1" },
    };
  },
  mounted() {
    const isOffline = false;
    this.boardManager = new BoardManager(this);
    this.eventManager = new BoardEventManager(
      this.boardManager,
      new ActionFactory(this.user.userId),
      isOffline
    );
    this.boardManager.boardEventManager = this.eventManager;

    this.boardManager.boardEventManager.bindStageEvents(
      this.boardManager.stage
    );

    this.apiManager = new ApiManager(this.boardManager);

    this.hub = new BoardHub(this.apiManager, this.user);
    this.eventManager.hub = this.hub;
    if (isOffline === false) this.hub.joinRoom();
  },
  methods: {
    toolbarButton(buttonName) {
      this.eventManager.toolbarButton(buttonName);
    },
    toolbarSelect(selected) {
      this.eventManager.toolbarSelect(selected);
    },
    toolChanged(toolName) {
      this.eventManager.toolChanged(toolName);
    },
    blockContextMenu: function(e) {
      e.preventDefault(); //disable context menu when right click
    },
    sendLayerStateToToolbar(layerState) {
      this.$emit("layerStateChange", layerState);
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
