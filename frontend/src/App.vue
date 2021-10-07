<template>
  <MainPanel />
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
body {
  margin: 0px;
  min-height: 100vh;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  overflow-y: hidden;
}
#app {
  min-height: 100vh;
}
</style>
