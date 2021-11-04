<template>
  <el-dialog
    v-model="isOpened"
    title="Connection menu"
    width="60%"
    center
    :close-on-click-modal="false"
  >
    <el-row class="main-row">
      <el-col :span="8" class="col-left">
        <p style="font-size: 20px">Create new room</p>
        <el-form>
          <el-form-item>
            <el-input placeholder="Your name" v-model="ownerId"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          @click="create"
          class="col-btn"
          type="primary"
          v-bind:disabled="isOwnerIdInvalid"
        >
          Create
        </el-button>
      </el-col>

      <el-col :span="8" class="col-middle">
        <p style="font-size: 20px">Join existing room</p>
        <el-form>
          <el-form-item>
            <el-input
              placeholder="Your name"
              v-model="userId"
              style="margin-bottom: 10px"
            ></el-input>
            <el-input placeholder="Room ID" v-model="roomId"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          v-loading="joining"
          @click="tryToJoin"
          type="primary"
          class="col-btn"
          v-bind:disabled="isUserDataInvalid"
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
import BoardHub from "@/js/SignalR/Hub";
import { createUser, UserTypes } from "@/js/SignalR/User";
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { key, State, store } from "../store";

const isNameInvalid = (name: string) => name.match("^[^0-9][^@#]+$") === null;

export default defineComponent({
  name: "WelcomeWindow",
  setup(props) {
    const store = useStore<State>(key);
    return {
      store,
    };
  },
  data() {
    const userId = store.state.user.userId;
    const roomId = store.state.roomId;
    return {
      roomId: roomId,
      userId: userId,
      ownerId: userId,
      isOpened: true,
      joining: false,
      creating: false,
      failedToJoin: false,
    };
  },
  computed: {
    isUserDataInvalid: function (): boolean {
      return this.roomId === "" || isNameInvalid(this.userId);
    },
    isOwnerIdInvalid: function (): boolean {
      return isNameInvalid(this.ownerId);
    },
  },
  methods: {
    open() {
      this.userId = store.state.user.userId;
      this.roomId = store.state.roomId;
      this.isOpened = true;
    },
    async tryToJoin() {
      const hub = BoardHub.getBoardHub();
      await hub.disconnect();
      this.roomId = this.roomId.trim();
      this.store.commit("setUser", createUser(this.userId));
      this.store.commit("setRoomId", this.roomId);
      this.store.commit("setOnline");
      this.isOpened = false;
    },
    drawOffline() {
      this.store.commit("setRoomId", "");
      this.store.commit("setOffline");
      this.isOpened = false;
    },
    async create() {
      const hub = BoardHub.getBoardHub();
      await hub.disconnect();
      this.store.commit("setUser", createUser(this.ownerId, UserTypes.Owner));
      hub.createRoom().then(() => (this.isOpened = false));
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
.el-input {
  margin-bottom: 1%;
}
</style>
