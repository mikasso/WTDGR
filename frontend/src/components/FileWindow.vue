<template>
  <el-dialog v-model="dialogVisible" width="40%" center>
    <el-row class="main-row">
      <el-col :span="12" class="col-left">
        <p style="font-size: 20px">Export graph</p>
        <el-select
          v-model="exportFormat"
          placeholder="Export format"
          style="margin-bottom: 15px; max-width: 150px"
        >
          <el-option
            v-for="item in exportFormats"
            :key="item"
            :label="item"
            :value="item"
            style="text-align: center"
          />
        </el-select>
        <a
          v-on:click="download()"
          :href="downloadUrl"
          :download="'exported_graph.' + exportFormat"
        >
          <el-button>Download</el-button>
        </a>
      </el-col>
      <el-col :span="12" class="col-right">
        <p style="font-size: 20px">Import graph</p>
        <el-select
          v-model="importFormat"
          placeholder="Import format"
          style="margin-bottom: 30px; max-width: 150px"
        >
          <el-option
            v-for="item in importFormats"
            :key="item"
            :label="item"
            :value="item"
            style="text-align: center"
          />
        </el-select>
        <input
          id="upload-input"
          type="file"
          @change="fileUploaded"
          :accept="'.' + importFormat"
          hidden
        />
        <el-button @click="upload">Upload file</el-button>
        <span style="color: red" v-if="showError">
          Uploaded file was incorrect
        </span>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { key, State } from "../store";
import { getFormater } from "../js/Utils/FileUtils";

export default defineComponent({
  name: "WelcomeWindow",
  setup(props, { emit }) {
    const store = useStore<State>(key);
    return {
      store,
      emit,
    };
  },
  data() {
    return {
      dialogVisible: false,
      downloadUrl: "",
      showError: false,
      exportFormat: "gdf",
      importFormat: "gdf",
      exportFormats: ["gdf"],
      importFormats: ["gdf"],
    };
  },
  methods: {
    download() {
      const formater = getFormater(this.exportFormat);
      this.downloadUrl = formater.exportStage();
    },
    upload() {
      document.getElementById("upload-input")!.click();
    },
    async fileUploaded(event: any) {
      this.showError = false;
      const formater = getFormater(this.importFormat);
      const result = await formater.importStage(event!.target.files[0]);
      if (result) this.dialogVisible = false;
      else this.showError = true;
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
