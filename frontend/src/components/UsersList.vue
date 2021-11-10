<template>
  <div class="users-list-main">
    <div v-if="roomId !== '' && roomId != null" class="room-id">
      <span>Room ID:</span>
      <strong>{{ roomId }}</strong>
      <el-button class="copy-btn" @click="$copyText(roomId)">
        <img :src="require('../assets/buttons/copy.svg')" />
      </el-button>
    </div>
    <div class="users-list">
      <el-scrollbar height="400px">
        <div v-for="(user, index) in users" :key="index" class="user">
          <div
            class="user-circle"
            :style="'border: solid 4px ' + user.userColor"
          >
            <img
              class="user-icon"
              :src="require('../assets/users/avatar.svg')"
            />
          </div>
          <span style="margin-right: auto; margin-left: 5px" class="username">
            {{ user.id }}
          </span>

          <div
            @click="changeUserPermission(user)"
            v-bind:class="
              myRole === 'Owner'
                ? 'user-icon user-icon-for-owner-view '
                : 'user-icon'
            "
          >
            <img
              v-if="user.role === 'Viewer'"
              :src="require('../assets/users/viewer.svg')"
            />
            <img
              v-if="user.role === 'Editor'"
              :src="require('../assets/users/editor.svg')"
            />
            <img
              v-if="user.role === 'Owner'"
              :src="require('../assets/users/owner.svg')"
            />
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
import BoardHub from "@/js/SignalR/Hub";
import { User, UserRole } from "@/js/SignalR/User";
import { key, State } from "@/store";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  setup() {
    const store = useStore<State>(key);
    let roomId = computed(() => {
      return store.state.roomId;
    });
    const users = computed(() => {
      return store.state.allUsers;
    });
    const myRole = computed(() => {
      return store.state.user.role;
    });
    return {
      roomId,
      store,
      users,
      myRole,
    };
  },
  methods: {
    async changeUserPermission(user: User) {
      if (this.myRole !== UserRole.Owner) return;
      const role =
        user.role === UserRole.Viewer ? UserRole.Editor : UserRole.Viewer;
      const hub = BoardHub.getBoardHub();
      await hub.setUserRole(user.id, role);
    },
  },
});
</script>

<style scoped lang="scss">
.copy-btn {
  width: 27px;
  height: 27px;
  min-height: 27px;
  padding: 5px;
  position: absolute;
  right: -38px;
  top: 2px;
  img {
    width: 16px;
  }
}
.users-list-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 5px;
  .room-id {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    font-size: 0.9em;
    position: relative;
    strong {
      font-size: 0.75em;
    }
  }
  .users-list {
    width: 100%;
    background-color: white;
    border: 1px lightgray solid;
    padding: 8px 0;
    .user {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border: 1px lightgray solid;
      background-color: #f6f6f6;
      border-radius: 3px;
      margin-bottom: 8px;
      margin-right: 8px;
      margin-left: 8px;
      padding: 7px 12px;
      .username {
        font-size: 0.95em;
      }
      .user-circle {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: 20px;
        border-width: 3px;
        background-color: white;
        .user-icon {
          width: 20px;
          height: 20px;
          margin-bottom: 1px;
        }
      }
      .user-icon {
        width: 20px;
        height: 20px;
        margin-bottom: 1px;
      }
      .user-icon-for-owner-view {
        cursor: pointer;
      }
    }
  }
}
</style>
