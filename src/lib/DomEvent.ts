
export interface ElementInteractionEvents {
  start?: (e: MouseEvent) => void;
  mouseMove: (e: MouseEvent) => void;
  finish?: (e: MouseEvent) => void;
}

/**
 * 対象のElementをクリックしたらDocumentにイベントを登録し、クリックを離したら解除する
 * @param element 対象のElement
 * @param events 登録するイベントセット
 * @returns 全てのイベントを解除する関数 (クリック中に解除すると`events.finish`は呼ばれません)
 */
export function handleElementInteraction(element: HTMLElement, events: ElementInteractionEvents) {
  let isHandling = false;
  element.addEventListener("mousedown", onMouseDown);

  return () => {
    element.removeEventListener("mousedown", onMouseDown);
    if (isHandling) {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  };

  function onMouseDown(e: MouseEvent) {
    if (isHandling) return;
    isHandling = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    events.start?.(e);
  }
  function onMouseMove(e: MouseEvent) {
    events.mouseMove(e);
  }
  function onMouseUp(e: MouseEvent) {
    if (!isHandling) return;
    isHandling = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    events.finish?.(e);
  }
}