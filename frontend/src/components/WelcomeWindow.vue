<template>
  <el-dialog
    v-model="dialogVisible"
    title="Welcome"
    width="50%"
    center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <el-row class="main-row">
      <el-col :span="8" class="col-left">
        <p style="font-size: 20px">Create new room</p>
        <el-button :disabled="true" class="col-btn" type="primary">
          Create
        </el-button>
      </el-col>
      <el-col :span="8" class="col-middle">
        <p style="font-size: 20px">Join existing room</p>
        <el-form>
          <el-form-item>
            <el-input placeholder="Room ID" v-model="roomId"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          v-loading="joining"
          @click="tryToJoin"
          type="primary"
          class="col-btn"
        >
          <span>Join</span>
        </el-button>
        <span style="color: red" v-if="failedToJoin">
          Failed to join a room
        </span>
      </el-col>
      <el-col :span="8" class="col-right">
        <p style="font-size: 20px">Use the table in offline mode</p>
        <el-button @click="drawOffline" type="primary">
          Start drawing
        </el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import ApiManager from "../js/SignalR/ApiHandler";
import BoardHub from "../js/SignalR/Hub";
import BoardManager from "../js/KonvaManager/BoardManager";
import { useStore } from "vuex";
import { key, State } from "../store";
export default defineComponent({
  name: "WelcomeWindow",
  emits: ["connectionResult"],
  setup(props, { emit }) {
    const store = useStore<State>(key);
    return {
      store,
      emit,
    };
  },
  data() {
    return {
      dialogVisible: true,
      roomId: "",
      joining: false,
      creating: false,
      failedToJoin: false,
    };
  },
  methods: {
    async tryToJoin() {
      this.failedToJoin = false;
      const boardManager = new BoardManager(this.store);
      const apiManager = new ApiManager(boardManager, this.store);
      const hub = new BoardHub(apiManager, this.store);
      this.joining = true;
      await hub?.joinRoomPromise().catch(async () => {
        this.joining = false;
        this.failedToJoin = true;
      });
      if (this.failedToJoin) return;
      this.emit("connectionResult", {
        type: "join",
        hub: hub,
        boardManager: boardManager,
      } as any);
      this.dialogVisible = false;
    },
    drawOffline() {
      this.emit("connectionResult", {
        type: "offline",
      } as any);
      this.dialogVisible = false;
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
.col-middle {
  border-right: 1px solid rgba(0, 0, 0, 0.2);
  padding: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.col-btn {
  min-width: 125px;
}
.col-right {
  padding: 25px 0 25px 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.main-row {
  min-height: 231px;
}
</style>
