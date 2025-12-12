import { useRef, useState, useCallback } from "react";
import { DRAG_THRESHOLD } from "../constants";

export function useDragToScroll() {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const activeViewportRef = useRef<HTMLElement | null>(null);

  const handleWindowPointerMove = useCallback((evt: PointerEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;

    if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
    }

    if (isDraggingRef.current) {
      const newLeft = scrollLeftRef.current - dx;
      activeViewportRef.current.scrollLeft = newLeft;
    }
  }, []);

  const cleanup = useCallback(() => {
    isDownRef.current = false;
    isDraggingRef.current = false;
    setIsGrabbing(false);
    activeViewportRef.current = null;
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
    try {
      document.body.style.userSelect = "";
    } catch {}
  }, []);

  const handleWindowPointerUp = useCallback((evt: PointerEvent) => {
    if (!isDownRef.current) return;
    try {
      activeViewportRef.current?.releasePointerCapture?.((evt as any).pointerId);
    } catch {}
    cleanup();
  }, [cleanup]);

  const handleWindowMouseMove = useCallback((evt: MouseEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const dx = evt.clientX - startXRef.current;

    if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
    }

    if (isDraggingRef.current) {
      const newLeft = scrollLeftRef.current - dx;
      activeViewportRef.current.scrollLeft = newLeft;
    }
  }, []);

  const handleWindowMouseUp = useCallback(() => {
    if (!isDownRef.current) return;
    cleanup();
  }, [cleanup]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, input, [role="checkbox"], [data-radix-popper-content-wrapper]'
      )
    ) {
      return;
    }

    const viewport = dragRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null;
    if (!viewport) return;
    
    activeViewportRef.current = viewport;
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = viewport.scrollLeft;
    
    try {
      viewport.setPointerCapture?.(e.pointerId);
    } catch {}
    
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    
    try {
      document.body.style.userSelect = "none";
    } catch {}
  }, [handleWindowPointerMove, handleWindowPointerUp, handleWindowMouseMove, handleWindowMouseUp]);

  return {
    dragRef,
    isGrabbing,
    onPointerDown,
  };
}
