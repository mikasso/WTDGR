<template>
  <div class="main-panel">
    <Toolbar @add-layer="addLayer()" />

    <Board ref="boardComponentRef" />

    <div class="users">
      userzy
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Board from "./Board.vue";
import Toolbar from "./Toolbar.vue";

export default defineComponent({
  name: "MainPanel",
  components: {
    Toolbar,
    Board,
  },
  setup() {
    const boardComponentRef = ref<typeof Board>();
    return { boardComponentRef };
  },
  methods: {
    addLayer() {
      this.boardComponentRef?.addLayer();
    },
  },
});
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
