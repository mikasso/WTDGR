<template>
  <el-dialog v-model="dialogVisible" width="40%" center>
    <el-row class="main-row">
      <el-col :span="12" class="col-left">
        <p style="font-size: 20px">Import graph</p>
        <a v-on:click="download()" :href="myUrl" download="elo.gdf">DOWNLOAD</a>
      </el-col>
      <el-col :span="12" class="col-right">
        <p style="font-size: 20px">Export graph</p>
        <input type="file" @change="previewFiles" multiple />
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { key, State } from "../store";
import { getFormater } from "../js/Utils/FileUtils";
import BoardHub from "../js/SignalR/Hub";
export default defineComponent({
  name: "WelcomeWindow",
  setup(props, { emit }) {
    const store = useStore<State>(key);
    let hub: BoardHub | undefined;
    return {
      store,
      emit,
      hub,
    };
  },
  data() {
    return {
      dialogVisible: false,
      myUrl: "",
    };
  },
  methods: {
    download: function() {
      const formater = getFormater(this.hub!, "gdf");
      this.myUrl = formater.exportStage();
    },
    previewFiles(event: any) {
      const formater = getFormater(this.hub!, "gdf");
      formater.importStage(event!.target.files[0]);
    },
  },
});
</script>

<style scoped>
.col-left {
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  padding: 25px 25px 25px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.col-right {
  padding: 25px 0 25px 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>
