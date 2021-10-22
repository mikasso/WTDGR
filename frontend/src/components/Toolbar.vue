<template>
  <el-row justify="space-between" align="middle" style="height: 100%">
    <div style="display: flex; align-items: center;">
      <el-tooltip
        v-for="(tool, index) in toolbar.tools"
        :key="index"
        :hide-after="0"
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

      <el-dropdown split-button :hide-on-click="false" v-if="layers != null">
        {{ currentLayer }}
        <template #dropdown>
          <el-dropdown-menu class="drop-menu">
            <draggable
              :list="layers"
              @change="layersSwaped($event)"
              tag="transition-group"
              handle=".handle"
              :item-key="(element) => element"
            >
              <template #item="{element}">
                <div
                  class="layer-item noselect"
                  @mouseover="highlightLayer(element, true)"
                  @mouseleave="highlightLayer(element, false)"
                  :class="{
                    selected: currentLayer == element,
                    first: layers[0] == element,
                    last: layers[layers.length - 1] == element,
                  }"
                >
                  <img
                    v-if="layers.length > 1"
                    class="handle"
                    :src="require('../assets/tools/d-caret.svg')"
                  />
                  <span
                    style="cursor: pointer"
                    @click="currentLayer = element"
                    >{{ element }}</span
                  >
                  <img
                    v-if="layers.length > 1"
                    class="delete"
                    @click="removeLayer(element)"
                    :src="require('../assets/buttons/delete.svg')"
                  />
                </div>
              </template>
            </draggable>
            <el-button class="layerButton" @click="addLayer()">
              <strong>Add layer</strong>
            </el-button>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div style="display: flex; align-items: center;">
      <el-button @click="openFileHandler" style="margin-right: 15px">
        Import / Export graph
      </el-button>
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
import Konva from "konva";
import { ClassNames } from "../js/KonvaManager/ClassNames";
import { Vertex } from "../js/KonvaManager/VertexManager";

interface layerData {
  id: string;
  zIndex: number;
}

export default defineComponent({
  name: "Toolbar",
  emits: ["toolbarAction"],
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
        emit("toolbarAction", {
          type: "reorderLayers",
          value: layers,
        });
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
      emit("toolbarAction", {
        type: "addLayer",
        value: null,
      });
    };

    let hover = false;

    return {
      layers,
      currentLayer,
      isOnline,
      currentTool,
      addLayer,
      hover,
      emit,
      store,
    };
  },
  mounted() {
    this.currentTool = "Select";
  },
  data: () => ({
    toolbar: {
      tools: [
        { name: "Select", file: "Select.png" },
        { name: "Vertex", file: "Vertex.png" },
        { name: "Edge", file: "Edge.png" },
        { name: "Pencil", file: "Pencil.png" },
        { name: "Erase", file: "Erase.png" },
      ],

      vertex_styles: ["circle"],
      vertex_style: "circle",

      edge_styles: ["line"],
      edge_style: "line",
    },
    drag: false,
  }),
  methods: {
    highlightLayer(layerId: string, on: boolean) {
      this.emit("toolbarAction", {
        type: on ? "highlightLayerOn" : "highlightLayerOff",
        value: layerId,
      });
    },
    removeLayer(layerId: string) {
      this.emit("toolbarAction", {
        type: "removeLayer",
        value: layerId,
      });
    },
    layersSwaped(event: any) {
      this.emit("toolbarAction", {
        type: "reorderLayers",
        value: {
          index1: event!.moved.oldIndex,
          index2: event!.moved.newIndex,
        },
      });
    },
    openFileHandler() {
      this.emit("toolbarAction", {
        type: "openFileHandler",
      });
    },
  },
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
.layerButton {
  padding: 12px 12px;
  margin: 0px 10px;
  margin-top: 15px;
}
.layer-item {
  margin: 0px 10px;
  padding: 12px 8px;
  width: 100px;
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
.delete {
  float: left;
  width: 16px;
  height: 16px;
  margin-left: 3px;
  cursor: pointer;
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
.drop-menu {
  display: flex;
  justify-content: center;
  flex-direction: column;
}
.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
