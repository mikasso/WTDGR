<template>
  <el-row justify="space-between" align="middle" style="height: 100%">
    <div style="display: flex; align-items: center;">
      <el-tooltip
        v-for="(tool, index) in toolbar.tools"
        :key="index"
        effect="dark"
        :content="tool.name"
        placement="bottom"
      >
        <el-button
          :class="{ selectedTool: tool.name == currentTool }"
          class="tool"
          @click="currentTool = tool.name"
        >
          <img class="toolImg" :src="require('../assets/tools/' + tool.file)" />
        </el-button>
      </el-tooltip>

      <el-button class="layerButton" @click="addLayer()">
        <strong>Add layer</strong>
      </el-button>

      <el-dropdown split-button :hide-on-click="false" v-if="layers != null">
        {{ currentLayer }}
        <template #dropdown>
          <el-dropdown-menu>
            <draggable
              v-model="layers"
              tag="transition-group"
              handle=".handle"
              :item-key="(element) => element"
            >
              <template #item="{element}">
                <div
                  class="layer-item"
                  :class="{
                    selected: currentLayer == element,
                    first: layers[0] == element,
                    last: layers[layers.length - 1] == element,
                  }"
                >
                  <img
                    class="handle"
                    :src="require('../assets/tools/d-caret.svg')"
                  />
                  <span
                    style="cursor: pointer"
                    @click="currentLayer = element"
                    >{{ element }}</span
                  >
                </div>
              </template>
            </draggable>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div style="display: flex; align-items: center;">
      <el-tag v-if="!isOnline" class="connBadge" type="danger"
        >Disconnected</el-tag
      >
      <el-tag v-if="isOnline" class="connBadge" type="success"
        >Connected</el-tag
      >
      <el-button-group class="connButtons">
        <el-button @click="isOnline = true">
          Connect
        </el-button>
        <el-button @click="isOnline = false">
          Disconnect
        </el-button>
      </el-button-group>
    </div>
  </el-row>
</template>

<script lang="ts">
import { key, State } from "@/store";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import draggable from "vuedraggable";
import "element-plus/dist/index.css";

interface layerData {
  id: string;
  zIndex: number;
}

export default defineComponent({
  name: "Toolbar",
  emits: ["addLayer", "layersReordered"],
  components: {
    draggable,
  },
  setup(props, { emit }) {
    console.log("Toolbar setup");
    const store = useStore<State>(key);

    const layers = computed({
      get: function() {
        const tempLayers: layerData[] = [];
        for (const layer of store.state.layers)
          tempLayers.push({ id: layer.id(), zIndex: layer.zIndex() });
        return tempLayers
          .sort((layer1, layer2) => layer2.zIndex - layer1.zIndex)
          .map((layer) => layer.id);
      },
      set: function(layers: string[]) {
        emit("layersReordered", layers);
      },
    });

    const currentLayer = computed({
      get: function() {
        if (store.state.currentLayer == null) return "None";
        return store.state.currentLayer.attrs.id;
      },
      set: function(layerId: string) {
        var layer = store.state.layers.find(
          (layer) => layer.attrs.id === layerId
        );
        store.commit("setCurrentLayer", layer);
      },
    });

    const isOnline = computed({
      get: function() {
        return store.state.isOnline;
      },
      set: function(value: boolean) {
        if (value) store.commit("setOnline");
        else store.commit("setOffline");
      },
    });

    const currentTool = computed({
      get: function() {
        return store.state.currentTool;
      },
      set: function(tool: string) {
        store.commit("setCurrentTool", tool);
      },
    });

    const addLayer = () => {
      emit("addLayer");
    };

    let drag = false;

    return {
      layers,
      currentLayer,
      isOnline,
      currentTool,
      addLayer,
      drag,
    };
  },
  mounted() {
    this.currentTool = "Select";
  },
  data: () => ({
    toolbar: {
      tools: [
        { name: "Select", file: "select.svg" },
        { name: "Vertex", file: "vertex.svg" },
        { name: "Edge", file: "edge.svg" },
        { name: "Pencil", file: "pencil.svg" },
        { name: "Erase", file: "erase.svg" },
      ],

      vertex_styles: ["circle"],
      vertex_style: "circle",

      edge_styles: ["line"],
      edge_style: "line",
    },
  }),
});
</script>
<style scoped lang="scss">
.tool {
  margin-left: 3px;
  margin-right: 12px;
  padding: 1px 5px;
  .toolImg {
    width: 30px;
    height: 30px;
  }
}
.selectedTool {
  border: 2px black solid;
  margin-right: 11px;
  margin-left: 2px;
}
.layerButton {
  margin-left: 40px;
  margin-right: 10px;
  padding: 12px 12px;
}
.connButtons {
  margin-left: 10px;
  .el-button {
    padding: 0px 8px;
    font-size: 12px;
    width: 80px;
  }
}
.el-dropdown-menu {
  background-color: #f6f6f6;
}
.layer-item {
  margin: 0px 10px;
  padding: 12px 10px;
  width: 80px;
  border: 1px lightgray solid;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-size: 14px;
}
.handle {
  float: left;
  width: 16px;
  height: 16px;
  margin-right: 3px;
}
.selected {
  border: 1px blue solid;
}
.first {
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}
.last {
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}
</style>
