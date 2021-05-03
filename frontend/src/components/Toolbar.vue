<template>
  <div class="toolbar">
    <!-- <div class='menu'>
              górne menu
          </div> -->
    <div class="tools">
      <div
        v-for="(tool, index) in toolbar.tools"
        v-bind:key="index"
        class="tool"
        :class="{ selected: tool == toolbar.selected_tool }"
        @click="
          toolbar.selected_tool = tool;
          stateChanged();
        "
      >
        <img :src="require('../assets/tools/' + tool + '.png')" />
        {{ tool }}
      </div>

      <div class="tool" style="margin-left:15px;" @click="stateChanged()">
        <img src="../assets/buttons/undo.png" />
        Undo
      </div>
      <div class="tool" style="margin-right:15px;" @click="stateChanged()">
        <img src="../assets/buttons/redo.png" />
        Redo
      </div>

      Vertex style:
      <select
        class="select"
        v-model="toolbar.vertex_style"
        @change="stateChanged()"
      >
        <option
          v-for="(style, index) in toolbar.vertex_styles"
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
        v-model="toolbar.edge_style"
        @change="stateChanged()"
      >
        <option
          v-for="(style, index) in toolbar.edge_styles"
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
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toolbar",
  mounted() {
    this.$emit("input", this.toolbar);
    //this.stateChanged();
  },
  data: () => ({
    toolbar: {
      selected_tool: "Select",
      tools: [
        "Select",
        "Vertex",
        "Edge",
        "Custom",
        "Path",
        "Star",
        "Erase",
        "Label",
        "Pencil"
      ],

      vertex_styles: ["circle", "smallcircle"],
      vertex_style: "circle",

      edge_styles: ["line", "dashed"],
      edge_style: "line",

      directions: ["undirected", "forward", "backwords"],
      direction: "undirected",
    },
  }),

  watch: {
    toolbar: function() {
      this.$emit("imput", this.toolbar);
    },
  },

  methods: {
    stateChanged() {
      this.$emit("stateChanged", { state: this.toolbar.selected_tool });
    },
  },
};
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
    width: 100%;
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
