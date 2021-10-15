import { KonvaEventObject } from "konva/types/Node";

export function isLeftClick(event: KonvaEventObject<any>) {
  return event.evt.which === 1;
}

export function isRightClick(event: KonvaEventObject<any>) {
  return event.evt.which === 3;
}

export function getPointFromEvent(event: KonvaEventObject<any>) {
  return {
    x: event.evt.layerX,
    y: event.evt.layerY,
  };
}

export function poll<T>(params: {
  fn: () => T;
  validate: (result: T) => boolean;
  interval: number;
  maxAttempts: number;
}) {
  let attempts = 0;
  const { fn, validate, interval, maxAttempts } = params;
  const executePoll = async () => {
    const result = await fn();
    attempts++;

    if (validate(result)) {
      return result;
    } else if (maxAttempts && attempts === maxAttempts) {
      throw new Error("Exceeded max attempts");
    } else {
      setTimeout(executePoll, interval);
    }
  };

  return new Promise(executePoll);
}
