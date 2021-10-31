<template>
  <div class="users-list-main">
    <div v-if="roomId != null" class="room-id" style="font-size: 20px">
      <span>Room ID:</span>
      <strong>{{ roomId }}</strong>
    </div>
    <div class="users-list">
      <el-scrollbar height="400px">
        <div v-for="(user, index) in users" :key="index" class="user">
          <img class="user-icon" :src="require('../assets/tools/user.svg')" />
          <span style="margin-right: auto; margin-left: 5px;">
            {{ user.id }}
          </span>
          <span>{{ user.role == null ? "-" : user.role }}</span>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script lang="ts">
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
    return {
      roomId,
      store,
      users,
    };
  },
});
</script>

<style scoped lang="scss">
.users-list-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 5px;
  .room-id {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    span {
      font-size: 14px;
    }
    strong {
      font-size: 18px;
    }
  }
  .users-list {
    width: 100%;
    background-color: white;
    border: 1px lightgray solid;
    padding: 10px 0;
    .user {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border: 1px lightgray solid;
      background-color: #f6f6f6;
      border-radius: 3px;
      margin-bottom: 5px;
      margin-right: 12px;
      margin-left: 12px;
      padding: 12px 12px;
      .user-icon {
        width: 20px;
        margin-bottom: 1px;
      }
    }
  }
}
</style>
