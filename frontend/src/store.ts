import Konva from "konva";
import { InjectionKey } from "vue";
import { createStore, Store } from "vuex";

export interface User {
  userId: string;
  role?: UserTypes;
  userColor?: string;
}

enum UserTypes {
  Owner,
}

function createUser(id: string): User {
  return {
    userId: id,
    role: UserTypes.Owner,
    userColor: selectColor(Math.floor(Math.random() * 10)),
  };
}
export interface State {
  isOnline: boolean;
  stage?: Konva.Stage;
  currentLayer?: Konva.Layer;
  currentTool: string;
  layers: Konva.Layer[];
  user: User;
  roomId: string;
  allUsers: User[];
}

export const key: InjectionKey<Store<State>> = Symbol();

function selectColor(number: number) {
  const hue = number * 137.508;
  return `hsl(${hue},50%,75%)`;
}

export const store = createStore<State>({
  state: {
    isOnline: false,
    stage: undefined,
    currentLayer: undefined,
    currentTool: "Select",
    layers: [],
    roomId: "1",
    user: createUser(Math.random.toString()),
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
    setUser(state, user) {
      state.user = user;
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
