import { HubConnectionState } from "@microsoft/signalr";
import Konva from "konva";
import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";
import { createUser, User } from "./js/SignalR/User";

export interface State {
  isOnline: boolean;
  connectionState: HubConnectionState;
  stage?: Konva.Stage;
  currentLayer?: Konva.Layer;
  currentTool: string;
  layers: Konva.Layer[];
  user: User;
  roomId: string;
  allUsers: User[];
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    isOnline: false,
    stage: undefined,
    currentLayer: undefined,
    connectionState: HubConnectionState.Disconnected,
    currentTool: "Select",
    layers: [],
    roomId: "",
    user: createUser("Mikolaj"),
    allUsers: [
      createUser("Test User 1"),
      createUser("Test User 2"),
      createUser("Test User 3"),
    ],
  },
  getters: {
    isOnline(state) {
      return state.isOnline;
    },
    getUser(state) {
      return state.user;
    },
    getRoomId(state) {
      return state.roomId;
    },
    stage(state) {
      return state.stage;
    },
    getCurrentLayer(state) {
      return state.currentLayer;
    },
    getLayers(state) {
      return state.layers;
    },
    getCurrentTool(state) {
      return state.currentTool;
    },
    getConnectionState(state) {
      return state.connectionState;
    },
  },
  mutations: {
    setOnline(state) {
      state.isOnline = true;
    },
    setOffline(state) {
      state.isOnline = false;
    },
    setConnectionState(state, value) {
      state.connectionState = value;
    },
    setUser(state, user) {
      console.log("change of user");
      state.user = user;
    },
    setRoomId(state, roomId) {
      state.roomId = roomId;
    },
    setCurrentLayer(state, layer) {
      state.currentLayer = layer;
    },
    setStage(state, stage) {
      state.stage = stage;
    },
    setLayers(state, layers) {
      state.layers = layers;
    },
    addLayer(state, layer) {
      if (state.stage !== undefined) {
        state.stage.add(layer);
        state.layers = [...state.layers, layer];
      }
    },
    swapLayers(state, indexes: number[]) {
      const temp = state.layers[indexes[1]];
      state.layers[indexes[1]] = state.layers[indexes[0]];
      state.layers[indexes[0]] = temp;
    },
    setCurrentTool(state, tool) {
      state.currentTool = tool;
    },
  },
});
