import { useEffect } from "react";

export function useDragToScroll(ref: React.RefObject<HTMLElement> | null) {
  useEffect(() => {
    const el = ref && "current" in ref ? ref.current : null;
    if (!el) return;

    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    const DRAG_THRESHOLD = 6; // pixels to move before we treat as drag

    const onPointerDown = (e: PointerEvent) => {
      // only primary button
      // @ts-ignore
      if (e.button && e.button !== 0) return;
      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
      try {
        // @ts-ignore
        el.setPointerCapture(e.pointerId);
      } catch {}
      // set a grab cursor, actual 'grabbing' will be set once dragging starts
      el.style.cursor = "grab";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const x = e.clientX;
      const walk = startX - x; // positive = scroll right

      if (!isDragging && Math.abs(walk) >= DRAG_THRESHOLD) {
        isDragging = true;
        // visually indicate active drag
        el.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }

      if (isDragging) {
        el.scrollLeft = scrollLeft + walk;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      // release pointer capture
      try {
        // @ts-ignore
        el.releasePointerCapture(e.pointerId);
      } catch {}

      if (isDragging) {
        // brief delay to allow click prevention to run if needed
        setTimeout(() => {
          isDragging = false;
          el.style.cursor = "grab";
          document.body.style.userSelect = "";
        }, 0);
      } else {
        // restore usual cursor
        el.style.cursor = "";
      }
    };

    // Prevent click activation when a drag occurred
    const onClick = (ev: MouseEvent) => {
      if (isDragging) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };

    // Provide a small hit target cursor and touch behavior
    el.style.touchAction = "pan-y"; // allow vertical native scroll, intercept horizontal
    el.style.cursor = "grab";

    // Use capture on pointerdown so we intercept events that start on child
    // elements (like tab triggers) before their handlers run.
    el.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("click", onClick, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("click", onClick, true);
      el.style.cursor = "";
      el.style.touchAction = "";
      document.body.style.userSelect = "";
    };
  }, [ref]);
}

export default useDragToScroll;
