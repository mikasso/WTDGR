<template>
  <div id="root">
    <div id="board" @contextmenu="blockContextMenu($event)"></div>
  </div>
</template>

<script>
import BoardEventManager from "../js/board_event_manager"

export default {
  name: "Board",
  props: {
    toolbar: {
      default: null,
    },
  },
  data(){
    return {
      boardManager: null,
      eventManager: null
    }
  },
  mounted(){
    this.eventManager = new BoardEventManager(this)
  },
  methods: {
    toolbarButton(buttonName){
      this.eventManager.toolbarButton(buttonName)
    },
    toolbarSelect(selected){
      this.eventManager.toolbarSelect(selected)
    },
    toolChanged(toolName){
      this.eventManager.toolChanged(toolName)
    },
    blockContextMenu: function(e) {
      e.preventDefault() //disable context menu when right click
    },
    sendLayerStateToToolbar(layerState){
      this.$emit("layerStateChange", layerState)
    }
  },
}
</script>

<style scoped>
.stage {
  width: 100%;
  height: 100%;
}
</style>
