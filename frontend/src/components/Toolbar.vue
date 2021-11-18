<template>
  <el-row justify="space-between" align="middle" style="height: 100%">
    <div style="display: flex; align-items: center">
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

      <el-dropdown
        split-button
        :hide-on-click="false"
        v-if="layers != null"
        style="margin-right: 15px"
      >
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
              <template #item="{ element }">
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
            <el-button
              class="layerButton"
              @click="addLayer()"
              v-bind:disabled="layers.length >= MaxLayersCount"
            >
              <strong>Add layer</strong>
            </el-button>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-dropdown split-button :hide-on-click="false">
        Styles
        <template #dropdown>
          <el-dropdown-menu class="drop-menu styles-menu">
            <el-row>
              <el-col class="center" :span="8"> Size: </el-col>
              <el-col :span="16" class="center">
                <el-button
                  v-for="(style, index) in styles.vertex.size"
                  @click="styleSelected(style, 'vertex', styles.vertex.size)"
                  class="style-button"
                  :class="{ styleSelected: style.selected }"
                  :key="index"
                >
                  <img :src="require('../assets/buttons/' + style.file)"
                /></el-button>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px">
              <el-col class="center" :span="8"> Vertex color: </el-col>
              <el-col :span="16">
                <el-row style="justify-content: center">
                  <el-col
                    :span="4"
                    v-for="(style, index) in styles.vertex.fill"
                    :key="index"
                  >
                    <div
                      @click="
                        styleSelected(style, 'vertex', styles.vertex.fill)
                      "
                      class="color-button"
                      :style="'background-color:' + style.settings.fill"
                      :class="{ colorSelected: style.selected }"
                    ></div>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <el-row style="margin-top: 10px">
              <el-col class="center" :span="8"> Pencil color: </el-col>
              <el-col :span="16">
                <el-row style="justify-content: center">
                  <el-col
                    :span="4"
                    v-for="(style, index) in styles.pencil.fill"
                    :key="index"
                  >
                    <div
                      @click="
                        styleSelected(style, 'pencil', styles.pencil.fill)
                      "
                      class="color-button"
                      :style="'background-color:' + style.settings.fill"
                      :class="{ colorSelected: style.selected }"
                    ></div>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button @click="openFileHandler" class="import-btn">
        Import / Export graph
      </el-button>
    </div>

    <div style="display: flex; align-items: center">
      <el-tag class="connBadge" v-bind:type="connectionColorType">
        {{ hubState }}
      </el-tag>
      <el-button class="conn-btn">
        <img
          @click="openWelcomeWindow"
          class="conn-icon"
          :src="require('../assets/buttons/setting.svg')"
      /></el-button>
    </div>
  </el-row>
</template>

<script lang="ts">
import { key, State } from "@/store";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import draggable from "vuedraggable";
import "element-plus/dist/index.css";
import { HubConnectionState } from "@microsoft/signalr";
import BoardManager from "../js/KonvaManager/BoardManager";
import { MaxLayersCount } from "../js/BoardEventManager/utils";
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
    const store = useStore<State>(key);
    const boardManager = BoardManager.getBoardManager();

    const layers = computed({
      get: function () {
        const tempLayers: layerData[] = [];
        for (const layer of store.state.layers)
          tempLayers.push({ id: layer.id(), zIndex: layer.zIndex() });
        return tempLayers
          .sort((layer1, layer2) => layer2.zIndex - layer1.zIndex)
          .map((layer) => layer.id);
      },
      set: function (layers: string[]) {
        emit("toolbarAction", {
          type: "reorderLayers",
          value: layers,
        });
      },
    });

    const currentLayer = computed({
      get: function () {
        if (store.state.currentLayer == null) return "None";
        return store.state.currentLayer.attrs.id;
      },
      set: function (layerId: string) {
        var layer = store.state.layers.find(
          (layer) => layer.attrs.id === layerId
        );
        store.commit("setCurrentLayer", layer);
      },
    });

    const isOnline = computed(() => store.state.isOnline);
    const hubState = computed(() => store.state.connectionState);

    const connectionColorType = computed(function () {
      switch (store.state.connectionState) {
        case HubConnectionState.Connected:
          return "success";
        default:
          return "danger";
      }
    });

    const currentTool = computed({
      get: function () {
        return store.state.currentTool;
      },
      set: function (tool: string) {
        store.commit("setCurrentTool", tool);
      },
    });

    const roomId = computed(() => store.state.roomId);
    const userId = computed(() => store.state.user.id);
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
      hubState,
      connectionColorType,
      hover,
      roomId,
      userId,
      emit,
      store,
      boardManager,
    };
  },
  mounted() {
    this.currentTool = "Select";
  },
  data: () => ({
    MaxLayersCount: MaxLayersCount,
    toolbar: {
      tools: [
        { name: "Select", file: "Select.png" },
        { name: "Vertex", file: "Vertex.png" },
        { name: "Edge", file: "Edge.png" },
        { name: "Pencil", file: "Pencil.png" },
        { name: "Erase", file: "Erase.png" },
        { name: "Multiselect", file: "Multiselect.png" },
      ],

      vertex_styles: ["circle"],
      vertex_style: "circle",

      edge_styles: ["line"],
      edge_style: "line",
    },
    drag: false,

    styles: {
      vertex: {
        size: [
          {
            file: "small.png",
            settings: { radius: 7 },
          },
          {
            file: "medium.png",
            settings: { radius: 12 },
            selected: true,
          },
          {
            file: "big.png",
            settings: { radius: 18 },
          },
        ],
        fill: [
          { settings: { fill: "#000" } },
          { settings: { fill: "#A8A8A8" }, selected: true },
          { settings: { fill: "#880015" } },
          { settings: { fill: "#ed1c24" } },
          { settings: { fill: "#ff7f27" } },
          { settings: { fill: "#FFF000" } },
          { settings: { fill: "#FFFFFF" } },
          { settings: { fill: "#22b14c" } },
          { settings: { fill: "#00a2e8" } },
          { settings: { fill: "#3f48c8" } },
          { settings: { fill: "#b97a57" } },
          { settings: { fill: "#b5e617" } },
        ],
      },
      pencil: {
        fill: [
          { settings: { fill: "#000" } },
          { settings: { fill: "#A8A8A8" } },
          { settings: { fill: "#880015" } },
          { settings: { fill: "#ed1c24" }, selected: true },
          { settings: { fill: "#ff7f27" } },
          { settings: { fill: "#FFF000" } },
          { settings: { fill: "#FFFFFF" } },
          { settings: { fill: "#22b14c" } },
          { settings: { fill: "#00a2e8" } },
          { settings: { fill: "#3f48c8" } },
          { settings: { fill: "#b97a57" } },
          { settings: { fill: "#b5e617" } },
        ],
      },
    },
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
    openWelcomeWindow() {
      this.emit("toolbarAction", { type: "openWelcomeWindow" });
    },
    styleSelected(style: any, category: string, subcategory: any) {
      if (category == "vertex") {
        for (const otherStyle of subcategory) otherStyle.selected = false;
        for (const setting in style.settings) {
          if (setting == "radius") {
            this.boardManager.vertexManager.defaultConfig.radius =
              style.settings[setting];
          }
          if (setting == "fill") {
            this.boardManager.vertexManager.defaultConfig.fill =
              style.settings[setting];
          }
        }
      }
      if (category == "pencil") {
        for (const otherStyle of subcategory) otherStyle.selected = false;
        for (const setting in style.settings) {
          if (setting == "fill") {
            this.boardManager.pencilManager.defualtConfig.stroke =
              style.settings[setting];
          }
        }
      }
      style.selected = true;
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
.import-btn {
  margin: 0px 10px;
}
.connBadge {
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  padding-top: 3px;
  height: 36px;
  font-size: 0.9em;
}
.conn-btn {
  margin-left: 0px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  height: 36px;
  min-height: 36px;
  width: 36px;
  padding: 5px;
  padding-top: 7px;
  .conn-icon {
    width: 21px;
    height: 21px;
  }
}
.styles-menu {
  width: 400px;
  font-size: 1.1rem;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.style-button {
  padding: 0px;
  width: 50px;
  height: 50px;
  margin-left: 5px;
}
.color-button {
  padding: 0px;
  width: 25px;
  height: 25px;
  margin: 2px;
  border: 2px gray solid;
}
.styleSelected {
  border: 2px black solid;
}
.colorSelected {
  border: 3px #111 solid;
  margin: 1px;
}
</style>
