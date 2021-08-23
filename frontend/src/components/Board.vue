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
      hub: null,
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
    async connectionChanged(isOnline) {
      const boardManager = new BoardManager(this);
      if (isOnline) {
        const apiManager = new ApiManager(boardManager);
        this.hub = new BoardHub(
          apiManager,
          this.user,
          () => {},
          () => {}
        );
        this.eventManager = new OnlineBoardEventManager(
          boardManager,
          this.hub,
          new ActionFactory(this.user.userId)
        );
        await this.hub.joinRoomPromise().catch(async () => {
          alert("Failed to connect with hub, switching to ofline");
          await this.connectionChanged(false);
        });
      } else {
        if (this.hub != null) {
          await this.hub.disconnectPromise();
          this.hub = null;
        }
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
