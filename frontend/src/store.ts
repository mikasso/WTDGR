// store.ts
import Konva from "konva";
import { createStore, Store } from "vuex";

// define your typings for the store state
export interface State {
  isOnline: boolean;
  stage?: Konva.Stage;
  currentLayer?: Konva.Layer;
  layers: Konva.Layer[];
}

// define injection key
export interface InjectionKey<T> extends Symbol {}
export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    isOnline: true,
    stage: undefined,
    currentLayer: undefined,
    layers: [],
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
  },
});
