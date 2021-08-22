<template>
  <div class="main-panel">
    <Toolbar
      ref="ToolbarComponent"
      @buttonPressed="toolbarButton($event)"
      @toolSelected="toolSelected($event)"
      @select="toolbarSelect($event)"
      @toggleConnectionButton="toggleConnectionButton($event)"
    >
    </Toolbar>

    <Board
      class="Board"
      ref="BoardComponent"
      @layerStateChange="layerStateChange($event)"
    >
    </Board>

    <div class="users">
      userzy
    </div>
  </div>
</template>

<script>
import Board from "./Board.vue";
import Toolbar from "./Toolbar.vue";

export default {
  name: "MainPanel",
  mounted() {},

  components: {
    Board,
    Toolbar,
  },

  methods: {
    toolbarButton(name) {
      this.$refs.BoardComponent.toolbarButton(name);
    },
    toolbarSelect(selected) {
      this.$refs.BoardComponent.toolbarSelect(selected);
    },
    toolSelected(toolName) {
      this.$refs.BoardComponent.toolChanged(toolName);
    },
    layerStateChange(layerState) {
      this.$refs.ToolbarComponent.layerStateChanged(layerState);
    },
    toggleConnectionButton(isOnline) {
      console.log("toggle isOnline" + isOnline);
      this.$refs.BoardComponent.connectionChanged(isOnline);
    },
  },
};
</script>

<style scoped lang="scss">
.main-panel {
  width: 100%;
  min-height: 100%;

  display: inline-grid;
  grid-template-columns: auto 20%;
  grid-template-rows: 8% auto;

  .Board {
    grid-column-start: 1;
    grid-column-end: 1;
    grid-row-start: 2;
    grid-row-end: 2;

    height: 100%;
    width: 100%;
  }

  .users {
    grid-column-start: 2;
    grid-column-end: 2;
    grid-row-start: 1;
    grid-row-end: span 2;

    border-left: rgb(140, 140, 140) 2px solid;
  }
}
</style>
