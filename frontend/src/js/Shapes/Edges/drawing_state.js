export { DrawingState, NotDrawingState };

function DrawingState() {
  console.log(" drawing");
}

DrawingState.prototype.startDrawing = function(callback) {
  callback();
  return this;
};

DrawingState.prototype.mouseMove = function(callback) {
  callback();
  return this;
};

DrawingState.prototype.mouseUp = function name() {
  return new NotDrawingState();
};

function NotDrawingState() {
  console.log("not drawing");
}

NotDrawingState.prototype.startDrawing = function(callback) {
  callback();
  return new DrawingState();
};

NotDrawingState.prototype.mouseMove = function() {
  return this;
};

NotDrawingState.prototype.mouseUp = function() {
  return this;
};
