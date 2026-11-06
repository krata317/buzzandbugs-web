import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (!element) return;
      if (event.target instanceof Node && element.contains(event.target)) return;
      handlerRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, ref]);
}
