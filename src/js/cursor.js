export function initCursor() {
  const cursorEl = document.querySelector('.custom-cursor');
  if (!cursorEl) return;

  window.addEventListener(
    'mousemove',
    (e) => {
      cursorEl.style.transform = `translate3d(${e.clientX - 11}px, ${
        e.clientY - 1
      }px, 0)`;
    },
    { passive: true }
  );
}