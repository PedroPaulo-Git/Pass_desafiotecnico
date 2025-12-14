import { useRef, useState, useCallback } from "react";
import { DRAG_THRESHOLD } from "../constants";

export function useDragToScroll(allowDragOnInteractive: boolean = false) {
  const dragRef = useRef<HTMLDivElement | null>(null);
  const isDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const activeViewportRef = useRef<HTMLElement | null>(null);
  const blockClickRef = useRef(false);

  const handleWindowPointerMove = useCallback((evt: PointerEvent) => {
    if (!isDownRef.current || !activeViewportRef.current) return;
    const x = evt.clientX;
    const walk = x - startXRef.current;

    const dx = evt.clientX - startXRef.current;

    if (!isDraggingRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDraggingRef.current = true;
      setIsGrabbing(true);
      blockClickRef.current = true;
      try {
        activeViewportRef.current.setPointerCapture(evt.pointerId);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      } catch (e) {
        console.log("error setting pointer capture", e);
      }
    }

    if (isDraggingRef.current) {
      evt.preventDefault(); // Impede seleção de texto nativa enquanto arrasta
      activeViewportRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
    // if (isDraggingRef.current) {
    //   const newLeft = scrollLeftRef.current - dx;
    //   activeViewportRef.current.scrollLeft = newLeft;
    // }
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

  const handleWindowPointerUp = useCallback(
    (evt: PointerEvent) => {
      if (!isDownRef.current) return;
      if (
        activeViewportRef.current &&
        activeViewportRef.current.hasPointerCapture(evt.pointerId)
      ) {
        try {
          activeViewportRef.current.releasePointerCapture(evt.pointerId);
        } catch {}
      }

      cleanup();
      // try {
      //   activeViewportRef.current?.releasePointerCapture?.(
      //     (evt as any).pointerId
      //   );
      // } catch {}
      // cleanup();
    },
    [cleanup]
  );

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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      blockClickRef.current = false;
      const target = e.target as HTMLElement;
      if (!allowDragOnInteractive) {
        // Check if the target is an interactive element
        const isInteractive = target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.closest('button, input, select, textarea, a');
        if (isInteractive) return; // Don't start drag on interactive elements
      }

      const viewport = dragRef.current?.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement | null || dragRef.current;
      if (!viewport) return;

      activeViewportRef.current = viewport;
      isDownRef.current = true;
      isDraggingRef.current = false;
      startXRef.current = e.clientX;
      scrollLeftRef.current = viewport.scrollLeft;

      // Removed setPointerCapture here, now done only when dragging starts

      window.addEventListener("pointermove", handleWindowPointerMove, true);
      window.addEventListener("pointerup", handleWindowPointerUp, true);
      // window.addEventListener("mousemove", handleWindowMouseMove);
      // window.addEventListener("mouseup", handleWindowMouseUp);

      try {
        document.body.style.userSelect = "none";
      } catch {}
    },
    [
      handleWindowPointerMove,
      handleWindowPointerUp,
      handleWindowMouseMove,
      handleWindowMouseUp,
    ]
  );

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    // Se houve movimento de arraste real, matamos o evento de clique aqui
    if (blockClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
      blockClickRef.current = false; // Reset para o próximo
    }
  }, []);

  return {
    dragRef,
    isGrabbing,
    onPointerDown,
    onClickCapture,
  };
}
