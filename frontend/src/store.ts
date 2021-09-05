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
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    isOnline: true,
    stage: undefined,
    currentLayer: undefined,
    currentTool: "Select",
    layers: [],
    user: { userId: Math.random().toString(), roomId: "1" },
  },
  getters: {
    isOnline(state) {
      return state.isOnline;
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
      console.log(layer);
      state.currentLayer = layer;
    },
    setLayers(state, layers) {
      state.layers = layers;
    },
    setStage(state, stage) {
      state.stage = stage;
    },
    addLayer(state, layer) {
      if (state.stage !== undefined) {
        state.stage.add(layer);
        state.layers = [...state.layers, layer];
        console.log(state.layers);
      }
    },
    setCurrentTool(state, tool) {
      state.currentTool = tool;
    },
  },
});
