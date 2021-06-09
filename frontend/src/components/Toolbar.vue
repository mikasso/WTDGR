<template>
  <div class="toolbar" v-if="toolbar">
    <div class="tools">
      <div
        v-for="(tool, index) in toolbar.tools"
        v-bind:key="index"
        class="tool"
        :class="{ selected: tool == toolbar.selectedTool }"
        @click="
          toolbar.selectedTool = tool;
          stateChanged();
        "
      >
        <img :src="require('../assets/tools/' + tool + '.png')" />
        {{ tool }}
      </div>

      <div class="tool" style="margin-left:15px;" @click='toolbar.pushedButton = "Layer"; stateChanged(); toolbar.pushedButton = ""'>
        Add layer
      </div>
      <!-- <div class="tool" style="margin-right:15px;" @click="stateChanged()">
        <img src="../assets/buttons/redo.png" />
        Redo
      </div> -->

      Layer:
      <select
        class="select"
        v-model="toolbar.currentLayer"
        @change="stateChanged()"
      >
        <option
          v-for="(layer, index) in toolbar.layers"
          v-bind:key="index"
          :value="layer"
        >          
          {{ layer }}
        </option>
      </select>

      <!-- Vertex style:
      <select
        class="select"
        v-model="toolbar.vertexStyle"
        @change="stateChanged()"
      >
        <option
          v-for="(style, index) in toolbar.vertexStyles"
          v-bind:key="index"
          :value="style"
        >
          <img :src="require('../assets/vertex_styles/' + style + '.png')" />
          {{ style }}
        </option>
      </select>
      Edge style:
      <select
        class="select"
        v-model="toolbar.edgeStyle"
        @change="stateChanged()"
      >
        <option
          v-for="(style, index) in toolbar.edgeStyles"
          v-bind:key="index"
          :value="style"
        >
          {{ style }}
        </option>
      </select>
      Direction:
      <select
        class="select"
        v-model="toolbar.direction"
        @change="stateChanged()"
      >
        <option
          v-for="(style, index) in toolbar.directions"
          v-bind:key="index"
          :value="style"
        >
          {{ style }}
        </option>
      </select> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Emit, Vue } from "vue-property-decorator";
import {ToolbarObj} from "../ts/Helpers/toolbar"
import { LayerManager, BoardLayer } from "../ts/Layers/BoardLayer";

@Component
export default class Toolbar extends Vue {
  myProperty: string
  name: string =  "Toolbar"
  mounted(){
  }

  toolbar: ToolbarObj = new ToolbarObj();

  @Emit('stateChanged')
  stateChanged(stateChanged: { state: ToolbarObj }) {
    return {state: this.toolbar};
  }

  layersChanged(layerManager: LayerManager){
    this.toolbar.layers = []
    for(var layer of layerManager.boardLayers){
      this.toolbar.layers.push(layer.name)
      
      if(layerManager.currentLayer == layer)
        this.toolbar.currentLayer = layer.name;
    }
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  white-space: nowrap;
  color: black;

  padding: 5px;
  background-color: rgb(250, 250, 250);
  border-bottom: rgb(180, 180, 180) 1px solid;

  .menu {
    width: 100%;
    height: 30%;
  }
  .tools {
    min-width: 100%;
    padding: 5px;

    display: flex;
    justify-content: flex-start;
    align-items: center;

    .tool {
      margin-right: 5px;
      min-width: 50px;
      min-height: 30px;
      padding: 0px 10px;

      background-color: white;
      cursor: pointer;
      &:hover {
        background: rgb(240, 240, 240);
      }

      border: rgb(180, 180, 180) 1px solid;
      border-radius: 4px;

      display: flex;
      justify-content: center;
      align-items: center;

      img {
        max-height: 22px;
        max-width: 22px;

        margin-right: 3px;
      }
    }

    .selected {
      background: rgb(230, 230, 230);
      &:hover {
        background: rgb(230, 230, 230);
      }
    }

    .select {
      border: rgb(170, 170, 170) 1px solid;
      border-radius: 5px;

      min-width: 50px;
      min-height: 30px;

      margin-right: 15px;
      margin-left: 3px;

      img {
        max-height: 18px;
        max-width: 18px;

        margin-right: 3px;
      }
    }
  }
}
</style>