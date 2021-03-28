<template>
  <div id="app">
    <MainPanel msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MainPanel from "./components/MainPanel.vue";

@Component({
  components: {
    MainPanel,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
