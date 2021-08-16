export default class ApiManager {
  constructor(boardManager) {
    this.boardManager = boardManager;
  }

  receiveVertex(vertexAttrs) {
    this.boardManager.createVertex(
      { x: vertexAttrs.x, y: vertexAttrs.y },
      vertexAttrs
    );
  }
}
