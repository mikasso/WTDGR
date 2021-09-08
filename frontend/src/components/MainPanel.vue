<template>
  <el-container class="wrapper">
    <el-header class="header" height="55px">
      <Toolbar @add-layer="addLayer()" />
    </el-header>

    <el-container>
      <el-main class="main" style="padding: 0px;">
        <Board ref="boardComponentRef" />
      </el-main>

      <el-aside class="aside" width="250px">userzy </el-aside>
    </el-container>
  </el-container>
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
</style>
