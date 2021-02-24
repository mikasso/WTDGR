<template>
  <div id="app">
    <MainPanel msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>

import MainPanel from './components/MainPanel.vue'
export default {
  name: 'App',
  components: {
    MainPanel
  }
}
</script>

<style>
html, body{
  min-height: 100%;
}
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
