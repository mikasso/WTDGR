export function sortItems(layer) {
  layer
    .getChildren((node) => node.getClassName() === "Circle")
    .forEach((vertex) => vertex.moveToBottom());
  layer
    .getChildren((node) => node.getClassName() === "Line" && node.v1)
    .forEach((vertex) => vertex.moveToBottom());
}
