import { useEffect, useRef, useState } from 'react';

/** A subtle branded pointer for mouse/trackpad users; touch users keep the native cursor. */
export function VisitRwandaCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (hover: hover)');
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener('change', update);

    const cursor = cursorRef.current;
    if (!cursor) return () => media.removeEventListener('change', update);

    let frame = 0;
    let x = -100;
    let y = -100;
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
        cursor.classList.add('visible');
        frame = 0;
      });
    };
    const enter = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a, button, input, select, textarea, [role="button"]')) cursor.classList.add('cursor-active');
    };
    const leave = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('a, button, input, select, textarea, [role="button"]')) cursor.classList.remove('cursor-active');
    };
    const hide = () => cursor.classList.remove('visible');
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', enter);
    document.addEventListener('pointerout', leave);
    document.addEventListener('pointerleave', hide);

    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', enter);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('pointerleave', hide);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!enabled) return null;
  return <div ref={cursorRef} className="cursor-base" aria-hidden="true"><span className="cursor-ring" /><span className="cursor-dot" /></div>;
}
