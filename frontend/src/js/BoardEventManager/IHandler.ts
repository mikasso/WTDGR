import BaseBoardEventManager from "./BaseBoardEventManager";

export interface IHandler {
  setActive(eventManager: BaseBoardEventManager): void;
  clearIntervals(): void;
}
