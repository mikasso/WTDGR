import Konva from "konva";
import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";

export interface State {
  isOnline: boolean;
  stage?: Konva.Stage;
  currentLayer?: Konva.Layer;
  currentTool: string;
  layers: Konva.Layer[];
  roomId: string;
  user: User;
  allUsers: User[];
}

export const key: InjectionKey<Store<State>> = Symbol();

export class User {
  id: string;
  role?: string;
  constructor(id: string) {
    this.id = id;
  }
}

export const store = createStore<State>({
  state: {
    isOnline: false,
    stage: undefined,
    currentLayer: undefined,
    currentTool: "Select",
    layers: [],
    roomId: "1",
    user: { id: Math.random().toString() },
    allUsers: [
      new User("Test User 1"),
      new User("Test User 2"),
      new User("Test User 3"),
    ],
  },
  getters: {
    isOnline(state) {
      return state.isOnline;
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
  },
  mutations: {
    setOnline(state) {
      state.isOnline = true;
    },
    setOffline(state) {
      state.isOnline = false;
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
