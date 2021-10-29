import Konva from "konva";
import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";

export interface State {
  isOnline: boolean;
  stage?: Konva.Stage;
  currentLayer?: Konva.Layer;
  currentTool: string;
  layers: Konva.Layer[];
  user: { userId: string; roomId: string; role?: string };
  userColor: string;
}

export const key: InjectionKey<Store<State>> = Symbol();

function selectColor(number: number) {
  const hue = number * 137.508;
  return `hsl(${hue},50%,75%)`;
}

export const store = createStore<State>({
  state: {
    isOnline: true,
    stage: undefined,
    currentLayer: undefined,
    currentTool: "Select",
    userColor: selectColor(Math.floor(Math.random() * 10)),
    layers: [],
    user: { userId: Math.random().toString(), roomId: "1" },
  },
  getters: {
    isOnline(state) {
      return state.isOnline;
    },
    getUserColor(state) {
      return state.userColor;
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
    setUserColor(state, color) {
      state.userColor = color;
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
