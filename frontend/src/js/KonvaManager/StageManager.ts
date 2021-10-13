import { store } from "@/store";
import Konva from "konva";
import { Cordinates } from "./VertexManager";

class StageManager {
  draw(vertex: any) {
    throw new Error("Method not implemented.");
  }
  get stage() {
    const stage = store.state.stage;
    if (stage) return stage;
    else throw Error("Attempt to get stage when it is undefined");
  }

  findById(id: string) {
    return this.stage.findOne(`#${id}`); //konva uses id as selector so # is required
  }

  getMousePosition(): Cordinates {
    const cords = this.stage.getPointerPosition();
    if (cords === null)
      throw Error("Pointer positions is null but it wasnt expected");
    return cords;
  }
}

export const stageManager = new StageManager();
