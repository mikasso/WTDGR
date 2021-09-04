<template>
  <div class="toolbar">
    <div class="tools">
      <div
        v-for="(tool, index) in toolbar.tools"
        v-bind:key="index"
        class="tool"
        :class="{ selected: tool == selectedTool }"
        @click="selectedTool = tool"
      >
        <img :src="require('../assets/tools/' + tool + '.png')" />
        {{ tool }}
      </div>

      <div class="tool" style="margin-left:15px" @click="addLayer()">
        Add layer
      </div>

      Layer:
      <select
        class="select"
        v-if="currentLayer"
        v-model="currentLayer"
        :sync="true"
      >
        <option
          v-for="(layer, index) in layers"
          v-bind:key="index"
          :value="layer"
          :sync="true"
        >
          {{ layer }}
        </option>
      </select>
      Connection:
      <Toggle v-model="isOnline" v-bind="isOnline"></Toggle>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  data: () => ({
    selectedTool: "Select",
    toolbar: {
      tools: ["Select", "Vertex", "Edge", "Pencil", "Erase"],

      vertex_styles: ["circle"],
      vertex_style: "circle",

      edge_styles: ["line"],
      edge_style: "line",
    },
  }),
  computed: {
    layers: {
      get() {
        return this.$store.state.layers.map((layer) => layer.attrs.id);
      },
    },
    currentLayer: {
      get() {
        if (this.$store.state.currentLayer == null) return "Loading..";
        return this.$store.state.currentLayer.attrs.id;
      },
      set(layerId) {
        var layer = this.$store.state.layers.find(
          (layer) => layer.attrs.id === layerId
        );
        this.$store.commit("setCurrentLayer", layer);
      },
    },
    isOnline: {
      get() {
        return this.$store.state.isOnline;
      },
      set(value) {
        if (value) this.$store.commit("setOnline");
        else this.$store.commit("setOffline");
      },
    },
  },
  watch: {
    selectedTool: function() {
      this.$emit("toolSelected", this.selectedTool);
    },
  },

  methods: {
    addLayer() {
      this.$emit("addLayer");
    },
    handleSelect(type, value) {
      this.$emit("select", { type: type, value: value });
    },
  },
};
</script>

<style scoped lang="scss">
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
