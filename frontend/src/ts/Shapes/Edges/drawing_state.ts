export interface EdgeManagerState {
  startDrawing(callback: () => void): EdgeManagerState;
  mouseMove(callback: () => void): EdgeManagerState;
  mouseUp(): EdgeManagerState;
}

export class DrawingState implements EdgeManagerState {
  startDrawing(callback: () => void): EdgeManagerState {
    callback();
    return this;
  }
  mouseMove(callback: () => void): EdgeManagerState {
    callback();
    return this;
  }
  mouseUp(): EdgeManagerState {
    return new NotDrawingState();
  }
}

export class NotDrawingState implements EdgeManagerState {
  startDrawing(callback: () => void): EdgeManagerState {
    callback();
    return new DrawingState();
  }
  mouseMove(): EdgeManagerState {
    return this;
  }
  mouseUp(): EdgeManagerState {
    return this;
  }
}
