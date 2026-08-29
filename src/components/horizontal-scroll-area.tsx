"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function HorizontalScrollArea({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [rect, setRect] = useState({ left: 0, width: 0 });
  const [visible, setVisible] = useState(false);
  const dragging = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const content =
      (wrapper.querySelector('[data-slot="table-container"]') as HTMLElement | null) ??
      (wrapper.firstElementChild as HTMLElement | null);
    if (!content) return;
    contentRef.current = content;

    function actualizarMedidas() {
      setScrollWidth(content!.scrollWidth);
      setClientWidth(content!.clientWidth);
      setScrollLeft(content!.scrollLeft);
      const r = content!.getBoundingClientRect();
      setRect({ left: r.left, width: r.width });
    }
    actualizarMedidas();

    const resizeObserver = new ResizeObserver(actualizarMedidas);
    resizeObserver.observe(content);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    intersectionObserver.observe(content);

    window.addEventListener("resize", actualizarMedidas);
    window.addEventListener("scroll", actualizarMedidas, true);
    content.addEventListener("scroll", actualizarMedidas);

    return () => {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("resize", actualizarMedidas);
      window.removeEventListener("scroll", actualizarMedidas, true);
      content.removeEventListener("scroll", actualizarMedidas);
    };
  }, []);

  const necesitaScroll = scrollWidth > clientWidth + 1;
  const thumbWidth = necesitaScroll ? Math.max((clientWidth / scrollWidth) * clientWidth, 40) : 0;
  const maxThumbOffset = clientWidth - thumbWidth;
  const maxScroll = scrollWidth - clientWidth;
  const thumbLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * maxThumbOffset : 0;

  const onThumbPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = { startX: e.clientX, startScrollLeft: contentRef.current?.scrollLeft ?? 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onThumbPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !contentRef.current) return;
      const deltaX = e.clientX - dragging.current.startX;
      const deltaScroll = (deltaX / maxThumbOffset) * maxScroll;
      contentRef.current.scrollLeft = dragging.current.startScrollLeft + deltaScroll;
    },
    [maxThumbOffset, maxScroll]
  );

  function onThumbPointerUp() {
    dragging.current = null;
  }

  function onTrackClick(e: React.MouseEvent) {
    if (!contentRef.current || !trackRef.current) return;
    if ((e.target as HTMLElement).dataset.thumb) return;
    const trackRectEl = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - trackRectEl.left;
    const ratio = clickX / trackRectEl.width;
    contentRef.current.scrollLeft = ratio * maxScroll;
  }

  return (
    <div ref={wrapperRef}>
      {children}
      {necesitaScroll && visible ? (
        <div
          ref={trackRef}
          onClick={onTrackClick}
          className="fixed bottom-0 z-30 flex h-4 items-center border-t border-border bg-card/95 shadow-[0_-4px_12px_rgba(0,0,0,0.25)] backdrop-blur"
          style={{ left: rect.left, width: rect.width }}
        >
          <div
            data-thumb
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            className="h-2.5 cursor-grab rounded-full bg-primary/70 transition-colors hover:bg-primary active:cursor-grabbing"
            style={{ width: thumbWidth, transform: `translateX(${thumbLeft}px)` }}
          />
        </div>
      ) : null}
    </div>
  );
}
