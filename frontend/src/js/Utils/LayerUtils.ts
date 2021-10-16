import { Layer } from "konva/types/Layer";
import { ClassNames } from "../KonvaManager/ClassNames";

export function sortItems(layer: Layer) {
  layer
    .getChildren((node) => node.getClassName() === ClassNames.Vertex)
    .each((vertex) => vertex.moveToBottom());
  layer
    .getChildren((node) => node.getClassName() === ClassNames.Edge)
    .each((line) => line.moveToBottom());
}

export function layerAsDTO(layer: Layer) {
  return {
    type: "Layer",
    id: layer.id(),
  };
}
