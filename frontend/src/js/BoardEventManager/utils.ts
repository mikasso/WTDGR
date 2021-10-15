export function isLeftClick(event: { evt: { which: number } }) {
  return event.evt.which === 1;
}

export function isRightClick(event: { evt: { which: number } }) {
  return event.evt.which === 3;
}
