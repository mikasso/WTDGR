const RightClickType = 3;

MouseEvent.prototype.getPoint = function() {
  return {
    x: this.layerX,
    y: this.layerY,
  };
};

MouseEvent.prototype.isRightClick = function() {
  return this.which == RightClickType;
};
