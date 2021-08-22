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
export default {
  name: "Board",
  props: {
    toolbar: {
      default: null,
    },
  },
  data() {
    return {
      eventManager: null,
      lastToolSelected: null,
      user: { userId: Math.random().toString(), roomId: "1" },
    };
  },
  methods: {
    toolbarButton(buttonName) {
      this.eventManager.toolbarButton(buttonName);
    },
    toolbarSelect(selected) {
      this.lastToolSelected = selected;
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
    connectionChanged(isOnline) {
      const boardManager = new BoardManager(this);
      if (isOnline) {
        const apiManager = new ApiManager(boardManager);
        const hub = new BoardHub(
          apiManager,
          this.user,
          () => {},
          () => {}
        );
        this.eventManager = new OnlineBoardEventManager(
          boardManager,
          hub,
          new ActionFactory(this.user.userId)
        );
        hub.joinRoom();
      } else {
        this.eventManager = new OfflineBoardEventManager(boardManager);
      }
      boardManager.eventManager = this.eventManager;
      if (this.lastToolSelected !== null)
        this.eventManager.toolbarSelect(this.lastToolSelected);
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
