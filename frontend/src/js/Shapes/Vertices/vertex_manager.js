import Konva from "konva";

export default {
  VertexManager,
};

function VertexManager(layer) {
  this.layer = layer;
  this.defaultConfig = {
    type: "v-circle",
    name: "unnamed",
    radius: 10,
    fill: "gray",
    stroke: "black",
    strokeWidth: 2,
    x: 0,
    y: 0,
  };
}

VertexManager.prototype.getConfig = function(mousePos) {
  const x = mousePos.x;
  const y = mousePos.y;
  this.defaultConfig.x = Math.round(x);
  this.defaultConfig.y = Math.round(y);
  return this.defaultConfig;
};

VertexManager.prototype.create = function(config) {
  config.draggable = true;
  const vertex = new Konva.Circle(config);
  vertex.id = parseInt(config.name);
  vertex.edges = [];
  return vertex;
};

VertexManager.prototype.draw = function(vertex) {
  this.layer.add(vertex);
  this.layer.draw();
};
