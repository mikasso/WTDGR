<template>
  <div class="toolbar">
    <div class="tools">
      <div
        v-for="(tool, index) in toolbar.tools"
        :key="index"
        class="tool"
        :class="{ selected: tool == currentTool }"
        @click="currentTool = tool"
      >
        <img :src="require('../assets/tools/' + tool + '.png')" />
        {{ tool }}
      </div>

      <div class="tool" style="margin-left:15px" @click="addLayer()">
        Add layer
      </div>

      Layer:
      <select
        v-if="currentLayer"
        v-model="currentLayer"
        class="select"
        :sync="true"
      >
        <option
          v-for="(layer, index) in layers"
          :key="index"
          :value="layer"
          :sync="true"
        >
          {{ layer }}
        </option>
      </select>
      <span> Connection: </span>
      <Toggle v-model="isOnline" :sync="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { key, State } from "@/store";
import Toggle from "@vueform/toggle";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "Toolbar",
  emits: ["addLayer"],
  components: { Toggle },
  setup(props, { emit }) {
    console.log("Toolbar setup");
    const store = useStore<State>(key);

    const layers = computed(() => {
      return store.state.layers.map((layer) => layer.attrs.id);
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

    return {
      layers,
      currentLayer,
      isOnline,
      currentTool,
      addLayer,
    };
  },
  mounted() {
    this.currentTool = "Select";
  },
  data: () => ({
    toolbar: {
      tools: ["Select", "Vertex", "Edge", "Pencil", "Erase"],

      vertex_styles: ["circle"],
      vertex_style: "circle",

      edge_styles: ["line"],
      edge_style: "line",
    },
  }),
});
</script>
<style src="@vueform/toggle/themes/default.css"></style>
<style scoped lang="scss">
span {
  margin-right: 1em;
}
.toolbar {
  grid-column-start: 1;
  grid-column-end: 1;
  grid-row-start: 1;
  grid-row-end: 1;
  height: 7vh;
  white-space: nowrap;
  color: black;

  padding: 5px;
  background-color: rgb(250, 250, 250);
  border-bottom: rgb(180, 180, 180) 1px solid;

  .tools {
    width: 100%;
    height: 100%;

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
