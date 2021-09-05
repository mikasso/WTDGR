<template>
  <div id="app">
    <MainPanel />
  </div>
</template>

<script lang="ts">
import MainPanel from "./components/MainPanel.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    MainPanel,
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
