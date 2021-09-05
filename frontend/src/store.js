import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    isOnline: true,
    stage: null,
    currentLayer: null,
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
      state.stage.add(layer);
      state.layers = [...state.layers, layer];
      console.log(state.layers);
    },
  },
});
