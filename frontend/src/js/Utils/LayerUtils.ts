import { Layer } from "konva/types/Layer";

export function sortItems(layer: Layer) {
  layer
    .getChildren((node) => node.getClassName() === "Circle")
    .each((vertex) => vertex.moveToBottom());
  layer
    .getChildren((node) => node.getClassName() === "Line") // the checking if it is edge by node.v1 probably didnt work anyway
    .each((line) => line.moveToBottom());
}
